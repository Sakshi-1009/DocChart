/**
 * Multer middleware configuration for file uploads.
 * Limits file size, filters for allowed types, and stores files temporarily.
 */

import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/** Max file size: 20MB */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** Allowed MIME types */
const ALLOWED_MIMES = ["application/pdf", "text/plain"];

/** Allowed extensions */
const ALLOWED_EXTENSIONS = [".pdf", ".txt"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    // Prefix with UUID to avoid name collisions
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    ALLOWED_MIMES.includes(file.mimetype) ||
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only PDF and TXT files are accepted.`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
