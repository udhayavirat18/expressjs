import express from 'express';
import { query, validationResult, body } from 'express-validator';
import { mockusers } from '../index.mjs'; // Import mockusers from your main app file

const router = express.Router();

const resolveUserId = (req, res, next) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const user = mockusers.find(user => user.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  req.user = user;
  req.userIndex = mockusers.indexOf(user);
  next();
};

router.get('/', (req, res) => {
  console.log(req.session);
  console.log(req.session.id);
  req.session.visited = true;
  res.cookie('Hello', 'world', { maxAge: 6000 * 60, sameSite: 'Lax', signed: true });
  res.status(201).send('Hello, World!');
});

router.get("/api/users", query("filter").optional().isString().notEmpty(), (req, res) => {
  console.log(req.session);
  console.log(req.session.id);
  req.sessionStore.get(req.session.id,(err,sessionData) => {
    if (err) {
      console.log(err)
      throw err;
    }
    console.log(sessionData);
  })
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { filter, value } = req.query;
  if (filter && value) {
    const filteredUsers = mockusers.filter((u) => {
      return u[filter] && u[filter].toLowerCase().includes(value.toLowerCase());
    });
    return res.status(200).json({
      users: filteredUsers,
    });
  }

  return res.status(200).json({
    users: mockusers,
  });
});

router.post(
  "/api/users",
  [
    body("*.name")
      .notEmpty()
      .withMessage("UserName must not be empty")
      .isLength({ min: 3 })
      .withMessage("UserName must be at least 3 characters long")
      .isLength({ max: 50 })
      .withMessage("UserName must be at most 50 characters long"),
    body("*.id")
      .notEmpty()
      .withMessage("ID must not be empty")
      .isInt({ gt: 0 })
      .withMessage("ID must be a positive integer")
      .custom((value, { req }) => {
        const idsInRequest = req.body.map((user) => user.id);
        if (idsInRequest.filter((id) => id === value).length > 1) {
          throw new Error("ID must be unique within the request");
        }
        return true;
      })
      .custom((value) => {
        const userExists = mockusers.some((user) => user.id === value);
        if (userExists) {
          throw new Error("ID already exists in the database");
        }
        return true;
      }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const usersFromRequest = req.body;

    const newUsers = usersFromRequest.map((user) => {
      const newId = mockusers.length > 0 ? mockusers[mockusers.length - 1].id + 1 : 1;
      mockusers.push({ id: newId, ...user });
      return { id: newId, ...user };
    });

    res.status(201).json(mockusers);
  }
);

router.get('/api/users/:id', resolveUserId, (req, res) => {
  res.status(200).send({ user: req.user });
});

router.put('/api/users/:id', resolveUserId, (req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Invalid or missing user name' });
  }

  mockusers[req.userIndex] = { id: req.user.id, name };

  res.status(200).json(mockusers[req.userIndex]);
});

router.patch('/api/users/:id', resolveUserId, (req, res) => {
  const updates = req.body;

  if (updates.name && (typeof updates.name !== 'string' || updates.name.trim() === '')) {
    return res.status(400).json({ error: 'Invalid user name' });
  }

  const updatedUser = { ...req.user, ...updates };

  mockusers[req.userIndex] = updatedUser;

  res.status(200).json(updatedUser);
});

router.delete('/api/users/:id', resolveUserId, (req, res) => {
  mockusers.splice(req.userIndex, 1);

  res.status(204).send();
});

export default router;
