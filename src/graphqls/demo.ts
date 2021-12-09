import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";

import { pubSub } from "../server";

import { tokenAuthenticator } from "../utils/authenticator";

export const typeDef = gql`
  extend type Query {
    hello: String!
    checkAuth: Boolean!
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
