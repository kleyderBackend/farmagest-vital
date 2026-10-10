ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(180),
    ADD COLUMN IF NOT EXISTS delivery_neighborhood VARCHAR(100),
    ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS delivery_note TEXT;

ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS chk_orders_status;

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_status
    CHECK (
        status IN (
            'pending',
            'processing',
            'preparing',
            'on_the_way',
            'completed',
            'delivered',
            'cancelled'
        )
    );
