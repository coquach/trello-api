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

export const invitationController = {
  createNewBoardInvitation
}