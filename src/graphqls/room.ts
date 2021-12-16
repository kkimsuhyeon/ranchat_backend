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
    roomListUpdate: Room
    chattingUpdate: Message
  }
`;

export const resolvers: IResolvers = {
  Query: {
    rooms: async () => {
      const roomRepo = getRepository(Room);

      try {
        const result = await roomRepo
          .createQueryBuilder("room")
          .leftJoinAndSelect("room.users", "users")
          .leftJoinAndSelect("room.messages", "messages")
          .leftJoinAndSelect("messages.user", "user")
          .orderBy("messages.createdAt", "DESC", "NULLS LAST")
          .addOrderBy("room.createdAt", "DESC")
          .getMany();

        return result;
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
        const result = await roomRepo
          .createQueryBuilder("room")
          .leftJoinAndSelect("room.users", "users")
          .leftJoinAndSelect("room.messages", "messages")
          .leftJoinAndSelect("messages.user", "user")
          .where("room.id = :roomId", { roomId: id })
          .orderBy("messages.createdAt", "ASC")
          .getOne();

        return result;
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
        const users = await userRepo
          .createQueryBuilder("user")
          .where("user.id IN (:...userId)", { userId: [req.user.id, userId] })
          .getMany();

        const newRoom = new Room();
        Object.assign(newRoom, { users });
        roomRepo.save(newRoom);

        pubSub.publish("room", { roomListUpdate: newRoom });

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
        await roomRepo
          .createQueryBuilder("room")
          .delete()
          .where("room.id = :id", { id: id })
          .execute();

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
