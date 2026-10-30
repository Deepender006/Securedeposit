const express = require("express");
const router = express.Router();

const {
  getAllFDRs,
  getFDRById,
  createFDR,
  updateFDR,
  deleteFDR,
  getFDRStats
} = require("../controllers/fdrController");

router.get("/stats", getFDRStats);
router.get("/", getAllFDRs);
router.get("/:id", getFDRById);
router.post("/", createFDR);
router.put("/:id", updateFDR);
router.delete("/:id", deleteFDR);

module.exports = router;