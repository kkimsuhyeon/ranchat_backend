import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";

import { pubSub } from "../server";

export const typeDef = gql`
  extend type Query {
    hello: String!
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
  },

  Mutation: {
    requestCall: () => {
      pubSub.publish("call", { call: true });
    },
  },

  Subscription: {
    call: {
      subscribe: () => pubSub.asyncIterator("call"),
    },
  },
};
