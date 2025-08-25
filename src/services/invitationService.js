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

    if (data.inviteeEmail === inviter.email) {
      throw new ApiError(StatusCodes.CONFLICT, 'Invitee email must be different from inviter email!')
    }
    if ([...board.memberIds, ...board.ownerIds].some(id => id.equals(invitee._id))) {
      throw new ApiError(StatusCodes.CONFLICT, 'Invitee was in board')
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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    const resInvitations = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))

    return resInvitations
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations
}