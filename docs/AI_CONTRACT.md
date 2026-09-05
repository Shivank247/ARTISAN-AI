# ARTISAN AI — AI CONTRACT

Version: 1.0
Status: LOCKED FOR MVP

---

# 1. PURPOSE

This document defines how AI services communicate inside ARTISAN AI.

AI responsibilities are divided:

Suraj:
Core AI, product understanding, catalogue generation, prompts, AI questions, validation, providers.

Shiva:
Voice-to-text, multilingual input, translation, speech/voice interaction.

Shivani:
Natural-language search, price recommendation, recommendations if time permits, AI testing dataset.

---

# 2. CORE AI PRINCIPLE

ARTISAN AI is not an AI chatbot.

The AI exists to help an artisan become digitally sellable.

Core flow:

Photo
+
Voice
+
Simple AI questions
↓
AI
↓
Professional catalogue
↓
Price assistance
↓
Multilingual listing
↓
Artisan approval
↓
Marketplace

---

# 3. AI ARCHITECTURE

Frontend

↓

Backend API

↓

AI service layer

↓

External AI providers

AI provider credentials remain server-side.

Frontend must never contain AI provider API keys.

---

# 4. AI PROVIDER ABSTRACTION

The AI implementation should use a provider abstraction where practical.

Conceptually:

AI Service
↓
Provider Interface
├── Vision/LLM Provider
├── Speech-to-Text Provider
└── Translation Provider

Do not tightly couple the whole application to one provider unnecessarily.

The provider can be changed without rewriting the frontend.

---

# 5. PRODUCT UNDERSTANDING

Input:

image
+
artisan text

Example:

{
"imageUrl": "https://example.com/product.jpg",
"inputText": "यह मधुबनी पेंटिंग है। इसे बनाने में पांच दिन लगे।",
"language": "hi"
}

AI analyzes available information.

The AI must distinguish:

Observed information
from
Artisan-provided information
from
AI-generated marketing language.

The AI must not invent factual product claims.

---

# 6. PRODUCT GENERATION OUTPUT

Required structure:

{
"title": "...",
"description": "...",
"category": "...",
"material": "...",
"tags": [],
"suggestedPrice": 899,
"priceRange": {
"min": 799,
"max": 999
},
"confidence": 0.86
}

Field names are LOCKED.

Do not rename:

suggestedPrice

to:

recommendedPrice

without contract approval.

---

# 7. AI CONFIDENCE

Confidence must represent the AI's confidence in the generated interpretation.

Range:

0 to 1

Example:

0.86

Confidence does NOT mean:

"the product is definitely correct."

It is an indication for system handling and review.

---

# 8. AI HALLUCINATION RULE

The AI must not invent:

material
craft history
artisan credentials
geographic origin
certifications
product dimensions
ingredients
production claims
social impact claims

unless supported by the image, artisan input, database information, or explicitly provided facts.

If information is unknown, the AI should request clarification or leave it unknown.

---

# 9. AI QUESTIONS

The AI may ask simple questions to fill missing product information.

Examples:

"What price would you like to set?"

"What material did you use?"

"How many days did it take?"

"Would you like to share your current location?"

Questions should be:

short
clear
one at a time
appropriate to the selected language

Do not ask unnecessary questions.

---

# 10. QUESTION FLOW

Example:

AI identifies missing material.

↓

Question:

"What material did you use?"

↓

Artisan responds by voice.

↓

Voice-to-text.

↓

AI extracts the answer.

↓

Product draft is updated.

Then the next required question may be asked.

---

# 11. ARTISAN APPROVAL

AI-generated content is always a DRAFT first.

Correct:

AI generation
↓
DRAFT
↓
Questions
↓
Final AI listing
↓
Artisan review
↓
Artisan edits
↓
Artisan approval
↓
PUBLISHED

AI must never bypass artisan approval.

---

# 12. VOICE-TO-TEXT

Input:

audio
+
language

Output:

{
"text": "यह मधुबनी पेंटिंग है",
"language": "hi",
"confidence": 0.94
}

STT errors must be handled gracefully.

If speech cannot be understood:

ask the artisan to try again.

Do not fabricate a transcription.

---

# 13. LANGUAGE SUPPORT

MVP priority:

English
Hindi

Architecture should allow future language expansion.

Language flow:

