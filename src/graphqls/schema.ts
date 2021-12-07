import { gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers } from "@graphql-tools/utils";
import { merge } from "lodash";

import * as user from "./user";
import * as room from "./room";
import * as message from "./message";

const typeDef = gql`
  scalar JSON
  scalar Date

  type Query {
    _version: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

const resolvers: IResolvers = {
  Query: { _version: () => "1.0" },
  Mutation: {},
  Subscription: {},
};

const schema = makeExecutableSchema({
  typeDefs: [typeDef, user.typeDef, room.typeDef, message.typeDef],
  resolvers: merge(
    resolvers,
    user.resolvers,
    room.resolvers,
    message.resolvers
  ),
});

export default schema;
