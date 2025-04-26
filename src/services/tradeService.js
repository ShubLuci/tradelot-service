const { Op } = require('sequelize');
const Trade = require('../models/trade');
const Lot = require('../models/lot');

// Instead of create new trades one by one, this features will bulk upload the trades at the same time and calculate each trade entry for the matching_method i.e LIFO/FIFO. Enter a negative quantity and it will directly calculate the LIFO/FIFO based on matching_method shared.
async function bulkLoadTrades(tradesArray) {
    const sequelize = Trade.sequelize;

    // Transaction so that if one trade fails rollback everything else commit.
    return await sequelize.transaction(async (t) => {
      const results = [];
      for (const tData of tradesArray) {
        const { stock_name, quantity, broker_name, price, matching_method } = tData;
        
        // Create trade record
        const trade = await Trade.create(
          { stock_name, quantity, broker_name, price },
          { transaction: t }
        );
  
        let matchedLots = [];
        if (quantity > 0) {
          // Buy: create a new lot
          await Lot.create(
            {
              trade_id: trade.trade_id,
              lot_quantity: quantity,
              realized_quantity: 0,
              realized_trade_id: null,
              lot_status: 'OPEN',
            },
            { transaction: t }
          );
        } else {
          // Sell: match against existing lots
          let remaining = Math.abs(quantity);
          const openLots = await Lot.findAll({
            where: { 
              lot_status: { 
                [Op.in]: ['OPEN', 'PARTIALLY_REALIZED'] 
              } 
            },
            include: [{ 
              model: Trade, 
              where: { stock_name } 
            }],
            order: [['lot_id', matching_method === 'LIFO' ? 'DESC' : 'ASC']],
            transaction: t,
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
            lot.lot_status =
              lot.realized_quantity === lot.lot_quantity
                ? 'FULLY_REALIZED'
                : 'PARTIALLY_REALIZED';
            await lot.save({ transaction: t });
  
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
  
        results.push({ trade, matchedLots });
      }
      return results;
    });
  }
  
  module.exports = { bulkLoadTrades };