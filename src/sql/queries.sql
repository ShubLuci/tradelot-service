-- SQL Query to create trades table
CREATE TABLE trades (
    trade_id SERIAL PRIMARY KEY,
    stock_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    broker_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    amount NUMERIC(10,2) GENERATED ALWAYS AS (price * quantity) STORED,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enum's for lot_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lot_status') THEN
        CREATE TYPE lot_status AS ENUM ('OPEN', 'PARTIALLY_REALIZED', 'FULLY_REALIZED');
    END IF;
END$$;	


-- SQL Query to create lots table
CREATE TABLE lots (
    lot_id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    lot_quantity INTEGER NOT NULL,
    realized_quantity INTEGER NOT NULL DEFAULT 0,
    realized_trade_id INTEGER,
    lot_status lot_status NOT NULL DEFAULT 'OPEN',
    FOREIGN KEY(trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
    FOREIGN KEY(realized_trade_id) REFERENCES trades(trade_id) ON DELETE SET NULL
);