const express = require('express');
const router = express.Router();
const { calculateFIFO, calculateLIFO } = require('../services/lotService');

// API to Get FIFO lots. Use params to send the stock name
router.get('/fifo/:stock', async (req, res, next) => {
  try {
    const stock = req.params.stock;
    const result = await calculateFIFO(stock);
    res.send({
      statusCode: 200,
      result
    });
  } catch (err) { 
    res.status(400).send({
      statusCode: 400,
      message: `FIFO API Execution Error with message ${err.message}`
    });
  }
});

// API to Get LIFO lots. Use params to send the stock name
router.get('/lifo/:stock', async (req, res, next) => {
  try {
    const stock = req.params.stock;
    const result = await calculateLIFO(stock);
    res.send({
      statusCode: 200,
      result
    });
  } catch (err) { 
    res.status(400).send({
      statusCode: 400,
      message: `FIFO API Execution Error with message ${err.message}`
    }); 
  }
});

module.exports = router;