import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ["_id", "boardId", "createdAt"]

const validatBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
}

const createdNew = async (data) => {
  try {
    const validatedData = await validatBeforeCreate(data);
    const newColumnToAdd = {
      ...validatedData,
      boardId: new ObjectId(String(validatedData.boardId))
    }
    const db = await GET_DB();
    const result = await db.collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

const findOneById = async (id) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) {
    throw new Error(error);
  }
}

const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(card.columnId)) },
      { $push: { cardOrderIds: new ObjectId(String(card._id)) } },
      { returnDocument: "after" }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (columnId, columnData) => {
  try {
    Object.keys(columnData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName))
        delete columnData[fieldName]
    })

    if (columnData.cardOrderIds) {
      columnData.cardOrderIds = columnData.cardOrderIds.map(_id => { return new ObjectId(String(_id)) });
    }

    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(columnId)) },
      { $set: columnData },
      { returnDocument: "after" }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({ _id: new ObjectId(String(columnId)) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createdNew,
  findOneById,
  pushCardOrderIds,
  update,
  deleteOneByColumnId
}