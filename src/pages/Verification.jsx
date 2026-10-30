import { updateFDR } from "../services/api";
function Verification({ fdrRecords, setFdrRecords }) {
 const updateStatus = async (id, newStatus) => {
  try {
    const record = fdrRecords.find((record) => record.id === id);

    if (!record) {
      alert("FDR record not found.");
      return;
    }

    const updatedRecord = await updateFDR(id, {
      ...record,
      status: newStatus,
    });

    setFdrRecords((previousRecords) =>
      previousRecords.map((record) =>
        record.id === id ? { ...record, ...updatedRecord } : record
      )
    );
  } catch (error) {
    alert(error.message || "Failed to update verification status.");
  }
};

  const pendingRecords = fdrRecords.filter(
    (record) =>
      record.status === "Pending" ||
      record.status === "Discrepancy"
  );

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <h1>FDR Verification</h1>
          <p>Review deposit records and update their verification status.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="dashboard-panel">
          <h3>Awaiting Review</h3>
          <h2>{pendingRecords.length}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Verified Records</h3>
          <h2>
            {fdrRecords.filter((record) => record.status === "Verified").length}
          </h2>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Records Requiring Review</h2>
            <p>Approve records or flag discrepancies for further review.</p>
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
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.institution}</td>
                  <td>{record.bank}</td>
                  <td>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(record.amount)}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="primary-button"
                        onClick={() => updateStatus(record.id, "Verified")}
                      >
                        Approve
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => updateStatus(record.id, "Discrepancy")}
                      >
                        Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pendingRecords.length === 0 && (
                <tr>
                  <td colSpan="6">No records currently require review.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="empty-state">
          Prototype only: these actions update the displayed status. They do not
          independently verify information with a bank.
        </p>
      </div>
    </div>
  );
}

export default Verification;