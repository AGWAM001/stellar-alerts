import { ApolloServer } from '@apollo/server';
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from '@as-integrations/fastify';
import fastify, { FastifyInstance } from 'fastify';
import { typeDefs } from './graphql.schema';
import { createResolvers } from './graphql.resolvers';
import { getRedisClient } from '../../lib/redis';

export const graphqlRoutes = async (app: FastifyInstance) => {
  const redis = getRedisClient();
  const resolvers = createResolvers(redis);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });

  await server.start();

  const handler = fastifyApolloHandler(server);

  app.route({
    url: '/graphql',
    method: ['GET', 'POST'],
    handler,
    wsHandler: fastifyApolloHandler(server, {
      context: async () => ({ redis }),
    }),
  });
};
