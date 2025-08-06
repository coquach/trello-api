/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
//vinhco
//cXYJ7T0YoaQuSwzU

//1saQWReqGBPcG6ff

const MONGODB_URI =
  "mongodb+srv://vinhco:cXYJ7T0YoaQuSwzU@cluster0-quachvinhco.twz6gwo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-QuachVinhCo";

const DATABASE_NAME = "trello";

import { MongoClient, ServerApiVersion } from "mongodb";

let trelloDatabaseInstance = null;

const mongoClientInstance = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME);
};

export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    throw new Error("Database not connected. Please call CONNECT_DB first.");
  }
  return trelloDatabaseInstance;
};

export const CLOSE_DB = async () => {

    await mongoClientInstance.close();
  
};
