import express from "express";
import {
  createDoubt,
  getSessionDoubts,
  getTestDoubts,
  getEducatorDoubts,
  respondToDoubt,
} from "../controllers/testDoubtController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Doubt routes
router.post("/session/:sessionId/doubts", createDoubt);
router.get("/session/:sessionId/doubts", getSessionDoubts);
router.get("/test/:testId/doubts", getTestDoubts);
router.get("/educator/doubts", getEducatorDoubts);
router.put("/doubts/:doubtId/respond", respondToDoubt);

export default router;
