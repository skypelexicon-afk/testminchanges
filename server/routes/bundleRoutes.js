import express from "express";

import {
    createBundle,
    getAllBundles,
    getBundleById,
    updateBundle
} from "../controllers/bundleController.js"

import auth from "../middlewares/auth.js";
import { isEducatorOrAdmin } from "../middlewares/checkAdminEdu.js";

const bundleRouter = express.Router();

// Bundle routes
bundleRouter.get("/", getAllBundles);
bundleRouter.post("/", auth, isEducatorOrAdmin, createBundle);
// bundleRouter.get("/", getAllBundleCards);
bundleRouter.get("/:id", getBundleById);
bundleRouter.put("/:id", auth, isEducatorOrAdmin, updateBundle);

export default bundleRouter;