import {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controller/customer.js";

// helper response
function sendResponse(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Router khusus customers
export async function customerRouter(req, res, parsedUrl, body) {
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // ================= CUSTOMERS =================

    // GET /customers
    if (path === "/customers" && method === "GET") {
      const customers = await getCustomers();
      return sendResponse(res, 200, customers);
    }

    // POST /customers
    if (path === "/customers" && method === "POST") {
      const { name, category } = body;
      const id = await addCustomer(name, category);
      return sendResponse(res, 201, { message: "Customer ditambahkan", id });
    }

    // PUT /customers/:id
    if (path.startsWith("/customers/") && method === "PUT") {
      const id = path.split("/")[2];
      const updated = await updateCustomer(id, body);
      if (updated === 0) {
        return sendResponse(res, 404, { error: "Customer tidak ditemukan" });
      }
      return sendResponse(res, 200, { message: "Customer diupdate" });
    }

    // DELETE /customers/:id
    if (path.startsWith("/customers/") && method === "DELETE") {
      const id = path.split("/")[2];
      const deleted = await deleteCustomer(id);
      if (deleted === 0) {
        return sendResponse(res, 404, { error: "Customer tidak ditemukan" });
      }
      return sendResponse(res, 200, { message: "Customer dihapus" });
    }

    // ================= DEFAULT =================
    return sendResponse(res, 404, { error: "Endpoint tidak ditemukan" });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, { error: err.message });
  }
}
