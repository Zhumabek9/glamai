'use strict';

const fs = require('fs');
const path = require('path');

// Mock replicate client in the environment before loading nanobanana-bridge
process.env.REPLICATE_API_TOKEN = 'mock-token';

const { callNanoBanana } = require('./nanobanana-bridge');

// Temporarily replace replicate.run to capture the inputs
const Replicate = require('replicate');
let capturedInput = null;
Replicate.prototype.run = async function(model, options) {
    capturedInput = { model, options };
    return ['https://mock-output-url.png/image.png'];
};

async function runTests() {
    const testCases = [
        {
            name: "AI Makeup - Natural with Rose Pink Lipstick and Winged Cat Eye Eyeliner",
            options: {
                taskType: "makeup",
                makeup: "Natural style. Lipstick: Rose Pink. Eyeliner: Winged Cat Eye.",
                gender: "female"
            },
            expectedPromptContains: [
                "same woman",
                "no-makeup makeup look",
                "Modify only the makeup"
            ]
        },
        {
            name: "AI Beard - Stubble with Black tint",
            options: {
                taskType: "beard",
                beard: "Stubble style. Color tint: Black.",
                gender: "male"
            },
            expectedPromptContains: [
                "same man",
                "a light stubble beard",
                "Modify only the facial hair"
            ]
        },
        {
            name: "AI Nails - French style",
            options: {
                taskType: "nails",
                nails: "French style.",
                gender: "female"
            },
            expectedPromptContains: [
                "showing the hands of the same person",
                "classic French manicure nails",
                "Modify only the fingernails"
            ]
        },
        {
            name: "AI Retouch - Skin Smoothing, Teeth Whitening, Acne Removal, and Skin Glow",
            options: {
                taskType: "retouch",
                retouch: JSON.stringify({
                    smoothSkin: 50,
                    teethWhitening: 30,
                    eyeEnhancement: 0,
                    faceSymmetry: 0,
                    acneRemoval: true,
                    skinGlow: 40
                }),
                gender: "female"
            },
            expectedPromptContains: [
                "same woman",
                "smooth clear skin",
                "naturally whitened bright teeth",
                "complete removal of temporary acne, spots",
                "radiant dewy skin glow"
            ]
        }
    ];

    // Create a dummy file for testing
    const dummyFilePath = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(dummyFilePath, 'dummy image content');

    console.log("Running beauty pipeline unit tests...\n");

    let allPassed = true;
    for (const tc of testCases) {
        console.log(`--- Test Case: ${tc.name} ---`);
        capturedInput = null;
        
        const res = await callNanoBanana(dummyFilePath, tc.options);
        
        if (!res.success) {
            console.error(`FAIL: callNanoBanana failed: ${res.error}`);
            allPassed = false;
            continue;
        }

        if (capturedInput.model !== "xai/grok-imagine-image") {
            console.error(`FAIL: Expected model "xai/grok-imagine-image", got "${capturedInput.model}"`);
            allPassed = false;
            continue;
        }

        const prompt = capturedInput.options.input.prompt;
        const image = capturedInput.options.input.image;

        if (!image || !image.startsWith("data:image/jpeg;base64,")) {
            console.error("FAIL: Expected valid image data URI");
            allPassed = false;
        }

        console.log("Generated Prompt:\n" + prompt + "\n");

        for (const word of tc.expectedPromptContains) {
            if (!prompt.includes(word)) {
                console.error(`FAIL: Prompt does not contain: "${word}"`);
                allPassed = false;
            }
        }
    }

    // Clean up dummy file
    try { fs.unlinkSync(dummyFilePath); } catch (_) {}

    if (allPassed) {
        console.log("\nALL BEAUTY PIPELINE TESTS PASSED SUCCESSFULLY! ✅");
    } else {
        console.log("\nSOME BEAUTY PIPELINE TESTS FAILED. ❌");
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Error running beauty tests:", err);
    process.exit(1);
});
