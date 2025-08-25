import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardRoute } from '~/routes/v1/boardRoute.js';
import { columnRoute } from '~/routes/v1/columnRoute';
import { cardRoute } from '~/routes/v1/cardRoute';
import { userRoute } from './userRoute';
import { invitationRoute } from './invitationRoute';

const Router = express.Router();

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to the Trello API' });
});

Router.use('/boards', boardRoute);

Router.use("/columns", columnRoute);

Router.use("/cards", cardRoute);

Router.use('/users', userRoute)

Router.use('/invitations', invitationRoute)


export const APIs_V1 = Router;