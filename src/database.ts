import "reflect-metadata";
import { Connection, createConnection } from "typeorm";

import entities from "./entities";

const dbConnection = async () => {
  try {
    const db: Connection = await createConnection({
      type: "postgres",
      host: process.env.TYPEORM_HOST,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      port: 5432,
      database: "ranchat",
      // logging: true,
      synchronize: true,
      entities: entities,
    });

    await db.synchronize();
  } catch (e) {
    throw new Error(e);
  }
};

export default dbConnection;
