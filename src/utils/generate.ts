import jwt from "jsonwebtoken";

export const generateToken = (id: string) => {
  return jwt.sign({ id: id }, "secret");
};
