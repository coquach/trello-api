import { StatusCodes } from "http-status-codes";
import { boardModel } from "~/models/boardModel";
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import ApiError from "~/utils/ApiError";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createdNew(newColumn);
    if (!createdColumn.acknowledged) {
      throw new Error("Failed to create new column");
    }
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId);

    if (getNewColumn) {

      getNewColumn.cards = []

      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn;
  } catch (error) {
    throw error;
  }
}

const update = async (columnId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now
    }
    const updatedColumn = await columnModel.update(columnId, updatedData)
    return updatedColumn
  } catch (error) {
    throw error;
  }
}

const deleteItem = async (columnId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Column doesn't exist")
    }
    await columnModel.deleteOneByColumnId(columnId)
    await cardModel.deleteManyByColumnId(columnId)

    await boardModel.pullColumnOrderIds(targetColumn)

    return { result: "Column and its card are deleted Successfully" }
  } catch (error) {
    throw error;
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}