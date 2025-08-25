import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError.js";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

const createNew = async (req, res, next) => {
  const correctConditions = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).required().trim().strict()
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
    next(customError);
  }
}

const update = async (req, res, next) => {
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message)
    next(customError);
  }
}

const deleteItem = async (req, res, next) => {
  const correctConditions = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  });
  try {
    await correctConditions.validateAsync(req.params, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message)
    next(customError);
  }
}

export const columnValidation = {
  createNew,
  update,
  deleteItem
}