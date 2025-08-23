import express from 'express';
import { boardController } from '~/controllers/boardController.js';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { boardValidation } from '~/validations/boardValidation.js';

const Router = express.Router();

Router.route("/")
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew);

Router.route("/:id")
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update);

Router.route("/support/moving_card")
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn);


export const boardRoute = Router;