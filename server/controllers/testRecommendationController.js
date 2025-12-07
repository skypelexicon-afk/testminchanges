import { db } from "../db/client.js";
import { tests, testCourseRecommendations, courses } from "../schema/schema.js";
import { eq, and, inArray } from "drizzle-orm";

// Add/Update course recommendations for a test
export const saveTestRecommendations = async (req, res) => {
  try {
    const { testId } = req.params;
    const { courseIds } = req.body; // Array of course IDs
    const userId = req.user.id;

    // Validate test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this test",
      });
    }

    if (!Array.isArray(courseIds)) {
      return res.status(400).json({
        success: false,
        message: "courseIds must be an array",
      });
    }

    // Delete existing recommendations
    await db
      .delete(testCourseRecommendations)
      .where(eq(testCourseRecommendations.test_id, parseInt(testId)));

    // Add new recommendations
    if (courseIds.length > 0) {
      const recommendations = courseIds.map(courseId => ({
        test_id: parseInt(testId),
        course_id: parseInt(courseId),
      }));

      await db.insert(testCourseRecommendations).values(recommendations);
    }

    res.status(200).json({
      success: true,
      message: "Recommendations saved successfully",
    });
  } catch (error) {
    console.error("Error saving recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save recommendations",
      error: error.message,
    });
  }
};

// Get course recommendations for a test
export const getTestRecommendations = async (req, res) => {
  try {
    const { testId } = req.params;

    const recommendations = await db
      .select({
        id: testCourseRecommendations.id,
        course_id: courses.id,
        title: courses.title,
        description: courses.description,
        image: courses.image,
        price: courses.price,
        originalPrice: courses.originalPrice,
        discountLabel: courses.discountLabel,
        educatorName: courses.educatorName,
        educatorImage: courses.educatorImage,
      })
      .from(testCourseRecommendations)
      .innerJoin(courses, eq(testCourseRecommendations.course_id, courses.id))
      .where(eq(testCourseRecommendations.test_id, parseInt(testId)));

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

// Get recommended course IDs for educator (for the dropdown)
export const getTestRecommendationIds = async (req, res) => {
  try {
    const { testId } = req.params;

    const recommendations = await db
      .select({ course_id: testCourseRecommendations.course_id })
      .from(testCourseRecommendations)
      .where(eq(testCourseRecommendations.test_id, parseInt(testId)));

    const courseIds = recommendations.map(r => r.course_id);

    res.status(200).json({
      success: true,
      data: courseIds,
    });
  } catch (error) {
    console.error("Error fetching recommendation IDs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendation IDs",
      error: error.message,
    });
  }
};
