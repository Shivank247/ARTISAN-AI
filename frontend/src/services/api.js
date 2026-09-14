const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const message =
      data?.error?.message ||
      "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data;
}

export function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(credentials) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.data?.token) {
    localStorage.setItem(
      "authToken",
      response.data.token
    );
  }

  return response;
}

export function getCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export function logoutUser() {
  localStorage.removeItem("authToken");
}

export function generateProduct(productData) {
  return apiRequest("/ai/generate-product", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export function createProduct(productData) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export function updateProduct(productId, productData) {
  return apiRequest(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export function getProduct(productId) {
  return apiRequest(`/products/${productId}`, {
    method: "GET",
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

  if (filters.minPrice !== undefined) {
    params.set("minPrice", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", filters.maxPrice);
  }

  if (filters.state) {
    params.set("state", filters.state);
  }

  const queryString = params.toString();

  return apiRequest(
    `/products${queryString ? `?${queryString}` : ""}`
  );
}

/*
 * Get products created by the currently
 * logged-in artisan.
 *
 * Includes both DRAFT and PUBLISHED products.
 */
export function getMyProducts() {
  return apiRequest("/artisans/me/products", {
    method: "GET",
  });
}

export function searchProductsAI(query) {
  return apiRequest("/ai/search", {
    method: "POST",
    body: JSON.stringify({
      query,
    }),
  });
}

export function createOrder(orderData) {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`, {
    method: "GET",
  });
}

export function getOrders() {
  return apiRequest("/orders", {
    method: "GET",
  });
}

export function getAdminDashboard() {
  return apiRequest("/admin/dashboard", {
    method: "GET",
  });
}

export function getAdminArtisans() {
  return apiRequest("/admin/artisans", {
    method: "GET",
  });
}

export function getAdminProducts() {
  return apiRequest("/admin/products", {
    method: "GET",
  });
}

export function getAdminOrders() {
  return apiRequest("/admin/orders", {
    method: "GET",
  });
}

export default apiRequest;