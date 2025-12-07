import express from "express";
import {
  getTestAnalytics,
  getTestLeaderboard,
  getTestInsights,
} from "../controllers/testAnalyticsController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Analytics routes
router.get("/:testId/analytics", getTestAnalytics);
router.get("/:testId/leaderboard", getTestLeaderboard);
router.get("/:testId/insights", getTestInsights);

export default router;
