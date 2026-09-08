const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const message =
      data?.error?.message || "Something went wrong. Please try again.";

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
    localStorage.setItem("authToken", response.data.token);
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

export function getProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);

  const queryString = params.toString();

  return apiRequest(
    `/products${queryString ? `?${queryString}` : ""}`
  );
}

export default apiRequest;