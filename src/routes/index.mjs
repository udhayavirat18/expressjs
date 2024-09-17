import { Router } from "express";
import userRoutes from './userRoutes.mjs';
import productRoutes from './productRoutes.mjs';

const router = new Router();
router.use(userRoutes);
router.use(productRoutes);
export default router;