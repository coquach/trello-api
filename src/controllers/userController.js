import { StatusCodes } from "http-status-codes";
import { max } from "lodash";
import ms from "ms";
import { userService } from "~/services/userService";
import ApiError from "~/utils/ApiError";

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.CREATED).json(result.existUser);
  } catch (error) {
    next(error);
  }
}
const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: ms('14 days') })
    res.status(StatusCodes.OK).json('refresh token successfully!');
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! Error from refresh token!'))
  }
}

const update = async(req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatar = req.file
    const updatedUser = await userService.update(userId, req.body, userAvatar)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}