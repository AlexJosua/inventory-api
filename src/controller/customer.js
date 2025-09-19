import koneksi from "../koneksi/db.js";

// Tambah customer baru
export async function addCustomer(name, category = "regular") {
  if (!["regular", "premium"].includes(category)) {
    throw new Error("Kategori customer tidak valid (regular/premium)");
  }

  const [result] = await koneksi.query(
    "INSERT INTO customers (name, category) VALUES (?, ?)",
    [name, category]
  );
  return result.insertId;
}

// Ambil semua customer
export async function getCustomers() {
  const [rows] = await koneksi.query("SELECT * FROM customers");
  return rows;
}

// Update customer
export async function updateCustomer(id, { name, category }) {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (category !== undefined) {
    if (!["regular", "premium"].includes(category)) {
      throw new Error("Kategori customer tidak valid (regular/premium)");
    }
    fields.push("category = ?");
    values.push(category);
  }

  if (fields.length === 0) {
    throw new Error("Tidak ada data untuk diupdate");
  }

  values.push(id);

  const [result] = await koneksi.query(
    `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return result.affectedRows;
}

// Hapus customer
export async function deleteCustomer(id) {
  const [result] = await koneksi.query("DELETE FROM customers WHERE id = ?", [
    id,
  ]);
  return result.affectedRows;
}