Artisan selects language
↓
Voice/input
↓
STT
↓
AI processing
↓
Structured product information
↓
Translation when required
↓
Customer-facing listing

---

# 14. TRANSLATION

Input:

{
"text": "Traditional handmade Madhubani painting",
"sourceLanguage": "en",
"targetLanguage": "hi"
}

Output:

{
"translatedText": "पारंपरिक हस्तनिर्मित मधुबनी पेंटिंग",
"sourceLanguage": "en",
"targetLanguage": "hi"
}

Translation should preserve product meaning.

Do not introduce new product facts during translation.

---

# 15. NATURAL-LANGUAGE SEARCH

Customer:

"Traditional handmade gifts from Bihar under ₹1000"

AI converts the query into structured search intent.

Example:

{
"state": "Bihar",
"maxPrice": 1000,
"keywords": [
"traditional",
"handmade",
"gifts"
],
"category": null
}

Then:

AI
↓
Backend
↓
Database
↓
Actual products

AI must NOT return invented products.

---

# 16. SEARCH RESPONSIBILITY

Shivani owns the search interpretation logic.

Mayank owns the database query.

Namita owns the search UI.

Shivank coordinates integration.

Search AI should primarily interpret intent.

It should not become a second database.

---

# 17. PRICE RECOMMENDATION

AI may recommend a price based on available product information.

Example:

{
"suggestedPrice": 899,
"priceRange": {
"min": 799,
"max": 999
},
"confidence": 0.80
}

Price is advisory.

The artisan chooses the final price.

Example:

AI:
₹799–₹999

Artisan:
₹950

Database:
₹950

Never automatically overwrite the artisan's chosen price.

---

# 18. PRICE SAFETY

AI must not present the suggested price as a guaranteed market price.

Use wording such as:

"Suggested price"

"Estimated range"

"AI-assisted recommendation"

---

# 19. AI OUTPUT VALIDATION

Before AI output is used by the backend:

Validate:

required fields
data types
price values
price range
confidence
arrays
language
empty values
unexpected fields where relevant

Invalid AI output must not be blindly stored.

---

# 20. AI ERROR HANDLING

Possible errors:

AI_PROVIDER_ERROR
AI_TIMEOUT
AI_INVALID_OUTPUT
STT_ERROR
TRANSLATION_ERROR
SEARCH_PARSE_ERROR

The application should provide a useful fallback message.

Example:

"We couldn't understand that. Please try again."

Never expose provider credentials or internal provider errors to the artisan.

---

# 21. MOCK MODE

During development, a provider abstraction may support a controlled mock mode.

Mock mode is for:

development
UI testing
integration testing
offline development

The final SIH demo should prioritize actual working AI.

Do not present fake AI output as real AI.

---

# 22. AI DATA PRIVACY

Do not send unnecessary personal data to external AI providers.

Do not send:

passwords
authentication tokens
unnecessary customer information
secret credentials

Only send information required for the AI task.

---

# 23. IMAGE HANDLING

Product images should be stored using suitable image/object storage.

Do not store large raw image files directly inside PostgreSQL.

AI receives an accessible image reference according to the selected storage architecture.

---

# 24. AI TEAM OWNERSHIP

Suraj:

ai/src/product/
ai/src/prompts/
ai/src/validation/
ai/src/providers/

Shiva:

ai/src/voice/
ai/src/translation/

Shivani:

ai/src/search/
ai/src/pricing/

Shared:

ai/src/providers/
ai/src/utils/

Shared provider architecture must be coordinated.

---

# 25. NO DUPLICATE AI ARCHITECTURES

Shiva must not create a separate unrelated AI provider system.

Shivani must not create a second independent AI backend.

Suraj's provider abstraction should be reused where practical.

If a different provider is required, coordinate first.

---

# 26. GOLDEN AI FLOW

Photo
+
Voice
↓
STT
↓
Image + text
↓
Product AI
↓
Catalogue draft
↓
AI questions
↓
Artisan answers
↓
Final catalogue
↓
Price recommendation
↓
Artisan review
↓
Approval
↓
Published product

---

# 27. AI CONTRACT CHANGE RULE

Any change to:

input
output
field name
question format
price format
confidence format
language format
search format

must be communicated to Shivank before implementation.

Status:

LOCKED FOR MVP.
