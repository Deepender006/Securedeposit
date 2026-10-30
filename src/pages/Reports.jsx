function Reports({ fdrRecords = [] }) {
  const records = Array.isArray(fdrRecords) ? fdrRecords : [];

  const totalAmount = records.reduce(
    (sum, record) => sum + (Number(record.amount) || 0),
    0
  );

  const verifiedCount = records.filter(
    (record) => record.status === "Verified"
  ).length;

  const pendingCount = records.filter(
    (record) => record.status === "Pending"
  ).length;

  const discrepancyCount = records.filter(
    (record) => record.status === "Discrepancy"
  ).length;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatDate = (dateString) => {
    if (
      typeof dateString !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
      return dateString || "—";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const escapeCSV = (value) => {
    let text = String(value ?? "");

    // Prevent spreadsheet formula execution for untrusted text fields.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    if (records.length === 0) {
      window.alert("There are no FDR records to export.");
      return;
    }

    const headers = [
      "FDR ID",
      "Institution",
      "Bank",
      "Amount (INR)",
      "Maturity Date",
      "Status",
    ];

    const rows = records.map((record) => [
      record.id,
      record.institution,
      record.bank,
      Number(record.amount) || 0,
      record.maturityDate,
      record.status,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "securedeposit-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Review FDR statistics and export deposit records.</p>
        </div>

        <button className="primary-button" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="dashboard-panel">
          <h3>Total FDR Records</h3>
          <h2>{records.length}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Total Deposit Value</h3>
          <h2>{formatCurrency(totalAmount)}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Verified Records</h3>
          <h2>{verifiedCount}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Pending Verification</h3>
          <h2>{pendingCount}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Discrepancy Records</h3>
          <h2>{discrepancyCount}</h2>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>FDR Summary Report</h2>
            <p>All registered fixed deposit records</p>
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
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.institution || "—"}</td>
                  <td>{record.bank || "—"}</td>
                  <td>{formatCurrency(record.amount)}</td>
                  <td>{formatDate(record.maturityDate)}</td>
                  <td>
                    <span
                      className={`status-badge ${String(
                        record.status || "unknown"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {record.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td colSpan="6">
                    No records available for reporting. Add FDR records first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="empty-state">
        Reports use the current FDR records available to the application.
        Exported CSV files can be opened in Excel or other spreadsheet
        applications. Verify exported information before using it for
        official reporting.
      </p>
    </div>
  );
}

export default Reports;
