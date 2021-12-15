import { CustomApolloError } from "../class/CustomError";

export const tokenAuthenticator = (request: any) => {
  if (!request.user)
    throw new CustomApolloError({
      code: "499",
      message: "유효하지 않은 token",
    });
};
