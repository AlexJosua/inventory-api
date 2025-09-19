import { EventEmitter } from "events";
import logger from "../utils/logger.js";

class StockEmitter extends EventEmitter {}
const stockEmitter = new StockEmitter();

// Listener default → logging
stockEmitter.on("lowStock", (product) => {
  logger.warn(
    `⚠️ LOW STOCK: Produk "${product.name}" tinggal ${product.stock} unit`
  );
});

export default stockEmitter;
