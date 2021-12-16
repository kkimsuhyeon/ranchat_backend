import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { tokenAuthenticator } from "../utils/authenticator";

import { User } from "../entities/User";

export const typeDef = gql`
  extend type Query {
    hello: String!
    checkAuth: Boolean!
    testArray(userEmail: String): User
  }

  extend type Mutation {
    requestCall: Boolean
  }

  extend type Subscription {
    call: Boolean
  }
`;

export const resolvers: IResolvers = {
  Query: {
    hello: () => {
      return "hello";
    },

    checkAuth: (_: any, _args: any, { req }) => {
      tokenAuthenticator(req);
      return true;
    },

    testArray: async (_: any, args: { userEmail: string }) => {
      const userRepo = getRepository(User);

      const { userEmail } = args;

      const result = await userRepo
        .createQueryBuilder("user")
        .where("user.email = :email ", { email: userEmail })
        .leftJoinAndSelect("user.rooms", "rooms")
        .leftJoinAndSelect("rooms.users", "users")
        .leftJoinAndSelect("user.messages", "messages")
        .getOne();

      return result;
    },
  },

  Mutation: {
    requestCall: () => {
      pubSub.publish("call", { call: true });
    },
  },

  Subscription: {
    call: {
      subscribe: () => {
        return pubSub.asyncIterator("call");
      },
      resolve: () => {},
    },
  },
};
