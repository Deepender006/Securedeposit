let fdrRecords = [
  {
    id: "FDR-2026-001",
    institution: "ABC Institute of Technology",
    bank: "State Bank of India",
    amount: 2500000,
    maturityDate: "2026-11-15",
    status: "Verified"
  },
  {
    id: "FDR-2026-002",
    institution: "National Engineering College",
    bank: "Punjab National Bank",
    amount: 1800000,
    maturityDate: "2026-11-05",
    status: "Pending"
  },
  {
    id: "FDR-2026-003",
    institution: "Modern Technical University",
    bank: "Bank of Baroda",
    amount: 3200000,
    maturityDate: "2026-12-20",
    status: "Verified"
  },
  {
    id: "FDR-2026-004",
    institution: "Sunrise College of Engineering",
    bank: "Canara Bank",
    amount: 1500000,
    maturityDate: "2026-10-31",
    status: "Discrepancy"
  },
  {
    id: "FDR-2026-005",
    institution: "Greenfield Institute",
    bank: "Union Bank of India",
    amount: 2100000,
    maturityDate: "2027-01-18",
    status: "Pending"
  }
];

const getAllFDRs = (req, res) => {
  res.json(fdrRecords);
};

const getFDRById = (req, res) => {
  const record = fdrRecords.find(item => item.id === req.params.id);

  if (!record) {
    return res.status(404).json({ message: "FDR record not found" });
  }

  res.json(record);
};

const createFDR = (req, res) => {
  const { institution, bank, amount, maturityDate, status } = req.body;

  if (!institution || !bank || amount === undefined || !maturityDate || !status) {
    return res.status(400).json({ message: "All FDR fields are required" });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  const newRecord = {
    id: `FDR-${Date.now()}`,
    institution,
    bank,
    amount: Number(amount),
    maturityDate,
    status
  };

  fdrRecords.push(newRecord);
  res.status(201).json(newRecord);
};

const updateFDR = (req, res) => {
  const index = fdrRecords.findIndex(item => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "FDR record not found" });
  }

  const allowedFields = ["institution", "bank", "amount", "maturityDate", "status"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.amount !== undefined) {
    if (!Number.isFinite(Number(updates.amount)) || Number(updates.amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }
    updates.amount = Number(updates.amount);
  }

  fdrRecords[index] = { ...fdrRecords[index], ...updates };
  res.json(fdrRecords[index]);
};

const deleteFDR = (req, res) => {
  const index = fdrRecords.findIndex(item => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "FDR record not found" });
  }

  const deletedRecord = fdrRecords.splice(index, 1)[0];
  res.json({ message: "FDR record deleted successfully", record: deletedRecord });
};

const getFDRStats = (req, res) => {
  const totalAmount = fdrRecords.reduce((sum, item) => sum + item.amount, 0);

  res.json({
    totalRecords: fdrRecords.length,
    totalAmount,
    verified: fdrRecords.filter(item => item.status === "Verified").length,
    pending: fdrRecords.filter(item => item.status === "Pending").length,
    discrepancy: fdrRecords.filter(item => item.status === "Discrepancy").length
  });
};

module.exports = {
  getAllFDRs,
  getFDRById,
  createFDR,
  updateFDR,
  deleteFDR,
  getFDRStats
};