USE farma_vital;

ALTER TABLE orders
  MODIFY status ENUM(
    'pending',
    'processing',
    'preparing',
    'on_the_way',
    'completed',
    'delivered',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(180) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS delivery_neighborhood VARCHAR(100) NULL AFTER delivery_address,
  ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100) NULL AFTER delivery_neighborhood,
  ADD COLUMN IF NOT EXISTS delivery_note TEXT NULL AFTER delivery_city;
