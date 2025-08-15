import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from 'uuid';
import { userModel } from "~/models/userModel";
import { BrevoProvider } from "~/providers/brevoProvider";
import ApiError from "~/utils/ApiError";
import { WEBSITE_DOMAIN } from "~/utils/constants";
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

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`

    const customSubject = `Trello MERN Stack Advanced: Please verify your email before using service`

    const htmlContent = `
              <h3>Here is your verification link </h3>
              <h3>${verificationLink}</h3>
              <h3>Sincerely,<br/> - Vinh Co </h3>
            `
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    return pickUser(getNewUser)

  } catch (error) {
    throw error;
  }
}

export const userService = {
  createNew
}