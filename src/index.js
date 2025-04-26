const express = require('express');
require('dotenv').config();
const {dbConnection} = require('./config/database');
const tradeRoutes = require('./routes/tradeRoutes');
const lotRoutes = require('./routes/lotRoutes');

const app = express();

const EXPRESS_PORT = process.env.EXPRESS_PORT;

// IIFE to initiate the Database and Express Connections
(async () => {
    try {
        // Express Server Initialization
        app.listen(EXPRESS_PORT, () => {
            console.log(`SUCCESS > index.js > IIFE > Express Server Running at Port ${EXPRESS_PORT}`);
        });
        // Database Connection Initialization
        dbConnection();
    } catch(err) {
        console.error(`ERROR > index.js > IIFE > Express Server Not Initiated with message = ${err.message}`);
    }
})();

// Use this to get POST data from the API's
app.use(express.json());

// Routes for Trades and Lots.
app.use('/api/trades', tradeRoutes);
app.use('/api/lots', lotRoutes);