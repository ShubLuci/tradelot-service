const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequlizeObj');
const Lot = require('./lot');

// Define the Schema for table 'Trade' with all variables and their types
const Trade = sequelize.define('Trade', {
    trade_id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    stock_name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    quantity: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    broker_name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    price: { 
      type: DataTypes.DECIMAL(12,2), 
      allowNull: false 
    },
    amount: {
      type: DataTypes.VIRTUAL,
      get() { return (parseFloat(this.price) * this.quantity).toFixed(2); }
    },
    timestamp: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW 
    }
  }, { tableName: 'trades', timestamps: false }
);


// A single Trade can have multiple Lots and each lot belongs to One Trade
Trade.hasMany(Lot, { foreignKey: 'trade_id' });

// Each Lot belongs to exactly one Trade.
Lot.belongsTo(Trade, { foreignKey: 'trade_id' });


module.exports = Trade;