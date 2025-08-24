import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createdNew(newCard);
    if (!createdCard.acknowledged) {
      throw new Error("Failed to create new card");
    }
    const getNewCard = await cardModel.findOneById(createdCard.insertedId);
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
}
const update = async (cardId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateCard = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedCard = await cardModel.update(cardId, updateCard);

    return updatedCard;
  } catch (error) {
    throw error;
  }
}

export const cardService = {
  createNew,
  update
}