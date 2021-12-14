import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { tokenAuthenticator } from "../utils/authenticator";

import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Room } from "../entities/Room";

export const typeDef = gql`
  type Message {
    id: Int!
    text: String
    user: User
    room: Room
    createdAt: Date
  }

  extend type Query {
    messages: [Message]
  }

  extend type Mutation {
    sendMessage(message: String!): Boolean
  }
`;

export const resolvers: IResolvers = {
  Query: {
    messages: async (_: any, __: any, { req }) => {
      const messageRepo = getRepository(Message);

      tokenAuthenticator(req);

      try {
        const result = await messageRepo.find({ relations: ["user", "room"] });
        return result;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },

  Mutation: {
    sendMessage: async (_: any, args: { message: string }, { req }) => {
      tokenAuthenticator(req);

      const messageRepo = getRepository(Message);
      const userRepo = getRepository(User);
      const roomRepo = getRepository(Room);

      const { message } = args;

      try {
        await messageRepo
          .create({
            text: message,
            user: (await userRepo.findOne({
              where: { id: req.user.id },
            })) as User,
            room: (await roomRepo.findOne({ where: { id: 1 } })) as Room,
          })
          .save();

        pubSub.publish("chatting", {
          chattingUpdate: await roomRepo.findOne({
            where: { id: 1 },
            relations: ["users", "messages", "messages.user"],
          }),
        });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },
};
