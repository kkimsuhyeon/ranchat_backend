import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { User } from "../entities/User";

export const typeDef = gql`
  type User {
    id: Int!
    name: String
    rooms: [Room]
    messages: [Message]
    createdAt: Date
    updatedAt: Date
  }

  extend type Query {
    users: [User]
  }

  extend type Mutation {
    createUser(name: String!): User
  }
`;

export const resolvers: IResolvers = {
  Query: {
    users: async () => {
      const userRepo = getRepository(User);
      try {
        const users = await userRepo.find({ relations: ["rooms", "messages"] });
        return users;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },

  Mutation: {
    createUser: async (_: any, args: { name: string }) => {
      const userRepo = getRepository(User);

      const { name } = args;

      try {
        const user = await userRepo.create({ name: name }).save();
        if (user) return user;
        return null;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },
};
