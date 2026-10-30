const API_BASE_URL = "http://localhost:5000/api";

export async function getFDRRecords() {
  const response = await fetch(`${API_BASE_URL}/fdr`);

  if (!response.ok) {
    throw new Error("Failed to fetch FDR records");
  }

  return response.json();
}

export async function getFDRStats() {
  const response = await fetch(`${API_BASE_URL}/fdr/stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch FDR statistics");
  }

  return response.json();
}

export async function createFDR(record) {
  const response = await fetch(`${API_BASE_URL}/fdr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(record)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create FDR record");
  }

  return response.json();
}
export async function updateFDR(id, record) {
  const response = await fetch(`${API_BASE_URL}/fdr/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update FDR record");
  }

  return response.json();
}

export async function deleteFDR(id) {
  const response = await fetch(`${API_BASE_URL}/fdr/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete FDR record");
  }

  return response.json();
}
export async function uploadDocument(fdrId, institution, file) {
  const formData = new FormData();
  formData.append("fdrId", fdrId);
  formData.append("institution", institution);
  formData.append("document", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to upload document.");
  }

  return result;
}

export async function getDocuments(fdrId) {
  const query = fdrId ? `?fdrId=${encodeURIComponent(fdrId)}` : "";

  const response = await fetch(`${API_BASE_URL}/documents${query}`);

  if (!response.ok) {
    throw new Error("Failed to fetch documents.");
  }

  return response.json();
}

export async function deleteDocument(id) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete document.");
  }

  return result;
}