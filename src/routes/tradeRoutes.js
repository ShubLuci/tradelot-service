const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Trade = require('../models/trade');
const Lot = require('../models/lot');
const { bulkLoadTrades } = require('../services/tradeService');

// API to Create A New Trade
router.post('/createNewTrade', async (req, res, next) => {
  try {
    const { stock_name, quantity, broker_name, price, matching_method } = req.body;
    const trade = await Trade.create({ stock_name, quantity, broker_name, price });
    let matchedLots = [];

    // Case where lot quantity is positive i.e. Create a new trade lot
    if (quantity > 0) {
      // Buy: Create a new lot
      await Lot.create({
        trade_id: trade.trade_id,
        lot_quantity: quantity,
        realized_quantity: 0,
        realized_trade_id: null,
        lot_status: 'OPEN',
      });
    } 
    // Case where lot quantity is negative i.e. Selling the lot
    else {
      // Sell: Match against lots
      let remaining = Math.abs(quantity);

      const openLots = await Lot.findAll({
        where: { lot_status: { [Op.in]: ['OPEN', 'PARTIALLY_REALIZED'] } },
        include: [{ model: Trade, where: { stock_name } }],
        order: [['lot_id', matching_method === 'LIFO' ? 'DESC' : 'ASC']],
      });

      for (const lot of openLots) {
        if (remaining <= 0) 
          break;

        const available = lot.lot_quantity - lot.realized_quantity;
        
        if (available <= 0) 
          continue;

        const take = Math.min(available, remaining);
        lot.realized_quantity += take;
        lot.realized_trade_id = trade.trade_id;
        lot.lot_status = lot.realized_quantity === lot.lot_quantity ? 'FULLY_REALIZED' : 'PARTIALLY_REALIZED';
        
        await lot.save();

        matchedLots.push({
          lot_id: lot.lot_id,
          lot_quantity: lot.lot_quantity,
          realized_quantity: lot.realized_quantity,
          lot_status: lot.lot_status,
          realized_trade_id: lot.realized_trade_id,
        });

        remaining -= take;
      }

      if (remaining > 0) {
        throw new Error('Not enough shares available to sell!');
      }
    }

    // Return both trade and matched lots
    res.status(201).send({
      statusCode: 201,
      trade,
      matchedLots
    });

  } catch (err) {
    res.status(400).send({
      statusCode: 400,
      message: `createNewTrade API Execution Error with message ${err.message}`
    });
  }
});


// API to Get all Trades
router.get('/getAllTrades', async (req, res, next) => {
  try { 
    // Fetch all data from trade table.
    const trades = await Trade.findAll();
    if(trades.length==0) {
      res.status(204).send();
    } else {
      res.send(trades);   
    }
  } catch (err) { 
    res.status(400).send({
      statusCode: 400,
      message: `getAllTrades API Execution Error with message ${err.message}`
    });
  }
});


// API to bulk upload all the trades through a json array.
router.post('/bulkLoadTrades', async (req, res, next) => {
  try {
    const { trades } = req.body;

    // Execute the bulkLoadTrades function and return the results
    const results = await bulkLoadTrades(trades);
    res.status(201).send(results);
  } catch (err) {
    res.status(400).send({
      statusCode: 400,
      message: `bulkLoadTrades API Execution Error with message ${err.message}`
    });
  }
});

module.exports = router;