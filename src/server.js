/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from "express";
import { mapOrder } from "~/utils/sorts.js";

import { CONNECT_DB, GET_DB, CLOSE_DB } from "~/config/mongodb.js";
import exitHook from "async-exit-hook";

const app = express();

const hostname = "localhost";
const port = 8017;

const START_SERVER = () => {
  app.get("/", (req, res) => {
    // Test Absolute import mapOrder
    console.log(
      mapOrder(
        [
          { id: "id-1", name: "One" },
          { id: "id-2", name: "Two" },
          { id: "id-3", name: "Three" },
          { id: "id-4", name: "Four" },
          { id: "id-5", name: "Five" }
        ],
        ["id-5", "id-4", "id-2", "id-3", "id-1"],
        "id"
      )
    );
    res.end("<h1>Hello World!</h1><hr>");
  });

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Trung Quan Dev, I am running at ${hostname}:${port}/`);
  });

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
