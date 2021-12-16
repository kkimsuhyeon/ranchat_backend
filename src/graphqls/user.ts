import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { encodeToken } from "../utils/generate";
import { tokenAuthenticator } from "../utils/authenticator";

import { CustomApolloError } from "../class/CustomError";

import { User } from "../entities/User";

export const typeDef = gql`
  type User {
    id: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    fullName: String
    bio: Bio
    loginSecret: String
    rooms: [Room]
    messages: [Message]
    createdAt: Date
    updatedAt: Date
  }

  extend type Query {
    users: [User]
    userByEmail(email: String!): [User]
    requestToken(email: String!, password: String): String!
  }

  extend type Mutation {
    createUser(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
      bio: Bio
    ): User
  }
`;

export const resolvers: IResolvers = {
  User: {
    fullName: (parent: User) => {
      return `${parent.lastName} ${parent.firstName}`;
    },
  },

  Query: {
    users: async (_: any, __: any, { req }) => {
      tokenAuthenticator(req);

      const userRepo = getRepository(User);

      try {
        const result = await userRepo.createQueryBuilder("users").getMany();
        return result;
      } catch (e) {
        console.log(e);
        return null;
      }
    },

    userByEmail: async (_: any, args: { email: string }, { req }) => {
      tokenAuthenticator(req);

      const { email } = args;

      const userRepo = getRepository(User);

      try {
        const result = await userRepo
          .createQueryBuilder("user")
          .where("user.email LIKE :email", { email: `%${email}%` })
          .getMany();

        return result;
      } catch (e) {
        console.log(e);
        return null;
      }
    },

    requestToken: async (_: any, args: { email: string; password: string }) => {
      const userRepo = getRepository(User);

      const { email, password } = args;

      try {
        const user = await userRepo
          .createQueryBuilder("user")
          .where("user.email = :email", { email: email })
          .andWhere("user.password = :password", { password: password })
          .getOne();

        if (user) return encodeToken(user.id, user.email);

        return new CustomApolloError({
          message: "아이디 / 비밀번호 확인",
          code: "401",
        });
      } catch (e) {
        throw Error(e);
      }
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      args: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        bio: "W" | "M";
      }
    ) => {
      const userRepo = getRepository(User);

      const { bio, email, firstName, lastName, password } = args;

      try {
        const newUser = new User();
        Object.assign(newUser, { email, password, firstName, lastName, bio });

        const result = await userRepo.save(newUser);

        if (result) return result;
        return null;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },
};
