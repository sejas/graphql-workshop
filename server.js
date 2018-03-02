const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongodb = require('mongodb');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

const Film = new GraphQLObjectType({
  name: 'Film',
  description: 'A Star Wars Film',
  fileds: {
    title: {type: GraphQLString},
    director: {type: GraphQLString}
  }
})

// const Character = //...

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      films: {
        type: new GraphQLList(Film),
        resolve: (root, args, context) => context.mongo.collection('films').find({}).toArray()
      },
      filmById: {
        type: Film,
        args: {
          filmId: { type: GraphQLID}
        },
        resolve: (root, {filmId}, context) => context.mongo.collection('films').findOne({episode_id: filmId})
      }
    }
  })
});


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