import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from "~/utils/formatters";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {

    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    const nameFromEmail = reqBody.email.split('@')[0]

    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,

      verifyToken: uuidv4()
    }

    const createdUser = await userModel.createdNew(newUser);
    if (!createdUser.acknowledged) {
      throw new Error("Failed to create new user");
    }
    const getNewUser = await userModel.findOneById(createdUser.insertedId);

    return pickUser(getNewUser)

  } catch (error) {
    throw error;
  }
}

export const userService = {
  createNew
}