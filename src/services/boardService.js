import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";
import { cloneDeep } from "lodash";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createdBoard = await boardModel.createdNew(newBoard);
    if (!createdBoard.acknowledged) {
      throw new Error("Failed to create new board");
    }
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);
    return getNewBoard;
  } catch (error) {
    throw error;
  }
}
const getDetails = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const boardDetails = await boardModel.getDetails(boardId);
    if (!boardDetails) {
      throw ApiError("Board not found");
    }

    const resBoard = cloneDeep(boardDetails);

    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id));
    });

    delete resBoard.cards; // Remove cards from the main board object

    return resBoard;
  } catch (error) {
    throw error;
  }
}
export const boardService = {
  createNew,
  getDetails
}