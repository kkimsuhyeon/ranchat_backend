import { Request, Response } from "express";

import { pubSub } from "../../server";

export const getDemo = async (req: Request, res: Response) => {
  pubSub.publish("call", { call: "Test" }); // 가능 함

  return res.status(200).send({ message: "test" });
};
