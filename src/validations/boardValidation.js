import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { BOARD_TYPE } from "~/utils/constants";

const createNew = async (req, res, next) => {
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).required().trim().strict(),
    description: Joi.string().min(3).max(256).required().trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPE)).required()
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const customeError = new ApiError(StatusCodes.BAD_REQUEST, error.message)
    next(customeError);
  }
}

export const boardValidation = {
  createNew
}