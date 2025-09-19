import {
  addProduct,
  getProducts,
  updateProduct,
  createTransaction,
  getInventoryValue,
  getLowStockProducts,
  getProductHistory,
} from "../controller/inventory.js";

function sendResponse(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Router utama
export async function router(req, res, parsedUrl, body) {
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // ================= PRODUCTS =================
    if (path === "/products" && method === "POST") {
      const { name, price, stock, category } = body;
      const id = await addProduct(name, price, stock, category);
      return sendResponse(res, 201, { message: "Produk ditambahkan", id });
    }

    if (path === "/products" && method === "GET") {
      const { category, page, limit } = parsedUrl.query;
      const products = await getProducts({
        category,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
      return sendResponse(res, 200, products);
    }

    if (path.startsWith("/products/") && method === "PUT") {
      const id = path.split("/")[2];
      const updated = await updateProduct(id, body);
      if (updated === 0)
        return sendResponse(res, 404, { error: "Produk tidak ditemukan" });
      return sendResponse(res, 200, { message: "Produk diupdate" });
    }

    // ================= TRANSACTIONS =================
    if (path === "/transactions" && method === "POST") {
      const { productId, quantity, type, customerId } = body;
      const transactionId = await createTransaction(
        productId,
        quantity,
        type,
        customerId
      );
      return sendResponse(res, 201, {
        message: "Transaksi dicatat",
        transactionId,
      });
    }

    if (
      path.startsWith("/products/") &&
      path.endsWith("/history") &&
      method === "GET"
    ) {
      const productId = path.split("/")[2];
      const history = await getProductHistory(productId);
      return sendResponse(res, 200, history);
    }

    // ================= REPORTS =================
    if (path === "/reports/inventory" && method === "GET") {
      const total = await getInventoryValue();
      return sendResponse(res, 200, { totalInventoryValue: total });
    }

    if (path === "/reports/low-stock" && method === "GET") {
      const { threshold } = parsedUrl.query;
      const products = await getLowStockProducts(Number(threshold) || 5);
      return sendResponse(res, 200, products);
    }

    // ================= DEFAULT =================
    sendResponse(res, 404, { error: "Endpoint tidak ditemukan" });
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, { error: err.message || "Internal Server Error" });
  }
}
