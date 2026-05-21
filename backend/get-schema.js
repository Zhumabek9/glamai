const Replicate = require('replicate');
const fs = require('fs');
require('dotenv').config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  try {
    const model = await replicate.models.get("flux-kontext-apps", "change-haircut");
    if (model.latest_version) {
      fs.writeFileSync("schema.json", JSON.stringify(model.latest_version.openapi_schema, null, 2));
      console.log("Schema saved!");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
