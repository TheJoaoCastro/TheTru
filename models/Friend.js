const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const User = require('./User')

const Friend = db.define('Friend', {
    friendOneUuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    friendTwoUuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    friendOneAccept: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    friendTwoAccept: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
})

module.exports = Friend