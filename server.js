const express = require('express');
const mongodb = require('mongodb');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const port = process.env.PORT || 8080;

const app = express();


//Es obligatorio definir o Query, o Mutation
const typeDefs = `
  type Query {
    films: [Film]
    film(episode_id: Int!): Film
  }

  type Film {
    episode_id: Int
    director: String
    title: String
  }
`;

const resolvers = {
  Query: {
    films: (root, args, context) => context.mongo.collection('films').find({}).toArray(),
    film: (root, {episode_id}, context) => context.mongo.collection('film').findOne({episode_id}),
  }
};

// typeDefs: el string con las definiciones
// resolvers: objecto con las funciones
const schema = makeExecutableSchema({ typeDefs, resolvers });

const options = {
  auth: {
    user: process.env.MONGO_DB_APP_USERNAME || 'node',
    password: process.env.MONGO_DB_APP_PASSWORD || 'node'
  },
  keepAlive: true,
  reconnectTries: 30,
  socketTimeoutMS: 0
};

mongodb.connect('mongodb://127.0.0.1/starwars', options)
  .then((mongo) => {
    app.listen(port);
    console.log('Connected to mongo DB!');
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        context: { mongo },
        graphiql: true
      })
    );
    console.log(`Server listening at localhost:${port}`);
  })
  .catch(console.error);