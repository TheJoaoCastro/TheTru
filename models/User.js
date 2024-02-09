const { DataTypes } = require('sequelize')
const db  = require('../db/conn')

const User = db.define('User', {
    uuid: {
        type: DataTypes.STRING,
        require: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        require: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        require: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        require: true,
        allowNull: false
    },
    picture: {
        type: DataTypes.STRING
    }
})
 
module.exports = User