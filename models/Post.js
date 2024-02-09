const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const User = require('../models/User')

const Post = db.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    UserUuid: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

Post.belongsTo(User)
User.hasMany(Post)

module.exports = Post