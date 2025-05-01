// Sequlize ORM for Postgres Integration
const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      }
);

// Export object to avoid repeating the same code for defining Schemas.
module.exports = sequelize;