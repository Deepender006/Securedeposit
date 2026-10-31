const mongoose = require("mongoose");
const FDR = require("../models/FDR");

const ALLOWED_STATUSES = [
  "Pending",
  "Verified",
  "Discrepancy",
  "Expired",
  "Renewal Requested",
  "Release Requested",
];

const formatFDR = (record) => {
  const data = record.toObject ? record.toObject() : record;

  return {
    id: data.id,
    institution: data.institution,
    bank: data.bank,
    amount: data.amount,
    maturityDate: data.maturityDate,
    status: data.status,
  };
};

const getAllFDRs = async (req, res) => {
  try {
    const records = await FDR.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(records.map(formatFDR));
  } catch (error) {
    console.error("Get FDRs error:", error);
    res.status(500).json({ message: "Failed to fetch FDR records" });
  }
};

const getFDRById = async (req, res) => {
  try {
    const record = await FDR.findOne({
      id: req.params.id,
      userId: req.user.id,
    });

    if (!record) {
      return res.status(404).json({ message: "FDR record not found" });
    }

    res.json(formatFDR(record));
  } catch (error) {
    console.error("Get FDR error:", error);
    res.status(500).json({ message: "Failed to fetch FDR record" });
  }
};

const createFDR = async (req, res) => {
  try {
    const { institution, bank, amount, maturityDate, status } = req.body;

    if (
      !institution?.trim() ||
      !bank?.trim() ||
      amount === undefined ||
      amount === null ||
      !maturityDate ||
      !status
    ) {
      return res.status(400).json({
        message: "All FDR fields are required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid FDR status",
      });
    }

    const newRecord = await FDR.create({
      id: `FDR-${Date.now()}`,
      userId: req.user.id,
      institution: institution.trim(),
      bank: bank.trim(),
      amount: Number(amount),
      maturityDate,
      status,
    });

    res.status(201).json(formatFDR(newRecord));
  } catch (error) {
    console.error("Create FDR error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An FDR with this ID already exists",
      });
    }

    res.status(500).json({ message: "Failed to create FDR record" });
  }
};

const updateFDR = async (req, res) => {
  try {
    const allowedFields = [
      "institution",
      "bank",
      "amount",
      "maturityDate",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    if (
      updates.institution !== undefined &&
      (typeof updates.institution !== "string" ||
        !updates.institution.trim())
    ) {
      return res.status(400).json({
        message: "Institution name cannot be empty",
      });
    }

    if (
      updates.bank !== undefined &&
      (typeof updates.bank !== "string" || !updates.bank.trim())
    ) {
      return res.status(400).json({
        message: "Bank name cannot be empty",
      });
    }

    if (updates.amount !== undefined) {
      if (
        !Number.isFinite(Number(updates.amount)) ||
        Number(updates.amount) <= 0
      ) {
        return res.status(400).json({
          message: "Amount must be a positive number",
        });
      }

      updates.amount = Number(updates.amount);
    }

    if (
      updates.status !== undefined &&
      !ALLOWED_STATUSES.includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Invalid FDR status",
      });
    }

    if (updates.institution !== undefined) {
      updates.institution = updates.institution.trim();
    }

    if (updates.bank !== undefined) {
      updates.bank = updates.bank.trim();
    }

    const updatedRecord = await FDR.findOneAndUpdate(
      {
        id: req.params.id,
        userId: req.user.id,
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        message: "FDR record not found",
      });
    }

    res.json(formatFDR(updatedRecord));
  } catch (error) {
    console.error("Update FDR error:", error);

    res.status(500).json({
      message: "Failed to update FDR record",
    });
  }
};

const deleteFDR = async (req, res) => {
  try {
    const deletedRecord = await FDR.findOneAndDelete({
      id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedRecord) {
      return res.status(404).json({
        message: "FDR record not found",
      });
    }

    res.json({
      message: "FDR record deleted successfully",
      record: formatFDR(deletedRecord),
    });
  } catch (error) {
    console.error("Delete FDR error:", error);
    res.status(500).json({
      message: "Failed to delete FDR record",
    });
  }
};

const getFDRStats = async (req, res) => {
  try {
    const userFilter = { userId: req.user.id };

    const [totalRecords, amountResult, statusCounts] = await Promise.all([
      FDR.countDocuments(userFilter),

      FDR.aggregate([
        { $match: userFilter.userId ? {
          userId: new require("mongoose").Types.ObjectId(req.user.id),
        } : {} },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),

      FDR.aggregate([
        { $match: { userId: new require("mongoose").Types.ObjectId(req.user.id) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = Object.fromEntries(
      statusCounts.map((item) => [item._id, item.count])
    );

    res.json({
      totalRecords,
      totalAmount: amountResult[0]?.totalAmount || 0,
      verified: counts.Verified || 0,
      pending: counts.Pending || 0,
      discrepancy: counts.Discrepancy || 0,
      renewalRequested: counts["Renewal Requested"] || 0,
      releaseRequested: counts["Release Requested"] || 0,
      expired: counts.Expired || 0,
    });
  } catch (error) {
    console.error("FDR statistics error:", error);
    res.status(500).json({
      message: "Failed to fetch FDR statistics",
    });
  }
};

module.exports = {
  getAllFDRs,
  getFDRById,
  createFDR,
  updateFDR,
  deleteFDR,
  getFDRStats,
};
