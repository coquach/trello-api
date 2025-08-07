import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardRoute } from '~/routes/v1/boardRoute.js';

const Router = express.Router();

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to the Trello API' });
});

Router.use('/boards', boardRoute);

export const APIs_V1 = Router;