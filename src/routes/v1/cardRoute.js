import express from 'express';
import { cardController } from '~/controllers/cardController.js';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware';
import { cardValidation } from '~/validations/cardValidation.js';

const Router = express.Router();

Router.route("/")
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew);

Router.route("/:id")
  .put(multerUploadMiddleware.upload.single('cardCover'), authMiddleware.isAuthorized, cardValidation.update, cardController.update)

export const cardRoute = Router;