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
    testArray(userId: String): User
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

    testArray: async (_: any, args: { userId: string }) => {
      const userRepo = getRepository(User);

      const { userId } = args;

      const test = userRepo.findOne({
        relations: ["rooms"],
        where: { id: userId },
      });

      return test;
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
