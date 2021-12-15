import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { tokenAuthenticator } from "../utils/authenticator";

import { Room } from "../entities/Room";
import { User } from "../entities/User";

export const typeDef = gql`
  type Room {
    id: Int!
    users: [User]
    messages: [Message]
    createdAt: Date
    updatedAt: Date
  }

  extend type Query {
    rooms: [Room]
    roomById(id: Int!): Room
  }

  extend type Mutation {
    createRoomByUserId(userId: String!): Boolean
    deleteRoomById(id: Int!): Boolean
  }

  extend type Subscription {
    roomListUpdate: User
    chattingUpdate: Room
  }
`;

export const resolvers: IResolvers = {
  Query: {
    rooms: async () => {
      const roomRepo = getRepository(Room);

      try {
        const rooms = await roomRepo.find({
          relations: ["users", "messages", "messages.user"],
          order: { id: "ASC" },
        });
        return rooms;
      } catch (e) {
        console.log(e);
        return null;
      }
    },

    roomById: async (_: any, args: { id: number }, { req }) => {
      tokenAuthenticator(req);

      const roomRepo = getRepository(Room);

      const { id } = args;

      try {
        const room = await roomRepo.findOne({
          where: { id: id },
          relations: ["users", "messages", "messages.user"],
        });
        return room;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },

  Mutation: {
    createRoomByUserId: async (_: any, args: { userId: string }, { req }) => {
      const { userId } = args;

      const roomRepo = getRepository(Room);
      const userRepo = getRepository(User);

      try {
        await roomRepo
          .create({
            users: [
              (await userRepo.findOne({ where: { id: req.user.id } })) as User,
              (await userRepo.findOne({ where: { id: userId } })) as User,
            ],
          })
          .save();

        pubSub.publish("room", {
          roomListUpdate: await userRepo.findOne({
            where: { id: req.user.id },
            relations: ["rooms", "rooms.messages"],
          }),
        });

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },

    deleteRoomById: async (_: any, args: { id: number }) => {
      const roomRepo = getRepository(Room);

      const { id } = args;

      try {
        await roomRepo.delete({ id: id });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },

  Subscription: {
    roomListUpdate: { subscribe: () => pubSub.asyncIterator("room") },
    chattingUpdate: { subscribe: () => pubSub.asyncIterator("chatting") },
  },
};
