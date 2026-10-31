const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("securedeposit_token");

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      headers["Content-Type"] || "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function getFDRRecords() {
  return apiRequest("/fdr");
}

export async function getFDRStats() {
  return apiRequest("/fdr/stats");
}

export async function createFDR(record) {
  return apiRequest("/fdr", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function updateFDR(id, record) {
  return apiRequest(`/fdr/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(record),
  });
}

export async function deleteFDR(id) {
  return apiRequest(`/fdr/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadDocument(fdrId, institution, file) {
  const formData = new FormData();

  formData.append("fdrId", fdrId);
  formData.append("institution", institution);
  formData.append("document", file);

  return apiRequest("/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getDocuments(fdrId) {
  const query = fdrId
    ? `?fdrId=${encodeURIComponent(fdrId)}`
    : "";

  return apiRequest(`/documents${query}`);
}

export async function deleteDocument(id) {
  return apiRequest(`/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}