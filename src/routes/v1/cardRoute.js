import express from 'express';
import { cardController } from '~/controllers/cardController.js';
import { cardValidation } from '~/validations/cardValidation.js';

const Router = express.Router();

Router.route("/")
  .post(cardValidation.createNew, cardController.createNew);

export const cardRoute = Router;