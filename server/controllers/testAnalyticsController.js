import { db } from "../db/client.js";
import { tests, examSessions, users, questions } from "../schema/schema.js";
import { eq, and, desc, sql, count, avg, max, min } from "drizzle-orm";

// Get test analytics for educator
export const getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;
    const educatorId = req.user.id;

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

    if (test.created_by !== educatorId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view analytics for this test",
      });
    }

    // Get all completed attempts
    const completedAttempts = await db
      .select({
        id: examSessions.id,
        student_id: examSessions.student_id,
        score: examSessions.score,
        start_time: examSessions.start_time,
        end_time: examSessions.end_time,
        is_first_attempt: examSessions.is_first_attempt,
      })
      .from(examSessions)
      .where(
        and(
          eq(examSessions.test_id, parseInt(testId)),
          eq(examSessions.status, "completed")
        )
      );

    if (completedAttempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAttempts: 0,
          uniqueStudents: 0,
          passedStudents: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          completionRate: 0,
          passPercentage: 0,
          attemptsOverTime: [],
          scoreDistribution: [],
        },
      });
    }

    // Calculate statistics
    const totalAttempts = completedAttempts.length;
    const uniqueStudents = new Set(completedAttempts.map(a => a.student_id)).size;
    
    const scores = completedAttempts.map(a => a.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    // Pass criteria: 40% of total marks
    const passingScore = test.total_marks * 0.4;
    const passedStudents = scores.filter(score => score >= passingScore).length;
    const passPercentage = (passedStudents / totalAttempts) * 100;

    // Calculate completion rate
    const allSessions = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.test_id, parseInt(testId)));
    
    const completionRate = (completedAttempts.length / allSessions.length) * 100;

    // Attempts over time (grouped by date)
    const attemptsOverTime = {};
    completedAttempts.forEach(attempt => {
      const date = new Date(attempt.start_time).toISOString().split('T')[0];
      attemptsOverTime[date] = (attemptsOverTime[date] || 0) + 1;
    });

    const attemptsOverTimeArray = Object.entries(attemptsOverTime)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Score distribution (grouped into ranges)
    const scoreRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0,
    };

    scores.forEach(score => {
      const percentage = (score / test.total_marks) * 100;
      if (percentage <= 20) scoreRanges['0-20%']++;
      else if (percentage <= 40) scoreRanges['21-40%']++;
      else if (percentage <= 60) scoreRanges['41-60%']++;
      else if (percentage <= 80) scoreRanges['61-80%']++;
      else scoreRanges['81-100%']++;
    });

    const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        uniqueStudents,
        passedStudents,
        averageScore: parseFloat(averageScore.toFixed(2)),
        highestScore,
        lowestScore,
        completionRate: parseFloat(completionRate.toFixed(2)),
        passPercentage: parseFloat(passPercentage.toFixed(2)),
        attemptsOverTime: attemptsOverTimeArray,
        scoreDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching test analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test analytics",
      error: error.message,
    });
  }
};

// Get test leaderboard
export const getTestLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;
    const { sortBy = 'score' } = req.query; // score, time, date

    // Get all completed first attempts only
    const leaderboardData = await db
      .select({
        session_id: examSessions.id,
        student_id: users.id,
        student_name: users.name,
        student_email: users.email,
        score: examSessions.score,
        start_time: examSessions.start_time,
        end_time: examSessions.end_time,
      })
      .from(examSessions)
      .innerJoin(users, eq(examSessions.student_id, users.id))
      .where(
        and(
          eq(examSessions.test_id, parseInt(testId)),
          eq(examSessions.status, "completed"),
          eq(examSessions.is_first_attempt, true)
        )
      );

    // Calculate time taken and add rank
    const leaderboardWithTime = leaderboardData.map(entry => {
      const timeTakenMs = new Date(entry.end_time) - new Date(entry.start_time);
      const timeTakenMinutes = Math.floor(timeTakenMs / (1000 * 60));
      return {
        ...entry,
        time_taken_minutes: timeTakenMinutes,
      };
    });

    // Sort based on query parameter
    let sortedLeaderboard = [...leaderboardWithTime];
    if (sortBy === 'time') {
      sortedLeaderboard.sort((a, b) => a.time_taken_minutes - b.time_taken_minutes);
    } else if (sortBy === 'date') {
      sortedLeaderboard.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    } else {
      // Default: sort by score (descending), then by time (ascending)
      sortedLeaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_taken_minutes - b.time_taken_minutes;
      });
    }

    // Add rank
    const leaderboard = sortedLeaderboard.map((entry, index) => ({
      rank: index + 1,
      session_id: entry.session_id,
      student_name: entry.student_name,
      score: entry.score,
      time_taken_minutes: entry.time_taken_minutes,
      date: new Date(entry.start_time).toISOString().split('T')[0],
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message,
    });
  }
};

