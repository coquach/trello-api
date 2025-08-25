import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { BOARD_TYPE } from "~/utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

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
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
    next(customError);
  }
}

const update = async (req, res, next) => {
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPE)),
    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    next(customError);
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctConditions = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message)
    next(customError);
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}