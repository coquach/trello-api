import { StatusCodes } from "http-status-codes";
import { pick } from "lodash";
import { boardModel } from "~/models/boardModel";
import { invitationModel } from "~/models/invitationModel";
import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants";
import { pickUser } from "~/utils/formatters";

const createNewBoardInvitation = async (inviterId, data) => {
  // Logic to create a new board invitation

  try {
    const inviter = await userModel.findOneById(inviterId);
    const invitee = await userModel.findOneByEmail(data.inviteeEmail);

    const board = await boardModel.findOneById(data.boardId);

    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Inviter, invitee, or board not found");
    }

    const newInvitationData = {
      inviterId: inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }

    }
    console.log("🚀 ~ createNewBoardInvitation ~ newInvitationData:", newInvitationData)
    
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    const resInvitation = {
      ...getInvitation,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw new Error(error);
  }
}

export const invitationService = {
  createNewBoardInvitation
}