-- Create SUBSCRIBERS table
CREATE TABLE IF NOT EXISTS `SUBSCRIBERS` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `EMAIL` VARCHAR(255) NOT NULL,
  `SUBSCRIBED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`EMAIL`),
  KEY `subscribed_at_idx` (`SUBSCRIBED_AT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: If you already have a SUBSCRIBERS table, you can modify this script accordingly

