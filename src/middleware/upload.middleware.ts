import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { HttpError } from '../utils/http-error';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const absoluteUploadDir = path.resolve(uploadDir);

if (!fs.existsSync(absoluteUploadDir)) {
  fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, absoluteUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError(400, `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

const anyFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError(400, `Invalid file type.`));
  }
};

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

export const upload = multer({ storage, limits: { fileSize: maxFileSize } });

export const uploadImage = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: imageFilter,
});

export const uploadFile = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: anyFileFilter,
});
