const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const Document = require("../models/Document");
const FDR = require("../models/FDR");

const uploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error("Only PDF, PNG, JPG, and JPEG files are allowed.")
      );
    }

    callback(null, true);
  },
});

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a document to upload.",
      });
    }

    const { fdrId } = req.body;

    if (!fdrId) {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: "FDR ID is required.",
      });
    }

    const fdr = await FDR.findOne({
      id: fdrId,
      userId: req.user.id,
    });

    if (!fdr) {
      fs.unlink(req.file.path, () => {});

      return res.status(404).json({
        message: "FDR record not found in your account.",
      });
    }

    const document = await Document.create({
      id: crypto.randomUUID(),
      userId: req.user.id,
      fdrId: fdr.id,
      institution: fdr.institution,
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date(),
    });

    res.status(201).json({
      message: "Document uploaded successfully.",
      document,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    console.error("Upload document error:", error);

    res.status(500).json({
      message: "Document upload failed.",
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { fdrId } = req.query;

    const filter = {
      userId: req.user.id,
    };

    if (fdrId) {
      filter.fdrId = fdrId;
    }

    const documents = await Document.find(filter)
      .select("-userId -storedFileName")
      .sort({ uploadDate: -1 })
      .lean();

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      message: "Failed to fetch documents.",
    });
  }
};

const viewDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    const filePath = path.join(
      uploadDirectory,
      path.basename(document.storedFileName)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Stored document file not found.",
      });
    }

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath);
  } catch (error) {
    console.error("View document error:", error);

    res.status(500).json({
      message: "Failed to open document.",
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    const filePath = path.join(
      uploadDirectory,
      path.basename(document.storedFileName)
    );

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    await Document.deleteOne({
      _id: document._id,
      userId: req.user.id,
    });

    res.json({
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      message: "Failed to delete document.",
    });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getDocuments,
  viewDocument,
  deleteDocument,
};
