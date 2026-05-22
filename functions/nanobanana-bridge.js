'use strict';

const fs = require('fs');
const Replicate = require('replicate');

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

const HAIRCUT_MAP = {
    // Female/General
    "No Change": "No change",
    "No change": "No change",
    "no_change": "No change",
    "no-change": "No change",
    "Straight": "Straight",
    "Straightened": "Straightened",
    "Blunt Bangs": "Blunt Bangs",
    "Side-Swept Bangs": "Side-Swept Bangs",
    "Bob": "Bob",
    "Lob": "Lob",
    "Angled Bob": "Angled Bob",
    "A-Line Bob": "A-Line Bob",
    "Asymmetrical Bob": "Asymmetrical Bob",
    "Graduated Bob": "Graduated Bob",
    "Inverted Bob": "Inverted Bob",
    "Pixie Cut": "Pixie Cut",
    "Pageboy": "Pageboy",
    "Shag": "Shag",
    "Layered Shag": "Layered Shag",
    "Choppy Layers": "Choppy Layers",
    "Razor Cut": "Razor Cut",
    "Layered": "Layered",
    "Wavy": "Wavy",
    "Soft Waves": "Soft Waves",
    "Glamorous Waves": "Glamorous Waves",
    "Hollywood Waves": "Hollywood Waves",
    "Finger Waves": "Finger Waves",
    "Tousled": "Tousled",
    "Feathered": "Feathered",
    "Curly": "Curly",
    "Perm": "Perm",
    "Pin Curls": "Pin Curls",
    "Twist Out": "Twist Out",
    "High Ponytail": "High Ponytail",
    "Low Ponytail": "Low Ponytail",
    "Bubble Ponytail": "Bubble Ponytail",
    "Messy Bun": "Messy Bun",
    "Top Knot": "Top Knot",
    "Ballerina Bun": "Ballerina Bun",
    "Half-Up Top Knot": "Half-Up Top Knot",
    "Messy Bun with Headband": "Messy Bun with a Headband",
    "Half-Up Half-Down": "Half-Up, Half-Down",
    "Space Buns": "Space Buns",
    "Pigtails": "Pigtails",
    "Hair Bow": "Hair Bow",
    "Dutch Braid": "Dutch Braid",
    "French Braid": "French Braid",
    "Fishtail Braid": "Fishtail Braid",
    "French Fishtail Braid": "French Fishtail Braid",
    "Waterfall Braid": "Waterfall Braid",
    "Rope Braid": "Rope Braid",
    "Halo Braid": "Halo Braid",
    "Crown Braid": "Crown Braid",
    "Braided Crown": "Braided Crown",
    "Bubble Braid": "Bubble Braid",
    "Ballerina Braids": "Ballerina Braids",
    "Milkmaid Braids": "Milkmaid Braids",
    "Bohemian Braids": "Bohemian Braids",
    "Double Dutch Braids": "Double Dutch Braids",
    "Box Braids": "Box Braids",
    "Crochet Braids": "Crochet Braids",
    "Cornrows": "Cornrows",
    "Bantu Knots": "Bantu Knots",
    "Dreadlocks": "Dreadlocks",
    "Messy Chignon": "Messy Chignon",
    "French Twist Updo": "French Twist Updo",
    "French Roll": "French Roll",
    "Messy Updo": "Messy Updo",
    "Knotted Updo": "Knotted Updo",
    "Twisted Bun": "Twisted Bun",
    "Twisted Half-Updo": "Twisted Half-Updo",
    "Twist and Pin Updo": "Twist and Pin Updo",
    "Flat Twist": "Flat Twist",
    "Crown Twist": "Crown Twist",
    "Beehive": "Beehive",
    "Bouffant": "Bouffant",
    "Victory Rolls": "Victory Rolls",
    "Ombré": "Ombré",
    "Messy Fishtail Braid": "Messy Fishtail Braid",
    "Messy Bun with Scarf": "Messy Bun with a Scarf",

    // Male mapping to closest model options
    "Crew Cut": "Crew Cut",
    "Buzz Cut": "Crew Cut",
    "Ivy League": "Side-Parted",
    "Side Part": "Side-Parted",
    "Caesar Cut": "Crew Cut",
    "French Crop": "Crew Cut",
    "Textured Crop": "Crew Cut",
    "Flat Top": "Crew Cut",
    "Skin Fade": "Mohawk Fade",
    "High Fade": "Mohawk Fade",
    "Mid Fade": "Mohawk Fade",
    "Low Fade": "Mohawk Fade",
    "Taper Fade": "Mohawk Fade",
    "Drop Fade": "Mohawk Fade",
    "Burst Fade": "Mohawk Fade",
    "Quiff": "Slicked Back",
    "Pompadour": "Slicked Back",
    "Slick Back": "Slicked Back",
    "Comb Over": "Side-Parted",
    "Undercut": "Undercut",
    "Disconnected Undercut": "Undercut",
    "Faux Hawk": "Faux Hawk",
    "Mohawk": "Mohawk",
    "Textured Waves": "Wavy",
    "Man Bun": "Top Knot",
    "Half-Up Man Bun": "Half-Up Top Knot",
    "Long Straight": "Straight",
    "Long Wavy": "Wavy",
    "Curtains": "Center-Parted",
    "Flow": "Wavy",
    "Curly Top": "Curly",
    "Afro": "Curly",
    "Twist Out": "Twist Out",
    "Dreadlocks": "Dreadlocks",
    "Cornrows": "Cornrows",
    "Box Braids": "Box Braids",
    "Ducktail": "Slicked Back",
    "Rockabilly": "Slicked Back",
    "Liberty Spikes": "Mohawk",
    "Spiky": "Faux Hawk",
    "Bald": "Crew Cut"
};

