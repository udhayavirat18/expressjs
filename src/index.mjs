import express from "express";
import router from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport"; // Correct import
import bcrypt from "bcrypt";
import "./strategies/local-strategy.mjs";

const app = express();
app.use(express.json());
app.use(cookieParser('cookie'));
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 86400000 }  // 24 Hours
}));
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;
export const mockusers = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    password: bcrypt.hashSync("password123", 10),
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    password: bcrypt.hashSync("securePass!456", 10),
  },
  {
    id: 3,
    name: "Alice Johnson",
    username: "alicejohnson",
    password: bcrypt.hashSync("mySecret789", 10),
  },
];

app.use(router);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Authentication and session management routes
app.post('/api/auth', passport.authenticate("local"), (req, res) => {
    const { username, password } = req.body;
    const user = mockusers.find(user => user.username === username);
    if (user) {
        // Compare the hashed password with the plain text password using bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }
            if (isMatch) {
                req.session.user = user;
                return res.status(200).json({ message: 'Authentication successful', userId: user.id });
            } else {
                return res.status(401).json({ message: 'Invalid password' });
            }
        });
    } else {
        return res.status(404).json({ message: 'User not found' });
    }
});

app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        return res.status(200).json({
            message: 'User is logged in',
            user: req.session.user // Send user data back
        });
    } else {
        return res.status(401).json({ message: 'No user is logged in' });
    }
});

// Cart routes
app.post("/api/cart", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'User is not logged in' });
    }
    const item = req.body;
    const cart = req.session.cart || [];
    cart.push(item);
    req.session.cart = cart;
    return res.status(200).json(cart);
});

app.get("/api/cart", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'User is not logged in' });
    }
    return res.status(200).json(req.session.cart || []);
});
