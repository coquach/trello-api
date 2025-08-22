import { StatusCodes } from "http-status-codes";
import multer from "multer";
import ApiError from "~/utils/ApiError";
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from "~/utils/validators";

const customFileFilter = (req, file, cb) => {

  cb(null, true);
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only jpg, jpeg, and png are allowed.'
    return cb(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }
  return cb(null, true);
}

const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }