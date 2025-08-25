import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants";

const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { GET_DB } = require("~/config/mongodb");
const { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } = require("~/utils/validators");


const INVITATION_COLLECTION_NAME = "invitations";
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})


const INVALID_UPDATE_FIELDS = ["_id", "inviterId", "inviteeId", "type", "createdAt"]
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
}
const createNewBoardInvitation = async (data) => {
  try {
    const validatedData = await validateBeforeCreate(data);
    let newInvitationToAdd = {
      ...validatedData,
      inviterId: new ObjectId(String(validatedData.inviterId)),
      inviteeId: new ObjectId(String(validatedData.inviteeId))
    }

    if (validatedData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {

        ...validatedData.boardInvitation,
        boardId: new ObjectId(String(validatedData.boardInvitation.boardId))

      }
    }
    const db = await GET_DB();
    const result = await db.collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd);
    return result;

  } catch (error) {
    throw new Error(error);
  }
}

const findOneById = async (id) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(INVITATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) {
    throw new Error(error);
  }
}
const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName]
    })

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(invitationId)) },
      { $set: updateData },
      { returnDocument: "after" }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update
}
