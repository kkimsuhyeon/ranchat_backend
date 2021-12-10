import { ApolloServer, ExpressContext } from "apollo-server-express";
import { Application } from "express";
import { Server } from "http";
import {
  SubscriptionServer,
  ConnectionParams,
} from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import schema from "./graphqls/schema";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { getRepository } from "typeorm";

import { decodeToken } from "./utils/generate";

import { User } from "./entities/User";

const apolloConnection = async (app: Application, server: Server) => {
  const subscriptionServer = SubscriptionServer.create(
    {
      schema: schema,
      execute: execute,
      subscribe: subscribe,
      onConnect: async (connectionParams: ConnectionParams) => {
        const jsonData = decodeToken(connectionParams["authorization"]);
        const userRepo = getRepository(User);
        const user = await userRepo.findOne({ where: { id: jsonData.id } });
        if (!user) throw new Error("Token이 없습니다.");
      },
    },
    { server: server, path: "/graphql" }
  );

  const apolloServer = new ApolloServer({
    schema: schema,
    context: ({ req, res }: ExpressContext) => {
      if (req) return { req, res };
      return undefined;
    },
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app, cors: false });
};

export default apolloConnection;
