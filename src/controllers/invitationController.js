import { StatusCodes } from "http-status-codes";
import { invitationService } from "~/services/invitationService";


const createNewBoardInvitation = async (req, res, next) => {
  try {
    const inviterId = req.jwtDecoded._id
    console.log("🚀 ~ createNewBoardInvitation ~ inviterId:", inviterId)
    
    const createdInvitation = await invitationService.createNewBoardInvitation(inviterId, req.body);

    res.status(StatusCodes.CREATED).json(createdInvitation);
  } catch (error) {
    next(error);
  }
}
const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    const invitations = await invitationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(invitations)
  } catch (error) {
    next(error)
  }
}

export const invitationController = {
  createNewBoardInvitation,
  getInvitations
}