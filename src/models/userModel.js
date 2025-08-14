import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";

const Joi = require("joi");
const { create } = require("lodash");
const { EMAIL_RULE_MESSAGE, PASSWORD_RULE_MESSAGE, PASSWORD_RULE, EMAIL_RULE } = require("~/utils/validators");

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}


//* Define Collection
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_NAME_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createAt']


const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_NAME_SCHEMA.validateAsync(data, { abortEarly: false });
}

const createdNew = async (data) => {
  try {
    const validatedData = await validateBeforeCreate(data);
    const db = await GET_DB();
    const result = await db.collection(USER_COLLECTION_NAME).insertOne(validatedData);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

const findOneById = async (id) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) {
    throw new Error(error);
  }
}

const findOneByEmail = async (email) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(USER_COLLECTION_NAME).findOne({
      email: email
    })
    return result
  } catch (error) {
    throw new Error(error);
  }
}

const update = async (userId, userData) => {
  try {
    Object.keys(userId).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName))
        delete userId[fieldName]
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(userId)) },
      { $set: userData },
      { returnDocument: "after" }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_NAME_SCHEMA,
  createdNew,
  findOneById,
  findOneByEmail,
  update
}
