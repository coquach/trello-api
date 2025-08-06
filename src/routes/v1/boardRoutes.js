import express from 'express';
import { StatusCodes } from 'http-status-codes'

const Router = express.Router();

Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Get boards' });
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'Resource created successfully' });
  });

export const boardRoutes = Router;