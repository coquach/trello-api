/* eslint-disable no-useless-catch */
import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import { pagingSkipValue } from "~/utils/algorithms";
import { BOARD_TYPE } from "~/utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { cardModel } from "./cardModel";
import { columnModel } from "./columnModel";
import ApiError from "~/utils/ApiError";
import { userModel } from "./userModel";
import { verify } from "jsonwebtoken";

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(...Object.values(BOARD_TYPE)).required(),
  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})


const INVALID_UPDATE_FIELDS = ["_id", "createdAt"]

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
}

const createdNew = async (userId, data) => {
  try {
    const validatedData = await validateBeforeCreate(data);
    const createdData = {
      ...validatedData,
      ownerIds: [new ObjectId(String(userId))]
    }
    const db = await GET_DB();
    const result = await db.collection(BOARD_COLLECTION_NAME).insertOne(createdData);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

const findOneById = async (id) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) {
    throw new Error(error);
  }
}

const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(String(boardId)) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ];
    const db = await GET_DB()

    const result = await db.collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          $and: queryConditions
        }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: "_id",
          foreignField: "boardId",
          as: "columns"
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: "_id",
          foreignField: "boardId",
          as: "cards"
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: "ownerIds",
          foreignField: "_id",
          as: "owners",
          pipeline: [{
            $project: { password: 0, verifyToken: 0 }
          }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: "memberIds",
          foreignField: "_id",
          as: "members",
          pipeline: [{
            $project: { password: 0, verifyToken: 0 }
          }]
        }
      }
    ]).toArray();

    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
}

const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: "after" }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: "after" }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, boardData) => {
  try {
    Object.keys(boardData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName))
        delete boardData[fieldName]
    })

    if (boardData.columnOrderIds) {
      boardData.columnOrderIds = boardData.columnOrderIds.map(_id => { return new ObjectId(String(_id)) });
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: boardData },
      { returnDocument: "after" }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ];

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        { $sort: { title: 1 } },
        {
          $facet: {
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) },
              { $limit: itemsPerPage }
            ],
            'queryTotalBoards': [
              { $count: 'countedAllBoards' }
            ]
          }
        }
      ],
      { collation: { locale: 'en', strength: 1 } }
    ).toArray();

    const res = query[0];
    return {
      boards: res.queryBoards || [],
      totalBoards: res?.queryTotalBoards[0]?.countedAllBoards || 0
    };
  } catch (error) {
    throw new Error(error);
  }

}

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $push: { memberIds: new ObjectId(String(userId)) } },
      { returnDocument: "after" }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createdNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update,
  getBoards,
  pushMemberIds
}