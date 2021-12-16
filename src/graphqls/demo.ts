import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { tokenAuthenticator } from "../utils/authenticator";

import { User } from "../entities/User";
import { Room } from "../entities/Room";

export const typeDef = gql`
  extend type Query {
    hello: String!
    checkAuth: [User]
    testSelect(userEmail: String): User
    testWhere(roomId: Int): Room
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

    checkAuth: async (_: any, _args: any, { req }) => {
      tokenAuthenticator(req);

      const userRepo = getRepository(User);

      const users = await userRepo
        .createQueryBuilder("user")
        .where("user.id IN (:...userId)", {
          userId: [req.user.id, "dcaed30e-8d0f-4e0c-87bf-ab89c722beb9"],
        })
        .getMany();

      return users;
    },

    testSelect: async (_: any, args: { userEmail: string }) => {
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

    testWhere: async (_: any, args: { roomId: number }, { req }) => {
      const roomRepo = getRepository(Room);

      const { roomId } = args;
      try {
        const room = await roomRepo
          .createQueryBuilder("room")
          .leftJoinAndSelect("room.users", "users")
          .where("room.id = :roomId", { roomId: roomId })
          .getOne();

        if (room && room.users.some((user) => user.id === req.user.id)) {
          return room;
        }
        return null;
      } catch (e) {
        console.log(e);
        return e;
      }
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
