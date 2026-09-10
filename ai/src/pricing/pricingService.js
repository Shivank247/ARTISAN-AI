function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function recommendPrice({ category, material, productionTimeDays, location }) {
  if (!category && !material && !productionTimeDays && !location) {
    return {
      success: false,
      error: {
        code: 'INSUFFICIENT_PRICE_DATA',
        message: 'Not enough information to estimate a safe price.'
      }
    };
  }

  const base = 250;
  const categoryBoost = {
    paintings: 180,
    pottery: 220,
    textiles: 170,
    jewelry: 260,
    handicrafts: 140,
    home: 120
  };

  const materialBoost = {
    cotton: 80,
    silk: 120,
    clay: 90,
    wood: 110,
    metal: 150,
    paper: 80
  };

  const categoryName = typeof category === 'string' ? category.toLowerCase() : '';
  const materialName = typeof material === 'string' ? material.toLowerCase() : '';

  const categoryValue = categoryBoost[categoryName] || 100;
  const materialValue = materialBoost[materialName] || 60;
  const timeValue = Number(productionTimeDays || 1) * 35;
  const locationValue = typeof location === 'string' && location.toLowerCase().includes('bihar') ? 30 : 0;

  const suggested = base + categoryValue + materialValue + timeValue + locationValue;
  const min = Math.max(100, Math.round(suggested * 0.85));
  const max = Math.max(min + 50, Math.round(suggested * 1.15));

  return {
    success: true,
    data: {
      suggestedPrice: clamp(Math.round(suggested), 150, 5000),
      priceRange: {
        min,
        max
      },
      reason: 'Estimated from product type, material, production effort, and available catalogue context.',
      confidence: 0.72
    }
  };
}

module.exports = { recommendPrice, clamp };
