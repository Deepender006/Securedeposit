function Institutions({ fdrRecords = [] }) {
  const records = Array.isArray(fdrRecords) ? fdrRecords : [];

  const institutionNames = [
    ...new Set(
      records
        .map((record) => record.institution?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const totalInstitutions = institutionNames.length;

  const totalDepositValue = records.reduce(
    (sum, record) => sum + (Number(record.amount) || 0),
    0
  );

  const totalVerified = records.filter(
    (record) => record.status === "Verified"
  ).length;

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <h1>Institutions</h1>
          <p>View institutions registered in the SecureDeposit Portal.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="dashboard-panel">
          <h3>Registered Institutions</h3>
          <h2>{totalInstitutions}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Total FDR Records</h3>
          <h2>{records.length}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Total Deposit Value</h3>
          <h2>{formatCurrency(totalDepositValue)}</h2>
        </div>

        <div className="dashboard-panel">
          <h3>Verified FDRs</h3>
          <h2>{totalVerified}</h2>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Registered Institutions</h2>
            <p>{totalInstitutions} institutions found</p>
          </div>
        </div>

        {totalInstitutions === 0 ? (
          <p className="empty-state">
            No institutions registered yet. Add an FDR in FDR Management to
            register an institution.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Total FDRs</th>
                  <th>Total Deposit Value</th>
                  <th>Verified</th>
                  <th>Pending</th>
                  <th>Discrepancies</th>
                </tr>
              </thead>

              <tbody>
                {institutionNames.map((institution) => {
                  const institutionRecords = records.filter(
                    (record) =>
                      record.institution?.trim() === institution
                  );

                  const totalAmount = institutionRecords.reduce(
                    (sum, record) =>
                      sum + (Number(record.amount) || 0),
                    0
                  );

                  const verifiedCount = institutionRecords.filter(
                    (record) => record.status === "Verified"
                  ).length;

                  const pendingCount = institutionRecords.filter(
                    (record) => record.status === "Pending"
                  ).length;

                  const discrepancyCount = institutionRecords.filter(
                    (record) => record.status === "Discrepancy"
                  ).length;

                  return (
                    <tr key={institution}>
                      <td>{institution}</td>
                      <td>{institutionRecords.length}</td>
                      <td>{formatCurrency(totalAmount)}</td>
                      <td>{verifiedCount}</td>
                      <td>{pendingCount}</td>
                      <td>{discrepancyCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="empty-state">
        Institution information is derived from the FDR records currently
        stored in the application. An institution appears here when at least
        one FDR is registered under its name.
      </p>
    </div>
  );
}

export default Institutions;
