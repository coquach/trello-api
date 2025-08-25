import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";

const createNewBoardInvitation = async (req, res, next) => {
  const correctConditions = Joi.object({
    inviteeEmail: Joi.string().required(),
    boardId: Joi.string().required()
  });
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
    next(customError);
  }
}

export const invitationValidation = {
  createNewBoardInvitation
}