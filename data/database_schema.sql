-- ============================================================================
-- Guardrailed Text-to-SQL Analytics Platform
-- Complete Database Schema
-- ============================================================================
-- This file contains the full SQL schema for all 6 tables, indexes,
-- and the PostgreSQL read-only role setup used in this project.
--
-- Database Engines Supported:
--   1. SQLite  (default, zero-config) -> data/sales_data.db
--   2. PostgreSQL 16 (enterprise)     -> text_to_sql_db
--
-- To set up the database automatically, run:
--   python -m backend.database.db_setup
-- ============================================================================


-- ============================================================================
-- TABLE 1: sales_order (65,524 rows)
-- Main transactional table containing all sales order line items.
-- Includes 1,420 synthetic records for 2026 to match the wireframe demo.
-- ============================================================================

CREATE TABLE IF NOT EXISTS sales_order (
    OrderNumber                 TEXT,       -- Order ID, e.g. "SO-2026-00001"
    OrderDate                   TEXT,       -- Date of order, e.g. "2026-03-15"
    "Customer Name Index"       INTEGER,    -- Foreign key -> customers."Customer Index"
    Channel                     TEXT,       -- Sales channel: "Wholesale", "Distributor", "Export"
    "Currency Code"             TEXT,       -- ISO currency code: "USD", "EUR", etc.
    "Warehouse Code"            TEXT,       -- Warehouse identifier
    "Delivery Region Index"     INTEGER,    -- Foreign key -> regions.id
    "Product Description Index" INTEGER,    -- Foreign key -> products."Index"
    "Order Quantity"            INTEGER,    -- Number of units ordered
    "Unit Price"                REAL,       -- Price per single unit
    "Line Total"                REAL,       -- Total revenue for this line (Quantity x Price)
    "Total Unit Cost"           REAL        -- Cost per unit (for profit calculation)
);


-- ============================================================================
-- TABLE 2: customers (175 rows)
-- Customer directory with PII fields (Email, Phone Number) added to
-- demonstrate the dynamic SHA-256 PII masking feature.
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    "Customer Index"    INTEGER,    -- Primary key / unique customer ID
    "Customer Names"    TEXT,       -- Company name, e.g. "Medline", "Pure Group"
    Email               TEXT,       -- Auto-generated fake email for PII masking demo
    "Phone Number"      TEXT        -- Auto-generated fake phone for PII masking demo
);


-- ============================================================================
-- TABLE 3: products (30 rows)
-- Master product catalog listing all available products.
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
    "Index"         INTEGER,    -- Product ID
    "Product Name"  TEXT        -- Product name, e.g. "Product 1", "Product 12"
);


-- ============================================================================
-- TABLE 4: budgets_2017 (30 rows)
-- Annual budget allocations per product for the year 2017.
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets_2017 (
    "Product Name"  TEXT,       -- Product name, e.g. "Product 1"
    "2017 Budgets"  REAL        -- Budget amount allocated, e.g. 12500.00
);


-- ============================================================================
-- TABLE 5: regions (994 rows)
-- Geographic and demographic data for US cities.
-- Used for regional sales analysis and delivery mapping.
-- ============================================================================

CREATE TABLE IF NOT EXISTS regions (
    id              INTEGER,    -- Primary key / region ID
    name            TEXT,       -- City name, e.g. "New York", "Los Angeles"
    county          TEXT,       -- County name
    state_code      TEXT,       -- 2-letter state code, e.g. "NY", "CA"
    state           TEXT,       -- Full state name, e.g. "New York", "California"
    type            TEXT,       -- Location type: "City", "Town", "Village"
    latitude        REAL,       -- GPS latitude coordinate
    longitude       REAL,       -- GPS longitude coordinate
    area_code       INTEGER,    -- Phone area code, e.g. 212, 310
    population      INTEGER,    -- City population count
    households      INTEGER,    -- Number of households
    median_income   INTEGER,    -- Median household income in USD
    land_area       INTEGER,    -- Land area in square miles
    water_area      INTEGER,    -- Water area in square miles
    time_zone       TEXT        -- IANA timezone, e.g. "America/New_York"
);


-- ============================================================================
-- TABLE 6: state_regions (48 rows)
-- Maps US states to their geographic region classification.
-- ============================================================================

CREATE TABLE IF NOT EXISTS state_regions (
    "State Code"    TEXT,       -- 2-letter state code, e.g. "CA", "NY"
    State           TEXT,       -- Full state name, e.g. "California"
    Region          TEXT        -- Geographic region: "West", "South", "Northeast", "Midwest"
);


