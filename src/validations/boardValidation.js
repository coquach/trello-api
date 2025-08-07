import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";

const createNew = async (req, res, next) => {
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).required().trim().strict(),
    description: Joi.string().min(3).max(500).required().trim().strict(),
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const customeError = new ApiError( StatusCodes.BAD_REQUEST, error.message)
    next(customeError);
  }
}

export const boardValidation = {
  createNew
}