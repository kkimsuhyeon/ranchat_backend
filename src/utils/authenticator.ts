import { CustomError } from "../class/CustomError";

export const tokenAuthenticator = (request: any) => {
  if (!request.user)
    return new CustomError({ code: "499", message: "존재하지 않는 유저" });
  return;
};