-- ============================================================================
-- INDEXES (B-Tree) — Created for fast query performance on 65,000+ rows
-- ============================================================================

-- SQLite Indexes
CREATE INDEX IF NOT EXISTS idx_sales_date    ON sales_order (OrderDate);
CREATE INDEX IF NOT EXISTS idx_sales_channel ON sales_order (Channel);
CREATE INDEX IF NOT EXISTS idx_sales_cust    ON sales_order ("Customer Name Index");
CREATE INDEX IF NOT EXISTS idx_sales_prod    ON sales_order ("Product Description Index");
CREATE INDEX IF NOT EXISTS idx_cust_id       ON customers ("Customer Index");

-- PostgreSQL Indexes (same logic, explicit naming)
-- CREATE INDEX IF NOT EXISTS idx_pg_sales_date    ON sales_order ("OrderDate");
-- CREATE INDEX IF NOT EXISTS idx_pg_sales_channel ON sales_order ("Channel");
-- CREATE INDEX IF NOT EXISTS idx_pg_sales_cust    ON sales_order ("Customer Name Index");
-- CREATE INDEX IF NOT EXISTS idx_pg_sales_prod    ON sales_order ("Product Description Index");
-- CREATE INDEX IF NOT EXISTS idx_pg_cust_id       ON customers ("Customer Index");


-- ============================================================================
-- ENTITY RELATIONSHIPS (Foreign Keys)
-- ============================================================================
--
-- customers."Customer Index"   <-->  sales_order."Customer Name Index"
-- products."Index"             <-->  sales_order."Product Description Index"
-- regions.id                   <-->  sales_order."Delivery Region Index"
-- state_regions."State Code"   <-->  regions.state_code
-- budgets_2017."Product Name"  <-->  products."Product Name"
--


-- ============================================================================
-- POSTGRESQL: Read-Only Role Setup
-- Creates a restricted user that can ONLY run SELECT queries.
-- This is the 4th security guardrail (database-level protection).
-- ============================================================================

-- CREATE USER readonly_analyst WITH PASSWORD 'readonly_secure_pass_2026';
-- GRANT CONNECT ON DATABASE text_to_sql_db TO readonly_analyst;
-- GRANT USAGE ON SCHEMA public TO readonly_analyst;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_analyst;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_analyst;


-- ============================================================================
-- SAMPLE QUERIES (for testing and demo)
-- ============================================================================

-- 1. Monthly revenue trend for 2026 (SQLite)
-- SELECT
--     SUBSTR(OrderDate, 1, 7) AS Month,
--     COUNT(*) AS "Total Orders",
--     ROUND(SUM("Line Total"), 2) AS "Total Revenue"
-- FROM sales_order
-- WHERE OrderDate >= '2026-01-01' AND OrderDate <= '2026-12-31'
-- GROUP BY SUBSTR(OrderDate, 1, 7)
-- ORDER BY Month ASC;

-- 2. Sales breakdown by channel
-- SELECT
--     Channel,
--     COUNT(*) AS "Total Orders",
--     ROUND(SUM("Line Total"), 2) AS Revenue
-- FROM sales_order
-- GROUP BY Channel
-- ORDER BY Revenue DESC;

-- 3. Total customer count
-- SELECT COUNT(*) AS "Total Customers" FROM customers;

-- 4. Customer directory (PII columns will be masked by the application)
-- SELECT "Customer Index", "Customer Names", Email, "Phone Number"
-- FROM customers
-- LIMIT 50;

-- 5. Product budgets sorted by amount
-- SELECT "Product Name", "2017 Budgets" AS Budget
-- FROM budgets_2017
-- ORDER BY "2017 Budgets" DESC
-- LIMIT 15;

-- 6. Top 10 cities by population
-- SELECT name AS City, state, population, median_income
-- FROM regions
-- ORDER BY population DESC
-- LIMIT 10;

-- 7. List all tables (SQLite)
-- SELECT name AS "Table Name", type AS "Object Type"
-- FROM sqlite_master
-- WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
-- ORDER BY name ASC;

-- 8. Total row counts across all tables
-- SELECT 'sales_order' AS "Table", COUNT(*) AS "Rows" FROM sales_order
-- UNION ALL
-- SELECT 'customers', COUNT(*) FROM customers
-- UNION ALL
-- SELECT 'products', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'budgets_2017', COUNT(*) FROM budgets_2017
-- UNION ALL
-- SELECT 'regions', COUNT(*) FROM regions
-- UNION ALL
-- SELECT 'state_regions', COUNT(*) FROM state_regions;
