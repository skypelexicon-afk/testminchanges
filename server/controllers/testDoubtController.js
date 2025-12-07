import { db } from "../db/client.js";
import { testDoubts, examSessions, tests, users } from "../schema/schema.js";
import { eq, and, desc } from "drizzle-orm";

// Create a doubt (student)
export const createDoubt = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionNumber, doubtText, screenshotUrl } = req.body;
    const studentId = req.user.id;

    // Validate session exists and belongs to student
    const [session] = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(sessionId)));

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Validate required fields
    if (!doubtText) {
      return res.status(400).json({
        success: false,
        message: "Doubt text is required",
      });
    }

    // Create doubt
    const [newDoubt] = await db
      .insert(testDoubts)
      .values({
        session_id: parseInt(sessionId),
        student_id: studentId,
        question_number: questionNumber ? parseInt(questionNumber) : null,
        doubt_text: doubtText,
        screenshot_url: screenshotUrl || null,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Doubt submitted successfully",
      data: newDoubt,
    });
  } catch (error) {
    console.error("Error creating doubt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create doubt",
      error: error.message,
    });
  }
};

// Get all doubts for a session (student)
export const getSessionDoubts = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;

    // Validate session belongs to student
    const [session] = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(sessionId)));

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Get all doubts for this session
    const doubts = await db
      .select()
      .from(testDoubts)
      .where(eq(testDoubts.session_id, parseInt(sessionId)))
      .orderBy(desc(testDoubts.created_at));

    res.status(200).json({
      success: true,
      data: doubts,
    });
  } catch (error) {
    console.error("Error fetching session doubts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doubts",
      error: error.message,
    });
  }
};

// Get all doubts for a test (public - all students can see)
export const getTestDoubts = async (req, res) => {
  try {
    const { testId } = req.params;

    const doubts = await db
      .select({
        id: testDoubts.id,
        question_number: testDoubts.question_number,
        doubt_text: testDoubts.doubt_text,
        screenshot_url: testDoubts.screenshot_url,
        status: testDoubts.status,
        response_text: testDoubts.response_text,
        responded_at: testDoubts.responded_at,
        created_at: testDoubts.created_at,
        student_name: users.name,
      })
      .from(testDoubts)
      .innerJoin(examSessions, eq(testDoubts.session_id, examSessions.id))
      .innerJoin(users, eq(testDoubts.student_id, users.id))
      .where(eq(examSessions.test_id, parseInt(testId)))
      .orderBy(desc(testDoubts.created_at));

    res.status(200).json({
      success: true,
      data: doubts,
    });
  } catch (error) {
    console.error("Error fetching test doubts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doubts",
      error: error.message,
    });
  }
};

// Get all doubts for educator's tests
export const getEducatorDoubts = async (req, res) => {
  try {
    const educatorId = req.user.id;

    // Get all doubts for tests created by this educator
    const doubts = await db
      .select({
        id: testDoubts.id,
        session_id: testDoubts.session_id,
        test_id: tests.id,
        test_name: tests.name,
        test_subject: tests.subject,
        question_number: testDoubts.question_number,
        doubt_text: testDoubts.doubt_text,
        screenshot_url: testDoubts.screenshot_url,
        status: testDoubts.status,
        response_text: testDoubts.response_text,
        responded_at: testDoubts.responded_at,
        created_at: testDoubts.created_at,
        student_name: users.name,
        student_email: users.email,
      })
      .from(testDoubts)
      .innerJoin(examSessions, eq(testDoubts.session_id, examSessions.id))
      .innerJoin(tests, eq(examSessions.test_id, tests.id))
      .innerJoin(users, eq(testDoubts.student_id, users.id))
      .where(eq(tests.created_by, educatorId))
      .orderBy(desc(testDoubts.created_at));

    res.status(200).json({
      success: true,
      data: doubts,
    });
  } catch (error) {
    console.error("Error fetching educator doubts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doubts",
      error: error.message,
    });
  }
};

// Respond to a doubt (educator)
export const respondToDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { responseText } = req.body;
    const educatorId = req.user.id;

    if (!responseText) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    // Get doubt with test info to verify educator owns the test
    const [doubt] = await db
      .select({
        doubt_id: testDoubts.id,
        session_id: testDoubts.session_id,
        test_id: tests.id,
        created_by: tests.created_by,
      })
      .from(testDoubts)
      .innerJoin(examSessions, eq(testDoubts.session_id, examSessions.id))
      .innerJoin(tests, eq(examSessions.test_id, tests.id))
      .where(eq(testDoubts.id, parseInt(doubtId)));

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: "Doubt not found",
      });
    }

    if (doubt.created_by !== educatorId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to respond to this doubt",
      });
    }

    // Update doubt with response
    const [updatedDoubt] = await db
      .update(testDoubts)
      .set({
        response_text: responseText,
        status: "responded",
        responded_by: educatorId,
        responded_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(testDoubts.id, parseInt(doubtId)))
      .returning();

    res.status(200).json({
      success: true,
      message: "Response submitted successfully",
      data: updatedDoubt,
    });
  } catch (error) {
    console.error("Error responding to doubt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to doubt",
      error: error.message,
    });
  }
};
