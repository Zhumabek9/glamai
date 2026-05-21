import os
import re
import json
import time
import sys
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

# Reconfigure stdout/stderr to UTF-8 to prevent Unicode encoding crashes in Windows terminal (cp1251)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Configurations
API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")  # set via environment variable
PLAYGROUND_PATH = r"c:\Users\juma9\Documents\ai-hairstyle-changer\src\components\Playground.jsx"
OUTPUT_DIR = r"c:\Users\juma9\Documents\ai-hairstyle-changer\public\styles"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Parse hairstyles from Playground.jsx
def parse_styles():
    with open(PLAYGROUND_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    match = re.search(r"const HAIRSTYLES = \[(.*?)\];", content, re.DOTALL)
    if not match:
        print("Error: Could not find HAIRSTYLES array in Playground.jsx")
        return None, None
        
    array_content = match.group(1)
    
    # Parser using regex to extract each object
    pattern = r"\{[^}]+\}"
    extracted_styles = []
    for m in re.finditer(pattern, array_content):
        try:
            style = json.loads(m.group(0))
            extracted_styles.append(style)
        except:
            pass
            
    print(f"Parsed {len(extracted_styles)} styles using regex finder.")
    return extracted_styles, content

# Generate prompt based on style and gender
def get_prompt(name, gender):
    if gender == "female":
        return f"A high-quality close-up studio portrait photo of a young woman showing off a {name} hairstyle, beautiful hair, sharp focus, clean solid neutral studio background, photorealistic, professional lighting"
    else:
        return f"A high-quality close-up studio portrait photo of a young man showing off a {name} haircut, handsome hair, sharp focus, clean solid neutral studio background, photorealistic, professional lighting"

# Run a prediction on Replicate and return image URL
def generate_image(name, gender, max_retries=5):
    url = "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions"
    headers = {
        "Authorization": f"Token {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "input": {
            "prompt": get_prompt(name, gender)
        }
    }
    
    attempt = 0
    while attempt < max_retries:
        try:
            req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req) as res:
                resp = json.loads(res.read().decode("utf-8"))
                pred_id = resp["id"]
                
            # Poll for completion
            poll_url = f"https://api.replicate.com/v1/predictions/{pred_id}"
            poll_req = urllib.request.Request(poll_url, headers={"Authorization": f"Token {API_TOKEN}"})
            
            start_time = time.time()
            while time.time() - start_time < 90:  # Timeout after 90 seconds
                with urllib.request.urlopen(poll_req) as poll_res:
                    poll_resp = json.loads(poll_res.read().decode("utf-8"))
                    status = poll_resp["status"]
                    if status == "succeeded":
                        outputs = poll_resp.get("output")
                        if outputs and len(outputs) > 0:
                            return outputs[0]
                    elif status in ["failed", "canceled"]:
                        print(f"Generation failed for {name} with status {status}")
                        break
                time.sleep(2)
            
            # If polling times out, retry
            attempt += 1
                
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"Rate limited (429) for {name}. Retrying in 8 seconds (attempt {attempt+1}/{max_retries})...")
                time.sleep(8)
                attempt += 1
            else:
                try:
                    err_msg = e.read().decode('utf-8', errors='ignore')
                except:
                    err_msg = str(e)
                print(f"HTTP Error {e.code} for {name}: {err_msg}")
                time.sleep(3)
                attempt += 1
        except Exception as e:
            print(f"Error for {name}: {e}")
            time.sleep(3)
            attempt += 1
            
    return None

# Process single style
def process_style(style):
    if style.get("isSpecial"):
        return style
        
    style_id = style["id"]
    gender = style["gender"]
    name = style["name"]
    
    filename = f"{gender}_{style_id}.webp"
    local_path = os.path.join(OUTPUT_DIR, filename)
    web_path = f"/styles/{filename}"
    
    # Check if already generated
    if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
        # Just update style image to point to correct path
        style["image"] = web_path
        return style
        
    # Introduce random delay to offset initial parallel starts and avoid 429s
    time.sleep(1.5)
    
    print(f"Generating image for {name} ({gender})...")
    img_url = generate_image(name, gender)
    
    if img_url:
        # Download and save image
        try:
            urllib.request.urlretrieve(img_url, local_path)
            print(f"Successfully downloaded {name} to {web_path}")
            style["image"] = web_path
        except Exception as e:
            print(f"Failed to download image from {img_url} for {name}: {e}")
    else:
        print(f"Could not generate image for {name}")
        
    return style

def main():
    styles, original_content = parse_styles()
    if not styles:
        return
        
    # Process styles concurrently with lower concurrency to prevent 429
    updated_styles = []
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {executor.submit(process_style, style): style for style in styles}
        for future in as_completed(futures):
            style = futures[future]
            try:
                updated_style = future.result()
                updated_styles.append(updated_style)
            except Exception as e:
                print(f"Exception processing style {style.get('name')}: {e}")
                updated_styles.append(style)
                
    # Sort updated styles to match original order
    style_order = {s["id"]: i for i, s in enumerate(styles)}
    updated_styles.sort(key=lambda s: style_order.get(s["id"], 999))
    
    # Format HAIRSTYLES array for JS
    js_array = "const HAIRSTYLES = [\n"
    for style in updated_styles:
        line = "  " + json.dumps(style, ensure_ascii=False) + ",\n"
        js_array += line
    js_array += "];"
    
    # Replace in original file content
    pattern = r"const HAIRSTYLES = \[.*?\];"
    new_content = re.sub(pattern, js_array, original_content, flags=re.DOTALL)
    
    with open(PLAYGROUND_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print("Playground.jsx successfully updated with unique hairstyle preview images!")

if __name__ == "__main__":
    main()
