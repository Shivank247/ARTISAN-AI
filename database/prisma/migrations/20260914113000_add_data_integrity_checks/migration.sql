ALTER TABLE "Product"
  ADD CONSTRAINT "Product_price_positive"
  CHECK ("price" > 0),
  ADD CONSTRAINT "Product_productionTimeDays_positive"
  CHECK ("productionTimeDays" IS NULL OR "productionTimeDays" > 0);

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_totalAmount_nonnegative"
  CHECK ("totalAmount" >= 0);

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_quantity_positive"
  CHECK ("quantity" > 0),
  ADD CONSTRAINT "OrderItem_unitPrice_positive"
  CHECK ("unitPrice" > 0);

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_rating_valid"
  CHECK ("rating" BETWEEN 1 AND 5);
