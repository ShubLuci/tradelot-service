const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequlizeObj');

// Define the Schema for table 'Lot' with all variables and their types
const Lot = sequelize.define('Lot', {
    lot_id: { 
      type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true 
    },
    trade_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { model: 'trades', key: 'trade_id' } 
    },
    lot_quantity: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    realized_quantity: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0 
    },
    realized_trade_id: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    lot_status: { 
      type: DataTypes.ENUM('OPEN','PARTIALLY_REALIZED','FULLY_REALIZED'), 
      allowNull: false, 
      defaultValue: 'OPEN' 
    }
  }, { tableName: 'lots', timestamps: false }
);

module.exports = Lot;