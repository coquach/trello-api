import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import { CloudinaryProvider } from "~/providers/CloudinaryProvider";

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
const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateCard = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'trello-mern-advanced/card-cover')

      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateCard.commentToAdd) {
      const commentData = {
        ...updateCard.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else {
      updatedCard = await cardModel.update(cardId, updateCard);
    }

    return updatedCard;
  } catch (error) {
    throw error;
  }
}

export const cardService = {
  createNew,
  update
}