import jwt from "jsonwebtoken";

export const encodeToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, "secret");
};

export const decodeToken = async (token: string) => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = Buffer.from(base64Payload, "base64");
    const result = await JSON.parse(payload.toString());
    return result;
  } catch (e) {
    throw new Error("499");
  }
};
