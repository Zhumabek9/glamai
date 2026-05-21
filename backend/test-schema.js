const Replicate = require('replicate');
require('dotenv').config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  try {
    const model = await replicate.models.get("flux-kontext-apps", "change-haircut");
    console.log("Model Info:", model);
    if (model.latest_version) {
      console.log("Latest Version Schema:", JSON.stringify(model.latest_version.openapi_schema, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
