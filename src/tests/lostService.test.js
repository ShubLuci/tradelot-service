const { calculateFIFO, calculateLIFO } = require('../services/lotService');
const Trade = require('../models/trade');

jest.mock('../models/trade');

// Test Script to test the FIFO Service
describe('calculateFIFO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return open lots when there are no sells', async () => {
    const stock = 'ABC';
    const buys = [
      { trade_id: 1, quantity: 100, timestamp: new Date('2025-01-01') },
      { trade_id: 2, quantity: 50, timestamp: new Date('2025-01-02') },
    ];
    Trade.findAll
      .mockResolvedValueOnce(buys)          // buys
      .mockResolvedValueOnce([]);           // sells

    const result = await calculateFIFO(stock);
    expect(result).toEqual([
      { lot_id: 1, lot_quantity: 100, realized_quantity: 0, lot_status: 'OPEN', realized_trade_id: undefined },
      { lot_id: 2, lot_quantity: 50, realized_quantity: 0, lot_status: 'OPEN', realized_trade_id: undefined },
    ]);
    expect(Trade.findAll).toHaveBeenCalledTimes(2);
  });

  it('should apply sells in FIFO order', async () => {
    const stock = 'XYZ';
    const buys = [
      { trade_id: 1, quantity: 100, timestamp: new Date('2025-01-01') },
      { trade_id: 2, quantity: 100, timestamp: new Date('2025-01-02') },
    ];
    const sells = [
      { trade_id: 3, quantity: -150, timestamp: new Date('2025-01-03') },
    ];
    Trade.findAll
      .mockResolvedValueOnce(buys)
      .mockResolvedValueOnce(sells);

    const result = await calculateFIFO(stock);
    expect(result).toEqual([
      { lot_id: 1, lot_quantity: 100, realized_quantity: 100, lot_status: 'FULLY_REALIZED', realized_trade_id: 3 },
      { lot_id: 2, lot_quantity: 100, realized_quantity: 50, lot_status: 'PARTIALLY_REALIZED', realized_trade_id: 3 },
    ]);
  });
});


// Test Script to test the LIFO Service
describe('calculateLIFO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply sells in LIFO order', async () => {
    const stock = 'DEF';
    const buys = [
      { trade_id: 1, quantity: 100, timestamp: new Date('2025-02-01') },
      { trade_id: 2, quantity: 100, timestamp: new Date('2025-02-02') },
    ];
    const sells = [
      { trade_id: 3, quantity: -150, timestamp: new Date('2025-02-03') },
    ];
    Trade.findAll
      .mockResolvedValueOnce(buys)
      .mockResolvedValueOnce(sells);

    const result = await calculateLIFO(stock);
    expect(result).toEqual([
      { lot_id: 1, lot_quantity: 100, realized_quantity: 50, lot_status: 'PARTIALLY_REALIZED', realized_trade_id: 3 },
      { lot_id: 2, lot_quantity: 100, realized_quantity: 100, lot_status: 'FULLY_REALIZED', realized_trade_id: 3 },
    ]);
  });
});