// Maps a product field to a simple, artisan-friendly question.
// Only fields worth asking about (not every possible null field) are included.
const QUESTION_MAP = {
  material: "What material did you use to make this?",
  suggestedPrice: "What price would you like to set for this?",
  category: "What category best describes this product?"
};

const QUESTION_MAP_HI = {
  material: "इसे बनाने के लिए आपने किस सामग्री का उपयोग किया?",
  suggestedPrice: "आप इस उत्पाद की क्या कीमत रखना चाहते हैं?",
  category: "यह उत्पाद किस श्रेणी में आता है?"
};

// Fields that are optional/derived and should NOT trigger a question
// even if null (keeps the flow from over-asking).
const SKIP_IF_NULL = ["priceRange"];

function generateQuestions(productData, language = "en") {
  const questions = [];
  const questionMap = language.toLowerCase().startsWith("hi") ? QUESTION_MAP_HI : QUESTION_MAP;

  for (const field of Object.keys(QUESTION_MAP)) {
    if (SKIP_IF_NULL.includes(field)) continue;

    const value = productData[field];
    const isMissing =
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0);

    if (isMissing) {
      questions.push({
        field,
        question: questionMap[field]
      });
    }
  }

  return questions;
}

module.exports = { generateQuestions };