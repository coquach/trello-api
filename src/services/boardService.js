import { cloneDeep } from "lodash";
import { boardModel } from "~/models/boardModel";
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import ApiError from "~/utils/ApiError";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants";
import { slugify } from "~/utils/formatters";

const createNew = async (userId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createdBoard = await boardModel.createdNew(userId, newBoard);
    if (!createdBoard.acknowledged) {
      throw new Error("Failed to create new board");
    }
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);
    return getNewBoard;
  } catch (error) {
    throw error;
  }
}
const getDetails = async (userId, boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const boardDetails = await boardModel.getDetails(userId, boardId);
    if (!boardDetails) {
      throw new ApiError("Board not found");
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
const update = async (boardId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now
    }
    const updatedBoard = await boardModel.update(boardId, updatedData)
    return updatedBoard
  } catch (error) {
    throw error;
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now
    })
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds
    })

    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })
    return { updateResult: "Successfully" }
  } catch (error) {
    throw error;
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), queryFilters);
    return results
  } catch (error) {
    throw error
  }
}
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}