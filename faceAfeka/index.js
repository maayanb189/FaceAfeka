const {
    createServer
} = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const {
    graphqlExpress,
    graphiqlExpress
} = require('graphql-server-express')
const {
    SubscriptionServer
} = require('subscriptions-transport-ws')
const {
    subscribe,
    execute
} = require('graphql')
const cors = require('cors')
const expressPlayground = require('graphql-playground-middleware-express').default
const schema = require('./src/schema')
const mongoose = require('mongoose')
const db = require('./src/db')

const app = express()

const port = 5000

process.on('uncaughtException', err => console.log(err))

mongoose.Promise = global.Promise
mongoose.connect("mongodb+srv://ronfogel:h9KsGUZBwP0tOh5O@cluster-x9vor.mongodb.net/cluster?authSource=admin&retryWrites=true", {
        useNewUrlParser: true,
        useCreateIndex: true
    })
    .then(() => console.log("Connected to MongoDB!!"))
    .catch(err => console.log("got error", err))

app.use(bodyParser.json())
app.use('*',
    cors({
        allowedHeaders: 'Content-Type, Accept, Access-Control-Allow-Origin'
    }))


const addUserRoutes = require('./src/userRoute');
addUserRoutes(app);

app.use('/playground', expressPlayground({
    endpoint: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:5000/subscriptions'
}))

app.use(
    '/graphql',
    graphqlExpress({
        context: {
            db
        },
        schema
    })
)

app.use('/grapiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:5000/subscriptions'
}))

const ws = createServer(app)

ws.listen(port, err => {
    if (err) throw err

    new SubscriptionServer.create({
        schema,
        execute,
        subscribe,
        keepAlive: 5000,
        onConnect: () => console.log("Client connected to subscriptions server")
    }, {
        server: ws,
        path: '/subscriptions'
    })

    console.log("Server is Running on http://localhost:5000")
})

ws.on('error', err => console.log(err))

module.exports = app