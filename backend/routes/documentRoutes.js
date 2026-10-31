const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  upload,
  uploadDocument,
  getDocuments,
  viewDocument,
  deleteDocument,
} = require("../controllers/documentController");

router.use(authMiddleware);

router.post(
  "/upload",
  (req, res, next) => {
    upload.single("document")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message || "File upload failed.",
        });
      }

      next();
    });
  },
  uploadDocument
);

router.get("/", getDocuments);

router.get("/:id/view", viewDocument);

router.delete("/:id", deleteDocument);

module.exports = router;
