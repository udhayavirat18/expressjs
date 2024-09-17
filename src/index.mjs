import express from "express";
import router from "./routes/index.mjs";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
export const mockusers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' }
]
app.use(router);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});