import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { Room } from "../entities/Room";
import { User } from "../entities/User";

export const typeDef = gql`
  type Room {
    id: Int!
    users: [User]
    messages: [Message]
  }

  extend type Query {
    rooms: [Room]
  }

  extend type Mutation {
    createRoom: Room
    deleteRoomById(id: Int!): Boolean
  }

  extend type Subscription {
    update: Room
  }
`;

export const resolvers: IResolvers = {
  Query: {
    rooms: async () => {
      const roomRepo = getRepository(Room);

      try {
        const rooms = await roomRepo.find({
          relations: ["users", "messages", "messages.user"],
        });
        return rooms;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },

  Mutation: {
    createRoom: async () => {
      const roomRepo = getRepository(Room);
      const userRepo = getRepository(User);

      try {
        const result = await roomRepo
          .create({
            users: [
              (await userRepo.findOne({ where: { id: 1 } })) as User,
              (await userRepo.findOne({ where: { id: 2 } })) as User,
            ],
          })
          .save();

        return result;
      } catch (e) {
        console.log(e);
        return null;
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
    update: {
      subscribe: () => pubSub.asyncIterator("update"),
    },
  },
};
