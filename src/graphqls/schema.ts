import { gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers } from "@graphql-tools/utils";
import { merge } from "lodash";

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
  typeDefs: [typeDef],
  resolvers: merge(resolvers),
});

export default schema;
