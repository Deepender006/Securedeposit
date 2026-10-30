const express = require("express");
const router = express.Router();

const {
  upload,
  uploadDocument,
  getDocuments,
  deleteDocument,
} = require("../controllers/documentController");

router.post("/upload", (req, res, next) => {
  upload.single("document")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "File upload failed.",
      });
    }

    next();
  });
}, uploadDocument);

router.get("/", getDocuments);

router.delete("/:id", deleteDocument);

module.exports = router;