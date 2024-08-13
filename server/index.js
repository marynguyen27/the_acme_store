const express = require('express');

const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require('./db');

const app = express();
app.use(express.json());

app.get('/api/users', async (req, res) => {
  const users = await fetchUsers();
  res.json(users);
});

app.get('/api/products', async (req, res) => {
  const products = await fetchProducts();
  res.json(products);
});

app.get('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  const favorites = await fetchFavorites(id);
  res.json(favorites);
});

app.post('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  const { product_id } = req.body;
  const favorite = await createFavorite(id, product_id);
  res.status(201).json(favorite);
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  const { userId, id } = req.params;
  await destroyFavorite(userId, id);
  res.status(204).end();
});

const init = async () => {
  try {
    await createTables();
    console.log('Tables created successfully');

    await createUser('Abigail Adams', 'password1');
    await createUser('Benjamin Button', 'password2');
    await createUser('Chatty Cathy', 'password3');

    await createProduct('Apple');
    await createProduct('Banana');
    await createProduct('Chicken');

    app.listen(3000, () => {
      console.log('Server is listening on port 3000');
    });
  } catch (error) {
    console.error('Failed to initialize the server:', error);
  }
};

init();
