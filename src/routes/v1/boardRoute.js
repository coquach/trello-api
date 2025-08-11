import express from 'express';
import { boardController } from '~/controllers/boardController.js';
import { boardValidation } from '~/validations/boardValidation.js';

const Router = express.Router();

Router.route("/")
  .post(boardValidation.createNew, boardController.createNew);

Router.route("/:id")
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update);

Router.route("/support/moving_card")
  .put(boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn);


export const boardRoute = Router;