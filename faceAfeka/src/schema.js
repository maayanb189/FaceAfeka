const graphql = require('graphql')
const User = require('./models/User')
const Post = require('./models/Post')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {
    GraphQLInputObjectType,
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLDate
} = graphql
const socket = require('./socket')


const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        profileImage: { type: GraphQLString },
        friendsCount: { type: GraphQLInt },
        friendsList: {type: GraphQLList(GraphQLString)},
        lastLoginAt : { type: GraphQLString }
    })
})


const PostType = new GraphQLObjectType({
    name: 'PostType',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID)},
        content: { type: GraphQLString },
        date: { type: GraphQLString },
        location: { type: GraphQLString },
        likesCount: { type: GraphQLInt },
        likes: {type: GraphQLList(GraphQLString)},
        isPrivate: {type: GraphQLBoolean },
        userId: {type: GraphQLString },
        images: {type: GraphQLList(GraphQLString)},
        user: {
            type: UserType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return User.findById({_id: parent.userId})
            }
        }
    })
})

const Query = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({})
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args){
                return Post.find({isPrivate: false}).sort({date: -1})
            }
        }

    }
})

const Mutation = new GraphQLObjectType({
    name: 'MutationType',
    fields: {
        getPosts: {
            type: new GraphQLList(PostType),
            args: {
                userId: {type: GraphQLString}
            },
            resolve(parent, args){
                console.log('args.userId', args.userId)
                return Post.find({$or:[{isPrivate: false, userId: {$ne: args.userId}}, {isPrivate: true, userId: args.userId}]}).sort({date: -1})
            }
        },

        getUserByEmail: {
            type: UserType,
            args: {
                email: { type: GraphQLString }
            },
            resolve(parent, args){
                let user = User.findOne({ email: args.email })
                return user
            }
        },

        createUser: {
            type: UserType,
            args: {
                firstname: { type: GraphQLString},
                lastname: {type: GraphQLString},
                email: { type: GraphQLString },
                password: { type: GraphQLString },
                profileImage: { type: GraphQLString }
            },
            resolve(parent, args){
              let user = new User({
                    firstname: args.firstname,
                    lastname: args.lastname,
                    email: args.email,
                    password: args.password,
                    profileImage: args.profileImage,
                    friendsCount: 0,
                    friendsList: [],
                    lastLoginAt: new Date()
                })
    
                return user.save()
            }
        
        },


        

        createPost: {
            type: PostType,
            args: {
                content: { type: GraphQLString },
                location: { type: GraphQLString },
                userId: {type: GraphQLString },
                isPrivate: {type: GraphQLBoolean },
                images: {type: GraphQLList(GraphQLString)}
            },
            resolve(parent, args){
                console.log('args', args)
                let post = new Post({
                    content: args.content,
                    date: new Date(),
                    location: args.location,
                    likesCount: 0,
                    likes: [],
                    isPrivate: args.isPrivate,
                    userId: args.userId,
                    images: args.images
                })

                socket.publish('postCreated', {
                    postCreated: post
                })

                return post.save()
            }
        },

        deletePost: {
            type: PostType, 
            args: {
                id: { type: GraphQLID }
            }, 
            async resolve(parent, args){
                let post = await Post.findOneAndDelete({ _id: args.id })
                socket.publish('postDeleted', {
                    postDeleted: post
                })
                return post
            }
        },

      
   
        
       
    }
})

const Subscription = new GraphQLObjectType({
    name: 'SubscriptionType',
    fields: {
        postCreated: {
            type: PostType,
            subscribe: () => socket.asyncIterator('postCreated')
        },
        postDeleted: {
            type: PostType,
            subscribe: () => socket.asyncIterator('postDeleted')
        },
        postUpdated: {
            type: PostType,
            subscribe: () => socket.asyncIterator('postUpdated')
        },
    }
})

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
    subscription: Subscription
})

module.exports = schema