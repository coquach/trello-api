import express from 'express';
import { userController } from '~/controllers/userController.js';
import { userValidation } from '~/validations/userValidation.js';

const Router = express.Router();

Router.route("/register")
  .post(userValidation.createNew, userController.createNew);


export const userRoute = Router;