const COLOR_MAP = {
    "AI Recommended": "Random",
    "No Change": "No change",
    "No change": "No change",
    "no_change": "No change",
    "no-change": "No change",
    "Jet Black": "Jet Black",
    "Blonde": "Blonde",
    "Blue Highlights": "Blue",
    "Pastel Pink": "Pink",
    "Black": "Black",
    "Blue-Black": "Blue-Black",
    "Dark Brown": "Dark Brown",
    "Medium Brown": "Medium Brown",
    "Light Brown": "Light Brown",
    "Chestnut": "Chestnut",
    "Mahogany": "Mahogany",
    "Ash Brown": "Ash Brown",
    "Brunette": "Brunette",
    "Caramel": "Caramel",
    "Golden Blonde": "Golden Blonde",
    "Honey Blonde": "Honey Blonde",
    "Strawberry Blonde": "Strawberry Blonde",
    "Platinum Blonde": "Platinum Blonde",
    "Ash Blonde": "Ash Blonde",
    "Auburn": "Auburn",
    "Copper": "Copper",
    "Burgundy": "Burgundy",
    "Silver": "Silver",
    "White": "White",
    "Titanium": "Titanium",
    "Rose Gold": "Rose Gold",
    "Red": "Red",
    "Blue": "Blue",
    "Purple": "Purple",
    "Pink": "Pink",
    "Green": "Green"
};

async function callNanoBanana(imagePath, options) {
    if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN environment variable is not set');
    }

    // Read local file into base64 data URI
    const fileBuffer = fs.readFileSync(imagePath);
    let mimeType = 'image/jpeg';
    if (imagePath.endsWith('.png')) mimeType = 'image/png';
    else if (imagePath.endsWith('.webp')) mimeType = 'image/webp';
    
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    const mappedHaircut = HAIRCUT_MAP[options.style] || options.style || 'No change';
    const mappedColor = COLOR_MAP[options.color] || options.color || 'No change';

    console.log(`[Replicate] Mapped inputs: style "${options.style}" -> "${mappedHaircut}", color "${options.color}" -> "${mappedColor}"`);
    console.log(`[Replicate] Calling model for gender: ${options.gender}, style: ${mappedHaircut}, color: ${mappedColor}`);

    try {
        const output = await replicate.run(
            "flux-kontext-apps/change-haircut",
            {
                input: {
                    gender: options.gender === 'male' || options.gender === 'female' ? options.gender : 'none',
                    haircut: mappedHaircut,
                    hair_color: mappedColor,
                    input_image: dataUri,
                    aspect_ratio: "match_input_image",
                    safety_tolerance: 2,
                    output_format: "png"
                }
            }
        );

        // The model output is typically a string URL or an array of URLs to the generated image(s)
        const finalUrl = Array.isArray(output) ? output[0] : (typeof output === 'string' ? output : (output && output.toString ? output.toString() : ''));
        console.log(`[Replicate] Success! Generated image URL: ${finalUrl}`);
        return {
            success: true,
            url: finalUrl
        };
    } catch (err) {
        console.error("[Replicate] API Error:", err);
        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = { callNanoBanana };
