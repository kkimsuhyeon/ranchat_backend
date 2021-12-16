import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { CustomApolloError } from "../class/CustomError";

import { tokenAuthenticator } from "../utils/authenticator";

import { Message } from "../entities/Message";
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
    sendMessage(message: String!, roomId: Int!): Boolean
  }
`;

export const resolvers: IResolvers = {
  Query: {
    messages: async (_: any, __: any, { req }) => {
      tokenAuthenticator(req);

      const messageRepo = getRepository(Message);

      try {
        const result = await messageRepo
          .createQueryBuilder("message")
          .leftJoinAndSelect("message.user", "user")
          .leftJoinAndSelect("message.room", "room")
          .getMany();

        return result;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  },

  Mutation: {
    sendMessage: async (
      _: any,
      args: { message: string; roomId: number },
      { req }
    ) => {
      tokenAuthenticator(req);

      const messageRepo = getRepository(Message);
      const roomRepo = getRepository(Room);

      const { message, roomId } = args;

      try {
        const room = await roomRepo
          .createQueryBuilder("room")
          .leftJoinAndSelect("room.users", "users")
          .leftJoinAndSelect("room.messages", "messages")
          .where("room.id = :roomId", { roomId: roomId })
          .getOne();

        if (!room || !room.users.some((user) => user.id === req.user.id)) {
          return new CustomApolloError({
            message: "채팅방을 확인해주세요",
            code: "431",
          });
        }

        const newMessage = new Message();
        Object.assign(newMessage, {
          text: message,
          user: room.users.filter((user) => user.id === req.user.id)[0],
          room: room,
        });

        await messageRepo.save(newMessage);

        pubSub.publish("chatting", { chattingUpdate: newMessage });
        pubSub.publish("room", { roomListUpdate: room });

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },
};
