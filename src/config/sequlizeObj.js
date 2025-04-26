// Sequlize ORM for Postgres Integration
const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

// Export object to avoid repeating the same code for defining Schemas.
module.exports = sequelize;