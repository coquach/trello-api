import express from 'express';
import { cardController } from '~/controllers/cardController.js';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { cardValidation } from '~/validations/cardValidation.js';

const Router = express.Router();

Router.route("/")
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew);

export const cardRoute = Router;