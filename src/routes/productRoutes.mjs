import express from 'express';

const router = express.Router();

router.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'Smartphone', price: 699.99, description: 'A high-end smartphone with a stunning display and fast processor.', category: 'Electronics', stock: 10 },
    { id: 2, name: 'Laptop', price: 1099.99, description: 'A powerful laptop for work and gaming.', category: 'Computers', stock: 5 },
    { id: 3, name: 'Headphones', price: 199.99, description: 'Noise-cancelling headphones with immersive sound quality.', category: 'Accessories', stock: 25 },
    { id: 4, name: 'Smartwatch', price: 299.99, description: 'A smartwatch with health tracking and notifications.', category: 'Wearables', stock: 15 }
  ];

  res.json(products);
});

export default router;
