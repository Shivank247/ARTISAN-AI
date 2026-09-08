const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const message =
      data?.error?.message ||
      "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data;
}

export function generateProduct(productData) {
  return apiRequest("/ai/generate-product", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export function getProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  const queryString = params.toString();

  return apiRequest(
    `/products${queryString ? `?${queryString}` : ""}`
  );
}

export default apiRequest;