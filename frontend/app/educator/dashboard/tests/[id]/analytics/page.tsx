'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Analytics {
  totalAttempts: number;
  uniqueStudents: number;
  passedStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
  passPercentage: number;
  attemptsOverTime: Array<{ date: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

interface Insights {
  mostMissedQuestions: Array<{
    question_id: number;
    question_text: string;
    question_type: string;
    marks: number;
    correct_count: number;
    incorrect_count: number;
    unattempted_count: number;
    success_rate: number;
  }>;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export default function EducatorTestAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchInsights();
  }, [testId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/tests/${testId}/analytics`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tests/${testId}/insights`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setInsights(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
          data-testid="back-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No analytics available</h3>
            <p className="text-muted-foreground">
              Analytics will be available once students start attempting the test.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
          data-testid="back-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="analytics-title">
            Test Analytics
          </h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card data-testid="metric-total-attempts">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-unique-students">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Students</p>
                <p className="text-2xl font-bold">{analytics.uniqueStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-passed-students">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passed Students</p>
                <p className="text-2xl font-bold">{analytics.passedStudents}</p>
                <p className="text-xs text-green-600 font-semibold">
                  {analytics.passPercentage.toFixed(1)}% pass rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-average-score">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{analytics.averageScore}</p>
                <p className="text-xs text-muted-foreground">
                  High: {analytics.highestScore} | Low: {analytics.lowestScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
            <CardDescription>Students who completed the test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${analytics.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {analytics.completionRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pass Percentage</CardTitle>
            <CardDescription>Students who passed (40% or more)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${analytics.passPercentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {analytics.passPercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="distribution" data-testid="distribution-tab">
            Score Distribution
          </TabsTrigger>
          <TabsTrigger value="timeline" data-testid="timeline-tab">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="insights-tab">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>
                Distribution of student scores across different ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.scoreDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.range}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} student{item.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            analytics.totalAttempts > 0
                              ? (item.count / analytics.totalAttempts) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attempts Over Time</CardTitle>
              <CardDescription>
                Number of test attempts by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.attemptsOverTime.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attempt data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.attemptsOverTime.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="text-sm font-medium">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.count} attempt{item.count !== 1 ? 's' : ''}
                        </span>
                        <div
                          className="w-16 bg-gray-200 rounded-full h-2"
                        >
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.count /
                                  Math.max(
                                    ...analytics.attemptsOverTime.map((a) => a.count)
                                  )) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {insights && (
            <div className="space-y-6">
              {/* Difficulty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Question Difficulty Distribution</CardTitle>
                  <CardDescription>
                    Based on student success rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600">
                        {insights.difficultyDistribution.easy}
                      </div>
                      <div className="text-sm text-green-700 font-medium mt-1">
                        Easy Questions
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        70%+ success rate
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-3xl font-bold text-yellow-600">
                        {insights.difficultyDistribution.medium}
                      </div>
                      <div className="text-sm text-yellow-700 font-medium mt-1">
                        Medium Questions
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        40-70% success rate
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-3xl font-bold text-red-600">
                        {insights.difficultyDistribution.hard}
                      </div>
                      <div className="text-sm text-red-700 font-medium mt-1">
                        Hard Questions
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Below 40% success rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Most Missed Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Most Missed Questions
                  </CardTitle>
                  <CardDescription>
                    Questions with the lowest success rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.mostMissedQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No question data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {insights.mostMissedQuestions.slice(0, 10).map((question, index) => (
                        <div
                          key={question.question_id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Question #{question.question_id}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                  {question.question_type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {question.marks} marks
                                </span>
                              </div>
                              <p className="text-sm">{question.question_text}</p>
                            </div>
                            <div className="flex-shrink-0 text-center">
                              <div
                                className={`text-xl font-bold ${
                                  question.success_rate >= 70
                                    ? 'text-green-600'
                                    : question.success_rate >= 40
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {question.success_rate}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Success Rate
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {question.correct_count} correct
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-3 w-3 rounded-full bg-red-500" />
                              {question.incorrect_count} incorrect
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-3 w-3 rounded-full bg-gray-400" />
                              {question.unattempted_count} unattempted
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => router.push('/educator/dashboard/tests')}
          data-testid="back-to-tests"
        >
          Back to Tests
        </Button>
        <Button
          onClick={() => router.push(`/educator/dashboard/tests/${testId}/leaderboard`)}
          data-testid="view-leaderboard"
        >
          <Award className="h-4 w-4 mr-2" />
          View Leaderboard
        </Button>
      </div>
    </div>
  );
}
