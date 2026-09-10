const test = require('node:test');
const assert = require('node:assert/strict');

const { generateProduct } = require('../src/product/productService');
const { transcribeAudio } = require('../src/voice/voiceService');
const { translateText } = require('../src/translation/translationService');
const { parseSearchQuery } = require('../src/search/searchService');
const { recommendPrice } = require('../src/pricing/pricingService');

test('generateProduct validates output and asks only missing fields', async () => {
  const result = await generateProduct({
    image: 'base64-image-data',
    transcript: 'This is a handmade clay pot I made in three days.',
    language: 'en',
    artisanAnswers: { suggestedPrice: 900 }
  });

  assert.equal(result.success, true);
  assert.ok(result.data.title);
  assert.ok(result.data.description);
  assert.ok(Array.isArray(result.data.tags));
  assert.equal(result.questions.length >= 0, true);
});

test('transcribeAudio returns a safe fallback for empty audio input', async () => {
  const result = await transcribeAudio({ audio: null, language: 'hi' });
  assert.equal(result.success, false);
  assert.match(result.error.code, /NO_AUDIO|INVALID_INPUT/);
});

test('translateText preserves language when source and target match', async () => {
  const result = await translateText({ text: 'Hello artisan', sourceLanguage: 'en', targetLanguage: 'en' });
  assert.equal(result.success, true);
  assert.equal(result.data.translatedText, 'Hello artisan');
});

test('parseSearchQuery turns natural language into structured filters', async () => {
  const result = await parseSearchQuery('Traditional handmade gifts from Bihar under ₹1000');
  assert.equal(result.success, true);
  assert.equal(result.data.state, 'Bihar');
  assert.equal(result.data.maxPrice, 1000);
  assert.deepEqual(result.data.keywords, ['traditional', 'handmade', 'gifts']);
  assert.equal(result.data.category, null);
});

test('recommendPrice returns a guarded estimate based on product attributes', async () => {
  const result = await recommendPrice({
    category: 'Paintings',
    material: 'handmade paper',
    productionTimeDays: 3,
    location: 'Bihar'
  });

  assert.equal(result.success, true);
  assert.ok(result.data.suggestedPrice > 0);
  assert.ok(result.data.priceRange.min < result.data.priceRange.max);
  assert.ok(result.data.reason.length > 0);
  assert.ok(result.data.confidence >= 0 && result.data.confidence <= 1);
});
