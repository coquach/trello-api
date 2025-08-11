/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from "express";
import exitHook from "async-exit-hook";
import { env } from "~/config/environment.js";
import { CLOSE_DB, CONNECT_DB } from "~/config/mongodb.js";
import { APIs_V1 } from "~/routes/v1/index.js";
import { errorHandlingMiddleware } from "~/middlewares/errorHandllingMiddleware.js";
import cors from "cors";
import { corsOptions } from "~/config/cors";


const START_SERVER = () => {
  const app = express();

  app.use(cors(corsOptions));

  app.use(express.json());

  app.use("/v1", APIs_V1);

  app.use(errorHandlingMiddleware);

  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Hello VinhCo, I am running at port:${process.env.PORT}/`);
    });
  } else {
    app.listen(env.APP_PORT, env.APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`Hello VinhCo, I am running at ${env.APP_HOST}:${env.APP_PORT}/`);
    });
  }


  exitHook(() => {
    // eslint-disable-next-line no-console
    console.log("Closing the server...");
    CLOSE_DB();
    console.log("Server closed successfully!");
  });
};

(async () => {
  try {
    await CONNECT_DB();
    console.log("Connected to MongoDB successfully!");
    START_SERVER();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
})();
