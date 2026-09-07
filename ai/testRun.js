require("dotenv").config();
const fs = require("fs");
const { generateProduct } = require("./src/product/productService");

async function main() {
  const imageBuffer = fs.readFileSync("./test.jpg");
  const imageBase64 = imageBuffer.toString("base64");

  const result = await generateProduct({
    image: imageBase64,
    transcript: "This is a handmade clay pot I made in three days.",
    language: "en",
    artisanAnswers: { suggestedPrice: 900 }
  });

  console.log(JSON.stringify(result, null, 2));
}

main();