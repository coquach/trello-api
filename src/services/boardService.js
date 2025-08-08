import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";

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
export const boardService = {
  createNew
}