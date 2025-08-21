/* eslint-disable no-useless-catch */
import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from 'uuid';
import { env } from "~/config/environment";
import { userModel } from "~/models/userModel";
import { JwtProvider } from "~/providers/JwtProvider";
import ApiError from "~/utils/ApiError";
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

    // const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`

    // const customSubject = `Trello MERN Stack Advanced: Please verify your email before using service`

    // const htmlContent = `
    //           <h3>Here is your verification link </h3>
    //           <h3>${verificationLink}</h3>
    //           <h3>Sincerely,<br/> - Vinh Co </h3>
    //         `
    // await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    return pickUser(getNewUser)

  } catch (error) {
    throw error;
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')


    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)

  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')

    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)


    return { accessToken, refreshToken, existUser: pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody) => {
  try {
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')
    let updatedUser = {}

    if (reqBody.current_password && reqBody.new_password) {
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect')
      }
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else {
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}