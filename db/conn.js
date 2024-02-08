const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('thetru', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

try {
    sequelize.authenticate()
} catch (error) {
    console.log(error)
}

module.exports = sequelize