// Get test insights (most missed questions, topic-wise performance)
export const getTestInsights = async (req, res) => {
  try {
    const { testId } = req.params;
    const educatorId = req.user.id;

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

    if (test.created_by !== educatorId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view insights for this test",
      });
    }

    // Get all questions
    const testQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.test_id, parseInt(testId)));

    // Get all completed attempts
    const completedAttempts = await db
      .select({
        answers: examSessions.answers,
      })
      .from(examSessions)
      .where(
        and(
          eq(examSessions.test_id, parseInt(testId)),
          eq(examSessions.status, "completed")
        )
      );

    if (completedAttempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          mostMissedQuestions: [],
          difficultyDistribution: {},
        },
      });
    }

    // Analyze each question
    const questionAnalysis = testQuestions.map(question => {
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;

      completedAttempts.forEach(attempt => {
        const answers = attempt.answers || {};
        const studentAnswer = answers[question.id.toString()];

        if (!studentAnswer || studentAnswer === "" || studentAnswer === null) {
          unattemptedCount++;
        } else {
          let isCorrect = false;
          
          if (question.question_type === "mcq" || question.question_type === "true_false") {
            isCorrect = studentAnswer === question.correct_answers[0];
          } else if (question.question_type === "multiple_correct") {
            const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
            const correctAnswerArray = Array.isArray(question.correct_answers) ? question.correct_answers : [question.correct_answers];
            isCorrect = 
              studentAnswerArray.length === correctAnswerArray.length &&
              studentAnswerArray.every(ans => correctAnswerArray.includes(ans));
          } else if (question.question_type === "numerical") {
            const correctValue = parseFloat(question.correct_answers[0]);
            const studentValue = parseFloat(studentAnswer);
            isCorrect = Math.abs(correctValue - studentValue) < 0.01;
          }

          if (isCorrect) correctCount++;
          else incorrectCount++;
        }
      });

      const totalAttempts = completedAttempts.length;
      const successRate = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

      return {
        question_id: question.id,
        question_text: question.question_text.substring(0, 100) + (question.question_text.length > 100 ? '...' : ''),
        question_type: question.question_type,
        marks: question.marks,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unattempted_count: unattemptedCount,
        success_rate: parseFloat(successRate.toFixed(2)),
      };
    });

    // Get most missed questions (lowest success rate)
    const mostMissedQuestions = questionAnalysis
      .sort((a, b) => a.success_rate - b.success_rate)
      .slice(0, 10);

    // Difficulty distribution
    const difficultyDistribution = {
      easy: questionAnalysis.filter(q => q.success_rate >= 70).length,
      medium: questionAnalysis.filter(q => q.success_rate >= 40 && q.success_rate < 70).length,
      hard: questionAnalysis.filter(q => q.success_rate < 40).length,
    };

    res.status(200).json({
      success: true,
      data: {
        mostMissedQuestions,
        difficultyDistribution,
        questionAnalysis,
      },
    });
  } catch (error) {
    console.error("Error fetching test insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test insights",
      error: error.message,
    });
  }
};
