const pg = require('pg');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const client = new pg.Client(
  process.env.DATABASE_URL ||
    'postgres://postgres:12345678@localhost:5432/the_acme_store'
);

client.connect();

const createTables = async () => {
  await client.query(`
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;
    
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);
};

const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await client.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
    [username, hashedPassword]
  );
  return result.rows[0];
};

const createProduct = async (name) => {
  const result = await client.query(
    'INSERT INTO products (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

const fetchUsers = async () => {
  const result = await client.query('SELECT * FROM users');
  return result.rows;
};

const fetchProducts = async () => {
  const result = await client.query('SELECT * FROM products');
  return result.rows;
};

const createFavorite = async (userId, productId) => {
  const result = await client.query(
    'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *',
    [userId, productId]
  );
  return result.rows[0];
};

const fetchFavorites = async (userId) => {
  const result = await client.query(
    'SELECT * FROM favorites WHERE user_id = $1',
    [userId]
  );
  return result.rows;
};

const destroyFavorite = async (userId, favoriteId) => {
  await client.query('DELETE FROM favorites WHERE id = $1 AND user_id = $2', [
    favoriteId,
    userId,
  ]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
