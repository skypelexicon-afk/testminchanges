import express from "express";
import {
  saveTestRecommendations,
  getTestRecommendations,
  getTestRecommendationIds,
} from "../controllers/testRecommendationController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Recommendation routes
router.post("/:testId/recommendations", saveTestRecommendations);
router.get("/:testId/recommendations", getTestRecommendations);
router.get("/:testId/recommendation-ids", getTestRecommendationIds);

export default router;
