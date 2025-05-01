const { Op } = require('sequelize');
const Trade = require('../models/trade');


/*
FIFO Calulation Explained:
  1. First In First Out
  2. Oldest lot first to be sold
*/ 
async function calculateFIFO(stock_name) {
  
  const buys = await Trade.findAll({ 
    where: { 
      stock_name, 
      quantity: { [Op.gt]: 0 } 
    }, 
    order: [['timestamp', 'ASC']] 
  });

  const sells = await Trade.findAll({ 
    where: { 
      stock_name, 
      quantity: { [Op.lt]: 0 } 
    }, 
    order: [['timestamp', 'ASC']] 
  });

  const lots = [];
  
  for (const buy of buys) {
    lots.push({ 
      lot_id: buy.trade_id, 
      lot_quantity: buy.quantity, 
      realized_quantity: 0, 
      lot_status: 'OPEN', 
      trade: buy 
    });
  }

  for (const sell of sells) {
    let remaining = Math.abs(sell.quantity);
    for (const lot of lots) {
      if (remaining === 0) 
        break;
      const available = lot.lot_quantity - lot.realized_quantity;
      if (available <= 0) 
        continue;
      const take = Math.min(available, remaining);
      lot.realized_quantity += take;
      lot.lot_status = lot.realized_quantity === lot.lot_quantity ? 'FULLY_REALIZED' : 'PARTIALLY_REALIZED';
      lot.realized_trade_id = sell.trade_id;
      remaining -= take;
    }
  }

  return lots.map(data => ({
    lot_id: data.lot_id,
    lot_quantity: data.lot_quantity,
    realized_quantity: data.realized_quantity,
    lot_status: data.lot_status,
    realized_trade_id: data.realized_trade_id
  }));
}



/*
LIFO Calulation Explained:
  1. Last In First Out
  2. Newest Lot to be Sold First ( most recent buys )
*/ 
async function calculateLIFO(stock_name) {
  
  const buys = await Trade.findAll({ 
    where: { 
      stock_name, 
      quantity: { [Op.gt]: 0 } 
    }, 
    order: [['timestamp', 'ASC']] 
  });

  const sells = await Trade.findAll({ 
    where: { 
      stock_name, 
      quantity: { [Op.lt]: 0 } 
    }, 
    order: [['timestamp', 'ASC']] 
  });

  const lots = [];
  for (const buy of buys) {
    lots.push({ 
      lot_id: buy.trade_id, 
      lot_quantity: buy.quantity, 
      realized_quantity: 0, 
      lot_status: 'OPEN', 
      trade: buy 
    });
  }

  for (const sell of sells) {
    let remaining = Math.abs(sell.quantity);
    for (const lot of lots.slice().reverse()) {
      if (remaining === 0) 
        break;
      const available = lot.lot_quantity - lot.realized_quantity;
      if (available <= 0) 
        continue;
      const take = Math.min(available, remaining);
      lot.realized_quantity += take;
      lot.lot_status = lot.realized_quantity === lot.lot_quantity ? 'FULLY_REALIZED' : 'PARTIALLY_REALIZED';
      lot.realized_trade_id = sell.trade_id;
      remaining -= take;
    }
  }

  return lots.map(data => ({
    lot_id: data.lot_id,
    lot_quantity: data.lot_quantity,
    realized_quantity: data.realized_quantity,
    lot_status: data.lot_status,
    realized_trade_id: data.realized_trade_id
  }));
}

module.exports = { calculateFIFO, calculateLIFO };