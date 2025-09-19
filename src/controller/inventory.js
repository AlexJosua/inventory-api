import koneksi from "../koneksi/db.js";
import stockEmitter from "../events/stockEmitter.js";
import logger from "../utils/logger.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

// ======================= PRODUK =======================

// Tambah produk baru
export async function addProduct(name, price, stock, category) {
  if (price < 0 || stock < 0) {
    throw new ValidationError("Harga atau stok tidak boleh negatif");
  }
  const [result] = await koneksi.query(
    "INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)",
    [name, price, stock, category]
  );
  return result.insertId;
}

// Ambil semua produk (pagination + filter kategori)
export async function getProducts({ category, page = 1, limit = 10 }) {
  let sql = "SELECT * FROM products";
  const values = [];

  if (category) {
    sql += " WHERE category = ?";
    values.push(category);
  }

  const offset = (page - 1) * limit;
  sql += " LIMIT ? OFFSET ?";
  values.push(Number(limit), Number(offset));

  const [rows] = await koneksi.query(sql, values);
  return rows;
}

// Update data produk
export async function updateProduct(id, { name, price, stock, category }) {
  if (price !== undefined && price < 0) {
    throw new ValidationError("Harga tidak boleh negatif");
  }
  if (stock !== undefined && stock < 0) {
    throw new ValidationError("Stok tidak boleh negatif");
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (price !== undefined) {
    fields.push("price = ?");
    values.push(price);
  }
  if (stock !== undefined) {
    fields.push("stock = ?");
    values.push(stock);
  }
  if (category !== undefined) {
    fields.push("category = ?");
    values.push(category);
  }

  if (fields.length === 0) {
    throw new ValidationError("Tidak ada data untuk diupdate");
  }

  values.push(id);

  const [result] = await koneksi.query(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new NotFoundError("Produk tidak ditemukan");
  }

  return result.affectedRows;
}

// ======================= TRANSAKSI =======================
export async function createTransaction(
  productId,
  quantity,
  type,
  customerId = null
) {
  if (quantity <= 0)
    throw new ValidationError("Jumlah harus lebih besar dari 0");
  if (!["purchase", "sale"].includes(type)) {
    throw new ValidationError("Tipe transaksi tidak valid");
  }

  // cek produk
  const [[product]] = await koneksi.query(
    "SELECT * FROM products WHERE id = ?",
    [productId]
  );
  if (!product) throw new NotFoundError("Produk tidak ditemukan");

  let newStock = product.stock;
  let discount = 0;

  if (type === "purchase") {
    newStock += quantity;
  } else if (type === "sale") {
    if (product.stock < quantity)
      throw new ValidationError("Stok tidak mencukupi");
    newStock -= quantity;

    // cek kategori pelanggan (diskon)
    if (customerId) {
      const [[customer]] = await koneksi.query(
        "SELECT * FROM customers WHERE id = ?",
        [customerId]
      );
      if (customer && customer.category === "premium" && quantity >= 10) {
        discount = 10; // 10% diskon
      }
    }
  }

  // update stok produk
  await koneksi.query("UPDATE products SET stock = ? WHERE id = ?", [
    newStock,
    productId,
  ]);

  // Emit event kalau stok rendah
  if (newStock < 5) {
    stockEmitter.emit("lowStock", {
      id: productId,
      name: product.name,
      stock: newStock,
    });
  }

  // simpan transaksi
  const [result] = await koneksi.query(
    "INSERT INTO transactions (type, product_id, customer_id, quantity, discount_applied) VALUES (?, ?, ?, ?, ?)",
    [type, productId, customerId, quantity, discount]
  );

  // Logging transaksi
  logger.info(
    `TRANSACTION: ${type.toUpperCase()} | Product: ${
      product.name
    } | Qty: ${quantity} | Stock: ${newStock} | Discount: ${discount}% | CustomerID: ${
      customerId ?? "N/A"
    }`
  );

  return result.insertId;
}

// Ambil riwayat transaksi produk tertentu
export async function getProductHistory(productId) {
  const [rows] = await koneksi.query(
    "SELECT * FROM transactions WHERE product_id = ? ORDER BY created_at DESC",
    [productId]
  );
  return rows;
}

// ======================= REPORT =======================

// Hitung total nilai inventory
export async function getInventoryValue() {
  const [[row]] = await koneksi.query(
    "SELECT SUM(price * stock) as totalValue FROM products"
  );
  return row.totalValue || 0;
}

// Ambil produk dengan stok rendah (misal < 5)
export async function getLowStockProducts(threshold = 5) {
  const [rows] = await koneksi.query("SELECT * FROM products WHERE stock < ?", [
    threshold,
  ]);
  return rows;
}
