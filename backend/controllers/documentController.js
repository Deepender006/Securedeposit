const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

let documents = [];

const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${require("crypto").randomUUID()}${extension}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
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

const uploadDocument = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please select a document to upload.",
    });
  }

  const { fdrId, institution } = req.body;

  if (!fdrId) {
    fs.unlink(req.file.path, () => {});

    return res.status(400).json({
      message: "FDR ID is required.",
    });
  }

  const document = {
    id: require("crypto").randomUUID(),
    fdrId,
    institution: institution || "Unknown",
    fileName: req.file.originalname,
    storedFileName: req.file.filename,
    fileSize: req.file.size,
    uploadDate: new Date().toISOString(),
  };

  documents.push(document);

  res.status(201).json({
    message: "Document uploaded successfully.",
    document,
  });
};

const getDocuments = (req, res) => {
  const { fdrId } = req.query;

  const result = fdrId
    ? documents.filter((document) => document.fdrId === fdrId)
    : documents;

  res.json(result);
};

const deleteDocument = (req, res) => {
  const document = documents.find(
    (item) => item.id === req.params.id
  );

  if (!document) {
    return res.status(404).json({
      message: "Document not found.",
    });
  }

  const filePath = path.join(uploadDirectory, document.storedFileName);

  fs.unlink(filePath, (error) => {
    if (error && error.code !== "ENOENT") {
      return res.status(500).json({
        message: "Could not delete the stored file.",
      });
    }

    documents = documents.filter(
      (item) => item.id !== req.params.id
    );

    res.json({
      message: "Document deleted successfully.",
    });
  });
};

module.exports = {
  upload,
  uploadDocument,
  getDocuments,
  deleteDocument,
};