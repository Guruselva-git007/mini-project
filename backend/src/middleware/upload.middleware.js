import multer from "multer";
import HttpError from "../utils/http-error.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new HttpError(400, "Only image files are allowed"));
  }
});

export const singleIssueImage = upload.single("image");
