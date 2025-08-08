import { StatusCodes } from "http-status-codes";
import { boardService } from "~/services/boardService";

const createNew = async (req, res, next) => {
  try {
    const createdBoard = await boardService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdBoard);
  } catch (error) {
    next(error);
  }
}
const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const boardDetails = await boardService.getDetails(boardId);
    res.status(StatusCodes.OK).json(boardDetails);
  } catch (error) {
    next(error);
  }
}

export const boardController = {
  createNew,
  getDetails
}