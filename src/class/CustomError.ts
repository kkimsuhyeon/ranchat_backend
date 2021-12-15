import { ApolloError } from "apollo-server-express";

export class CustomApolloError extends ApolloError {
  constructor({ code, message }: { code: string; message: string }) {
    super(message, code);

    Object.defineProperty(this, "name", { value: "CustomError" });
  }
}
