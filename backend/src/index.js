import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";
import envconf from "./conf/envconfig.js";

dotenv.config();

// Making Database Connection using IIFE function:
(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${envconf.mongoDbUri}/${DB_NAME}`);

    console.log(`Connected to database: ${envconf.mongoDbUri}/${DB_NAME}`);

    // Start listening on the port only after successful DB connection
    app.listen(envconf.port, () => {
      console.log(`App is listening at port: ${envconf.port}`);
    });

  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
})();
