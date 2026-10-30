import React from "react";
import { createFDR, updateFDR, deleteFDR } from "../services/api";

const emptyForm = {
  institution: "",
  bank: "",
  amount: "",
  maturityDate: "",
  status: "Pending",
};

function FDRManagement({ fdrRecords, setFdrRecords }) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [formData, setFormData] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);
  const [error, setError] = React.useState("");

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const record = {
      institution: formData.institution.trim(),
      bank: formData.bank.trim(),
      amount: Number(formData.amount),
      maturityDate: formData.maturityDate,
      status: formData.status,
    };

    try {
      if (editingId) {
        const updatedRecord = await updateFDR(editingId, record);

        setFdrRecords((current) =>
          current.map((item) =>
            item.id === editingId ? updatedRecord : item
          )
        );
      } else {
        const newRecord = await createFDR(record);
        setFdrRecords((current) => [...current, newRecord]);
      }

      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save the FDR record.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      institution: record.institution,
      bank: record.bank,
      amount: String(record.amount),
      maturityDate: record.maturityDate,
      status: record.status,
    });
    setError("");
    setShowForm(true);
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${record.id}?`
    );

    if (!confirmed) return;

    setDeletingId(record.id);
    setError("");

    try {
      await deleteFDR(record.id);

      setFdrRecords((current) =>
        current.filter((item) => item.id !== record.id)
      );

      if (editingId === record.id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete the FDR record.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <h1>FDR Management</h1>
          <p>Register and manage fixed deposit receipts.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setError("");
              setEditingId(null);
              setFormData({ ...emptyForm });
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancel" : "+ Add New FDR"}
        </button>
      </div>

      {showForm && (
        <div className="dashboard-panel">
          <h2>{editingId ? "Edit FDR" : "Register New FDR"}</h2>

          <form onSubmit={handleSubmit} className="fdr-form">
            <label>
              Institution Name
              <input
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                placeholder="Enter institution name"
              />
            </label>

            <label>
              Bank Name
              <input
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                required
                placeholder="Enter bank name"
              />
            </label>

            <label>
              Deposit Amount (₹)
              <input
                name="amount"
                type="number"
                min="1"
                step="any"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="Enter amount"
              />
            </label>

            <label>
              Maturity Date
              <input
                name="maturityDate"
                type="date"
                value={formData.maturityDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Discrepancy">Discrepancy</option>
              </select>
            </label>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update FDR"
                  : "Save FDR"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && error && (
        <div className="dashboard-panel">
          <p className="form-error" role="alert">
            {error}
          </p>
        </div>
      )}

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>All FDR Records</h2>
            <p>{fdrRecords.length} records registered</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>FDR ID</th>
                <th>Institution</th>
                <th>Bank</th>
                <th>Amount</th>
                <th>Maturity Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {fdrRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.institution}</td>
                  <td>{record.bank}</td>
                  <td>{formatCurrency(record.amount)}</td>
                  <td>{record.maturityDate}</td>
                  <td>
                    <span
                      className={`status-badge ${String(
                        record.status
                      ).toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="fdr-action-buttons">
                      <button
                        type="button"
                        className="action-button edit-button"
                        onClick={() => handleEdit(record)}
                        disabled={
                          deletingId === record.id ||
                          saving ||
                          deletingId !== null
                        }
                      >
                        <span aria-hidden="true">✎</span> Edit
                      </button>

                      <button
                        type="button"
                        className="action-button delete-button"
                        onClick={() => handleDelete(record)}
                        disabled={
                          deletingId !== null || saving
                        }
                      >
                        <span aria-hidden="true">✕</span>{" "}
                        {deletingId === record.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {fdrRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table-message">
                    No FDR records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FDRManagement;