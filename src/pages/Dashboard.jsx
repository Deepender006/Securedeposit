import StatCard from "../components/StatCard";

function Dashboard({ fdrRecords, setActivePage }) {
  const totalFDRs = fdrRecords.length;

  const totalAmount = fdrRecords.reduce(
    (sum, record) => sum + Number(record.amount || 0),
    0
  );

  const verifiedCount = fdrRecords.filter(
    (record) => record.status === "Verified"
  ).length;

  const pendingCount = fdrRecords.filter(
    (record) => record.status === "Pending"
  ).length;

  const discrepancyCount = fdrRecords.filter(
    (record) => record.status === "Discrepancy"
  ).length;

  const institutionCount = new Set(
    fdrRecords.map((record) => record.institution)
  ).size;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const upcomingRecords = [...fdrRecords]
    .filter((record) => record.maturityDate)
    .sort(
      (a, b) =>
        new Date(a.maturityDate) - new Date(b.maturityDate)
    )
    .slice(0, 4);

  const activityItems = [
    {
      icon: "✓",
      title: "FDR verification overview",
      description: `${verifiedCount} FDR records currently marked verified`,
      color: "green",
    },
    {
      icon: "◷",
      title: "Pending verification",
      description: `${pendingCount} records are waiting for review`,
      color: "orange",
    },
    {
      icon: "!",
      title: "Discrepancies identified",
      description: `${discrepancyCount} records require attention`,
      color: "red",
    },
  ];

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE / OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>
            Welcome to your SecureDeposit management workspace.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setActivePage("FDR Management")}
        >
          + Register New FDR
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Deposit Value"
          value={formatCurrency(totalAmount)}
          description="Combined registered deposits"
          icon="₹"
          color="blue"
        />

        <StatCard
          title="Total FDRs"
          value={totalFDRs.toLocaleString("en-IN")}
          description="Registered deposit records"
          icon="▤"
          color="green"
        />

        <StatCard
          title="Institutions"
          value={institutionCount.toLocaleString("en-IN")}
          description="Institutions in the portal"
          icon="♙"
          color="purple"
        />

        <StatCard
          title="Pending Review"
          value={pendingCount + discrepancyCount}
          description="Records needing attention"
          icon="◷"
          color="orange"
        />
      </div>

    
      <div className="dashboard-panel portfolio-panel">
        <div className="panel-heading">
          <div>
            <h2>Deposit Portfolio</h2>
            <p>Registered deposit value by FDR record</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setActivePage("Reports")}
          >
            View Report ↗
          </button>
        </div>

        <div className="portfolio-summary">
          <span>Total portfolio value</span>
          <h3>{formatCurrency(totalAmount)}</h3>
          <p>
            {totalFDRs} {totalFDRs === 1 ? "FDR record" : "FDR records"}
          </p>
        </div>

        <div className="portfolio-table-wrapper">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>FDR ID</th>
                <th>Institution</th>
                <th>Bank</th>
                <th>Deposit Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {fdrRecords.map((record) => {
                const statusClass =
                  String(record.status).toLowerCase() === "verified"
                    ? "verified"
                    : String(record.status).toLowerCase() === "discrepancy"
                    ? "discrepancy"
                    : "pending";

                return (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.institution}</td>
                    <td>{record.bank}</td>
                    <td>{formatCurrency(record.amount)}</td>
                    <td>
                      <span className={`status ${statusClass}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {fdrRecords.length === 0 && (
                <tr>
                  <td colSpan="5">No FDR records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Activity Overview</h2>
              <p>Current verification summary</p>
            </div>
          </div>

          <div className="activity-list">
            {activityItems.map((item) => (
              <div className="activity-item" key={item.title}>
                <div className={`activity-icon ${item.color}`}>
                  {item.icon}
                </div>

                <div className="activity-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="activity-link"
            onClick={() => setActivePage("Verification")}
          >
            Open verification center →
          </button>
        </section>

        <section className="dashboard-panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent FDR Records</h2>
              <p>Upcoming maturity dates</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setActivePage("FDR Management")}
            >
              View All
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Amount</th>
                  <th>Maturity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {upcomingRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="institution-cell">
                        <div className="institution-avatar">
                          {String(record.institution || "I")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="institution-name">
                            {record.institution}
                          </div>

                          <div className="institution-id">
                            {record.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{formatCurrency(record.amount)}</td>
                    <td>{record.maturityDate}</td>

                    <td>
                      <span
                        className={`status-badge ${String(
                          record.status
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {upcomingRecords.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      No FDR records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      
      <div className="dashboard-disclaimer">
        <span>ⓘ</span>
        Prototype dashboard — verification statuses reflect application
        data and do not represent independent confirmation from a bank.
      </div>
    </div>
  );
}

export default Dashboard;