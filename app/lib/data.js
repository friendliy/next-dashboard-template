import { sql } from "@vercel/postgres";
import { formatCurrency } from "./utils";

// Fungsi untuk mengambil data pendapatan
export async function fetchRevenue() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql`SELECT * FROM revenue`;

    console.log("Data fetch completed after 3 seconds.");

    return data.rows;
  } catch (error) {
    console.error("Database Error fetching revenue:", error.message);
    throw new Error("Failed to fetch revenue data.");
  }
}

// Fungsi untuk mengambil data invoice terbaru
// Fungsi untuk mengambil data invoice terbaru
export async function fetchLatestInvoices() {
  try {
    const data = await sql`
      SELECT invoices.id, invoices.amount, customers.name, customers.image_url, customers.email
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5
    `;

    // Cek apakah data yang diambil bervariasi
    console.log("Fetched latest invoices:", data.rows);

    const latestInvoices = data.rows.map((invoice) => ({
      id: invoice.id,
      name: invoice.name,
      email: invoice.email,
      image_url: invoice.image_url,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Database Error fetching latest invoices:", error.message);
    throw new Error("Failed to fetch the latest invoices.");
  }
}


// Fungsi untuk mengambil data kartu (statistics)
export async function fetchCardData() {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
      FROM invoices
    `;

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(invoiceCount.rows[0].count ?? "0");
    const numberOfCustomers = Number(customerCount.rows[0].count ?? "0");
    const totalPaidInvoices = formatCurrency(invoiceStatus.rows[0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(invoiceStatus.rows[0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error fetching card data:", error.message);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;

// Fungsi untuk mengambil data invoice yang difilter
export async function fetchFilteredInvoices(query, currentPage) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${'%' + query + '%'} OR
        customers.email ILIKE ${'%' + query + '%'} OR
        invoices.amount::text ILIKE ${'%' + query + '%'} OR
        invoices.date::text ILIKE ${'%' + query + '%'} OR
        invoices.status ILIKE ${'%' + query + '%'}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error fetching filtered invoices:", error.message);
    throw new Error("Failed to fetch invoices.");
  }
}

// Fungsi untuk mengambil total halaman invoice yang difilter
export async function fetchInvoicesPages(query) {
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${'%' + query + '%'} OR
        customers.email ILIKE ${'%' + query + '%'} OR
        invoices.amount::text ILIKE ${'%' + query + '%'} OR
        invoices.date::text ILIKE ${'%' + query + '%'} OR
        invoices.status ILIKE ${'%' + query + '%'}
    `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error fetching total number of invoices:", error.message);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

// Fungsi untuk mengambil data invoice berdasarkan ID
export async function fetchInvoiceById(id) {
  try {
    const data = await sql`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100, // Convert amount from cents to dollars
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error fetching invoice by ID:", error.message);
    throw new Error("Failed to fetch invoice.");
  }
}

// Fungsi untuk mengambil data semua pelanggan
export async function fetchCustomers() {
  try {
    const data = await sql`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return data.rows;
  } catch (error) {
    console.error("Database Error fetching all customers:", error.message);
    throw new Error("Failed to fetch all customers.");
  }
}

// Fungsi untuk mengambil data pelanggan yang difilter
export async function fetchFilteredCustomers(query) {
  try {
    const data = await sql`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${'%' + query + '%'} OR
        customers.email ILIKE ${'%' + query + '%'}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (error) {
    console.error("Database Error fetching filtered customers:", error.message);
    throw new Error("Failed to fetch customer table.");
  }
}