const { authenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User, Book } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = User.findOne({ _id: context.user._id }).select('-password');
                return userData;
            }
            throw new authenticationError('Must be logged in!');
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => { const user = await User.create( {username, email, password });
        const token = signToken(user);
    return { token, user };
    },
    login: async (parent, {email, password}) => {
        const user = await User.findOne({email});
        if (!user) {
            throw new authenticationError('No such user found!');
        }
        const pwMatch = await user.isCorrectPassword(password);
        if(!pwMatch) {
            throw new authenticationError('incorrect password');
        }
        const token = signToken(user);

        return {token, user};
    },
    saveBook: async (parent, {bookData}, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: context.user._id,
                },
                {
                    $push: {savedBooks: bookData}
                }, {new: true}
                );
        return updatedUser;
            }
            throw new authenticationError('Must be logged in!')
        },
        removeBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    bookID: args.bookID
                });
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: book.bookID } }
                );

                return User;
            }
        throw new authenticationError('Must be logged in!')
        }
    },
};

module.exports = resolvers;