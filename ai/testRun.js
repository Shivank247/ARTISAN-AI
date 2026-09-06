require("dotenv").config();
const { generateProduct } = require("./src/product/productService");

async function main() {
  const result = await generateProduct({
    image: null,
    transcript: "This is a handmade clay bowl I made in three days.",
    language: "en",
    artisanAnswers: {}
  });

  console.log(JSON.stringify(result, null, 2));
}

main();