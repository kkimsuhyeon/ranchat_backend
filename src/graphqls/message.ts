import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { getRepository } from "typeorm";

import { pubSub } from "../server";

import { CustomApolloError } from "../class/CustomError";

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
    sendMessage(message: String!, roomId: Int!): Boolean
  }
`;

export const resolvers: IResolvers = {
  Query: {
    messages: async (_: any, __: any, { req }) => {
      tokenAuthenticator(req);

      const messageRepo = getRepository(Message);

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
    sendMessage: async (
      _: any,
      args: { message: string; roomId: number },
      { req }
    ) => {
      tokenAuthenticator(req);

      // 방에 참가자가 아닌 user는 메세지 전송하면 안됨.

      const messageRepo = getRepository(Message);
      const userRepo = getRepository(User);
      const roomRepo = getRepository(Room);

      const { message, roomId } = args;

      try {
        const user = (await userRepo.findOne({
          where: { id: req.user.id },
        })) as User;

        const room = (await roomRepo.findOne({
          where: { id: roomId },
          relations: ["users", "messages", "messages.user"],
        })) as Room;

        if (!user)
          return new CustomApolloError({ message: "user 확인", code: "421" });
        if (!room)
          return new CustomApolloError({ message: "채팅방 확인", code: "422" });

        await messageRepo
          .create({ text: message, user: user, room: room })
          .save();

        pubSub.publish("chatting", { chattingUpdate: room });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },
};
