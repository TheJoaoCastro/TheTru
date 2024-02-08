const { Datatypes } = require('sequelize')
const db  = require('../db/conn')

const User = db.define('User', {
    name: {
        type: Datatypes.STRING,
        require: true,
        allowNull: false
    },
    email: {
        type: Datatypes.STRING,
        require: true,
        allowNull: false
    },
    password: {
        type: Datatypes.STRING,
        require: true,
        allowNull: false
    },
    picture: {
        type: Datatypes.STRING
    }
})

module.exports = User