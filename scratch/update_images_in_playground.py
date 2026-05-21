import os
import re
import json

PLAYGROUND_PATH = r"c:\Users\juma9\Documents\ai-hairstyle-changer\src\components\Playground.jsx"
STYLES_DIR = r"c:\Users\juma9\Documents\ai-hairstyle-changer\public\styles"

def main():
    # 1. List all files in public/styles
    files = os.listdir(STYLES_DIR)
    generated_map = {}
    for filename in files:
        if filename.endswith(".webp"):
            # format is gender_styleid.webp
            parts = filename.split("_", 1)
            if len(parts) == 2:
                gender, rest = parts
                style_id = rest[:-5]  # remove .webp
                generated_map[(style_id, gender)] = f"/styles/{filename}"

    # 2. Read Playground.jsx
    with open(PLAYGROUND_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # 3. Parse HAIRSTYLES array
    match = re.search(r"const HAIRSTYLES = \[(.*?)\];", content, re.DOTALL)
    if not match:
        print("Error: Could not find HAIRSTYLES array in Playground.jsx")
        return
        
    array_content = match.group(1)
    
    # Parser using regex to extract each object
    pattern = r"\{[^}]+\}"
    updated_lines = []
    
    for m in re.finditer(pattern, array_content):
        try:
            style = json.loads(m.group(0))
            if not style.get("isSpecial"):
                style_id = style["id"]
                gender = style["gender"]
                # If there's a generated image, update the path
                key = (style_id, gender)
                if key in generated_map:
                    style["image"] = generated_map[key]
            
            line = "  " + json.dumps(style, ensure_ascii=False)
            updated_lines.append(line)
        except Exception as e:
            print(f"Skipping line due to parse error: {m.group(0)} - {e}")

    # Format HAIRSTYLES array for JS
    js_array = "const HAIRSTYLES = [\n" + ",\n".join(updated_lines) + "\n];"
    
    # Replace in original file content
    new_content = re.sub(r"const HAIRSTYLES = \[.*?\];", js_array, content, flags=re.DOTALL)
    
    with open(PLAYGROUND_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Successfully updated Playground.jsx with {len(generated_map)} generated WebP styles!")

if __name__ == "__main__":
    main()
