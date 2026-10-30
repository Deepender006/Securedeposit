function MaturityAlerts({ fdrRecords = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysRemaining = (dateString) => {
    if (
      typeof dateString !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
      return null;
    }

    const [year, month, day] = dateString.split("-").map(Number);

    const maturityDate = new Date(year, month - 1, day);
    maturityDate.setHours(0, 0, 0, 0);

    if (
      maturityDate.getFullYear() !== year ||
      maturityDate.getMonth() !== month - 1 ||
      maturityDate.getDate() !== day
    ) {
      return null;
    }

    return Math.round(
      (maturityDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const records = Array.isArray(fdrRecords) ? fdrRecords : [];

  const maturityRecords = records
    .map((record) => ({
      ...record,
      daysRemaining: getDaysRemaining(record.maturityDate),
    }))
    .filter((record) => record.daysRemaining !== null)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const upcomingRecords = maturityRecords.filter(
    (record) => record.daysRemaining >= 0 && record.daysRemaining <= 30
  );

  const overdueRecords = maturityRecords.filter(
    (record) => record.daysRemaining < 0
  );

  const alertRecords = maturityRecords.filter(
    (record) => record.daysRemaining <= 30
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <h1>Maturity Alerts</h1>
          <p>Track FDRs approaching or past their maturity dates.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="dashboard-panel">
          <h3>Upcoming Maturities</h3>
          <h2>{upcomingRecords.length}</h2>
          <p>Maturing within the next 30 days</p>
        </div>

        <div className="dashboard-panel">
          <h3>Already Matured</h3>
          <h2>{overdueRecords.length}</h2>
          <p>Past their maturity date</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Maturity Schedule</h2>
            <p>Overdue records and records maturing within 30 days</p>
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
                <th>Time Remaining</th>
              </tr>
            </thead>

            <tbody>
              {alertRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.institution || "—"}</td>
                  <td>{record.bank || "—"}</td>
                  <td>{formatCurrency(record.amount)}</td>
                  <td>{formatDate(record.maturityDate)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        record.daysRemaining < 0
                          ? "discrepancy"
                          : record.daysRemaining <= 7
                            ? "pending"
                            : "verified"
                      }`}
                    >
                      {record.daysRemaining < 0
                        ? `${Math.abs(record.daysRemaining)} days overdue`
                        : record.daysRemaining === 0
                          ? "Matures today"
                          : `${record.daysRemaining} days left`}
                    </span>
                  </td>
                </tr>
              ))}

              {alertRecords.length === 0 && (
                <tr>
                  <td colSpan="6">
                    {records.length === 0
                      ? "No FDR records found. Add records in FDR Management."
                      : "No overdue FDRs or maturities within the next 30 days."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="empty-state">
        Alerts are calculated from stored maturity dates. Automatic email and
        SMS notifications are not configured. Please verify maturity dates
        against official bank records.
      </p>
    </div>
  );
}

export default MaturityAlerts;
