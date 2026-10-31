import React, { useEffect, useState } from "react";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../services/api";

function Documents({ fdrRecords }) {
  const [selectedFDR, setSelectedFDR] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingDocument, setViewingDocument] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      setError("");
      const documents = await getDocuments();
      setUploadedDocuments(documents);
    } catch (err) {
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedFDR || !documentFile) {
      setError("Please select an FDR and a document.");
      return;
    }

    if (documentFile.size > 5 * 1024 * 1024) {
      setError("The file must be 5 MB or smaller.");
      return;
    }

    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

    const extension = documentFile.name
      .slice(documentFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Only PDF, PNG, JPG, and JPEG files are allowed.");
      return;
    }

    const record = fdrRecords.find(
      (item) => item.id === selectedFDR
    );

    if (!record) {
      setError("The selected FDR could not be found.");
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadDocument(
        selectedFDR,
        record.institution,
        documentFile
      );

      setMessage("Document uploaded successfully.");

      setSelectedFDR("");
      setDocumentFile(null);

      event.target.reset();

      await loadDocuments();
    } catch (err) {
      setError(err.message || "Document upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (documentId) => {
    setError("");
    setMessage("");

    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      setError("Please allow pop-ups to view documents.");
      return;
    }

    setViewingDocument(documentId);

    try {
      const token = localStorage.getItem("securedeposit_token");

      if (!token) {
        throw new Error("Please log in again to view this document.");
      }

      const response = await fetch(
        `http://localhost:5000/api/documents/${encodeURIComponent(
          documentId
        )}/view`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || "Unable to open this document."
        );
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      newTab.location.href = fileUrl;

      window.setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 5 * 60 * 1000);
    } catch (err) {
      newTab.close();

      setError(err.message || "Failed to view document.");
    } finally {
      setViewingDocument("");
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteDocument(documentId);

      setUploadedDocuments((previous) =>
        previous.filter(
          (document) => document.id !== documentId
        )
      );

      setMessage("Document deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete document.");
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} bytes`;

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="dashboard-content">
     
      <div className="page-heading">
        <div>
          <h1>Document Management</h1>
          <p>
            Manage documents associated with registered FDRs.
          </p>
        </div>
      </div>

      <div className="dashboard-panel">
        <h2>Upload Document</h2>

        <form onSubmit={handleUpload} className="fdr-form">
          <label>
            Select FDR

            <select
              value={selectedFDR}
              onChange={(event) =>
                setSelectedFDR(event.target.value)
              }
              required
              disabled={isSubmitting}
            >
              <option value="">Choose an FDR</option>

              {fdrRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.id} — {record.institution}
                </option>
              ))}
            </select>
          </label>

          <label>
            Choose Document

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
              disabled={isSubmitting}
              onChange={(event) =>
                setDocumentFile(
                  event.target.files?.[0] || null
                )
              }
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={
              isSubmitting || fdrRecords.length === 0
            }
          >
            {isSubmitting
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </form>

        {message && (
          <p className="empty-state" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <p className="empty-state">
          Allowed formats: PDF, PNG, JPG, JPEG.
          Maximum file size: 5 MB.
        </p>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Uploaded Documents</h2>

            <p>
              {uploadedDocuments.length} documents stored on
              the backend
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadDocuments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>FDR ID</th>
                <th>Institution</th>
                <th>Document Name</th>
                <th>File Size</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    Loading documents...
                  </td>
                </tr>
              ) : uploadedDocuments.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                uploadedDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>{document.fdrId}</td>

                    <td>{document.institution}</td>

                    <td>{document.fileName}</td>

                    <td>
                      {formatFileSize(document.fileSize)}
                    </td>

                    <td>
                      {new Date(
                        document.uploadDate
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <div className="fdr-action-buttons">
                        <button
                          type="button"
                          className="action-button edit-button"
                          onClick={() =>
                            handleView(document.id)
                          }
                          disabled={
                            viewingDocument === document.id
                          }
                        >
                          {viewingDocument === document.id
                            ? "Opening..."
                            : "View"}
                        </button>

                        <button
                          type="button"
                          className="action-button delete-button"
                          onClick={() =>
                            handleDelete(document.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Documents;
