import { boardModel } from "~/models/boardModel";
import { columnModel } from "~/models/columnModel";

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

export const columnService = {
  createNew,
  update
}