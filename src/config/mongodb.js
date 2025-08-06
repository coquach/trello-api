
//vinhco
//cXYJ7T0YoaQuSwzU

//1saQWReqGBPcG6ff

import { env } from "~/config/environment.js";

import { MongoClient, ServerApiVersion } from "mongodb";

let trelloDatabaseInstance = null;

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
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
