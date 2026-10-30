import React, { useState } from "react";
import { updateFDR } from "../services/api";

function RenewalRelease({ fdrRecords, setFdrRecords }) {
  const [selectedFDR, setSelectedFDR] = useState("");
  const [actionType, setActionType] = useState("Renewal");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const record = fdrRecords.find(
      (item) => item.id === selectedFDR
    );

    if (!record) {
      setMessage("Please select a valid FDR.");
      return;
    }

    const updatedStatus =
      actionType === "Renewal"
        ? "Renewal Requested"
        : "Release Requested";

    setIsSubmitting(true);

    try {
      const updatedRecord = await updateFDR(selectedFDR, {
        ...record,
        status: updatedStatus,
      });

      setFdrRecords((previousRecords) =>
        previousRecords.map((item) =>
          item.id === selectedFDR
            ? { ...item, ...updatedRecord }
            : item
        )
      );

      setMessage(
        `${actionType} request recorded successfully for ${selectedFDR}.`
      );

      setSelectedFDR("");
    } catch (error) {
      setMessage(
        error.message || "Failed to submit the request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <h1>Renewal & Release</h1>
          <p>Record requests to renew or release fixed deposits.</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <h2>Create a Request</h2>

        <form onSubmit={handleSubmit} className="fdr-form">
          <label>
            Select FDR
            <select
              value={selectedFDR}
              onChange={(event) => setSelectedFDR(event.target.value)}
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
            Request Type
            <select
              value={actionType}
              onChange={(event) => setActionType(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="Renewal">Renewal</option>
              <option value="Release">Release</option>
            </select>
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting || fdrRecords.length === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {message && (
          <p className="empty-state" role="status">
            {message}
          </p>
        )}

        <p className="empty-state">
          Prototype only: this records a request in the system. It does not
          renew or release an actual bank deposit.
        </p>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Request Status</h2>
            <p>Current status of all FDR records.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>FDR ID</th>
                <th>Institution</th>
                <th>Bank</th>
                <th>Maturity Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {fdrRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.institution}</td>
                  <td>{record.bank}</td>
                  <td>{record.maturityDate}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        [
                          "Pending",
                          "Renewal Requested",
                          "Release Requested",
                        ].includes(record.status)
                          ? "pending"
                          : record.status.toLowerCase()
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}

              {fdrRecords.length === 0 && (
                <tr>
                  <td colSpan="5">No FDR records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RenewalRelease;