// Sequlize ORM for Postgres Integration
const {Sequelize} = require('sequelize');
const sequelize = require('./sequlizeObj');

// Postgres Database Connection. Credentials stored in env
async function dbConnection() {
    try {
        await sequelize.authenticate();
        console.log("SUCCESS > config/database.js > dbConnection() > DB Connection Successful");
    } catch(err) {
        console.error(`ERROR > config/database.js > dbConnection() > DB Connection Failed with message = ${err.message}`);
    }
};


// Export dbConnections to initiate it in IIFE
module.exports = {
    dbConnection
}