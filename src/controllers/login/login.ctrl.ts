import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { User } from "../../entities/User";

export const postLogin = async (
  _req: Request<{ email: string }>,
  res: Response
) => {
  const userRepo = getRepository(User);

  try {
    const newUser = new User();

    Object.assign(newUser, {
      email: "test",
      password: "test",
      firstName: "μν",
      lastName: "κΉ",
    });

    await userRepo.save(newUser);

    return res.status(200).send("success login");
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: e });
  }
};
