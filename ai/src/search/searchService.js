function extractPrice(query) {
  const match = query.match(
    /(?:under|below|less than|upto|up to|max|maximum)\s*₹?\s?(\d+(?:,\d{3})*(?:\.\d+)?)/i
  );

  if (!match) return null;

  return Number(match[1].replace(/,/g, ""));
}

function extractState(query) {
  const states = [
    "bihar",
    "rajasthan",
    "west bengal",
    "uttar pradesh",
    "gujarat",
    "maharashtra",
    "karnataka",
    "tamil nadu",
    "odisha",
  ];

  const lowered = query.toLowerCase();

  const found = states.find((state) =>
    lowered.includes(state)
  );

  return found
    ? found.replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
}

function extractCategory(query) {
  const categories = {
    pottery: [
      "pottery",
      "ceramic",
      "clay pot",
    ],

    textiles: [
      "textile",
      "saree",
      "silk",
      "cotton",
      "weaving",
      "fabric",
    ],

    jewelry: [
      "jewelry",
      "jewellery",
      "necklace",
      "earring",
      "bracelet",
      "bangle",
      "silver jewelry",
      "silver jewellery",
    ],

    paintings: [
      "painting",
      "paintings",
      "artwork",
      "madhubani",
      "art",
    ],

    woodwork: [
      "woodwork",
      "wooden",
      "wood carving",
      "wood craft",
    ],

    handicrafts: [
      "handicraft",
      "handicrafts",
      "craft",
      "crafts",
      "handmade",
    ],
  };

  const lowered = query.toLowerCase();

  return (
    Object.entries(categories).find(
      ([, terms]) =>
        terms.some((term) =>
          lowered.includes(term)
        )
    )?.[0] || null
  );
}

async function parseSearchQuery(query) {
  if (
    typeof query !== "string" ||
    !query.trim()
  ) {
    return {
      success: false,
      error: {
        code: "INVALID_SEARCH_QUERY",
        message: "Search query is required.",
      },
    };
  }

  const cleanQuery = query.trim();
  const lowered = cleanQuery.toLowerCase();

  const stopWords = [
    "from",
    "under",
    "below",
    "less",
    "than",
    "upto",
    "up",
    "to",
    "the",
    "and",
    "with",
    "show",
    "me",
    "for",
    "traditional",
    "handmade",
    "gifts",
    "products",
    "product",
    "items",
    "item",
  ];

  const keywords = cleanQuery
    .split(/\s+/)
    .filter((word) => {
      const normalized = word
        .replace(/[.,!?]/g, "")
        .toLowerCase();

      return (
        normalized.length > 2 &&
        !stopWords.includes(normalized)
      );
    })
    .map((word) =>
      word
        .replace(/[.,!?]/g, "")
        .toLowerCase()
    );

  const state = extractState(cleanQuery);

  const maxPrice = extractPrice(cleanQuery);

  const category = extractCategory(cleanQuery);

  const normalizedKeywords = [
    "traditional",
    "handmade",
    "gifts",
  ].filter((word) =>
    lowered.includes(word)
  );

  const finalKeywords =
    normalizedKeywords.length
      ? normalizedKeywords
      : keywords.slice(0, 5);

  return {
    success: true,

    data: {
      state,
      maxPrice,
      keywords: finalKeywords,
      category,
      rawQuery: cleanQuery,
    },
  };
}

module.exports = {
  parseSearchQuery,
  extractState,
  extractPrice,
  extractCategory,
};