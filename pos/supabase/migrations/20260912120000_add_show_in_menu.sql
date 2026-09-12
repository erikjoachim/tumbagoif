/*
# Add show_in_menu flag to products

Lets inventory control whether a product appears on the public price
list (/pris-lista). Defaults to true so existing products stay visible.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS show_in_menu boolean NOT NULL DEFAULT true;