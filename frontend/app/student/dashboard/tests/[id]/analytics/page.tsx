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
  PieChart,
  Activity,
  Target,
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

export default function TestAnalyticsPage() {
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
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4" data-testid="back-button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold" data-testid="analytics-title">
          Test Analytics
        </h1>
        <p className="text-muted-foreground mt-2">Comprehensive performance statistics and insights</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                    <p className="text-2xl font-bold" data-testid="total-attempts">
                      {analytics.totalAttempts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Students</p>
                    <p className="text-2xl font-bold" data-testid="unique-students">
                      {analytics.uniqueStudents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-2xl font-bold" data-testid="pass-percentage">
                      {analytics.passPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold" data-testid="average-score">
                      {analytics.averageScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Passed Students:</span>
                  <span className="font-semibold">{analytics.passedStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Highest Score:</span>
                  <span className="font-semibold text-green-600">{analytics.highestScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lowest Score:</span>
                  <span className="font-semibold text-red-600">{analytics.lowestScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completion Rate:</span>
                  <span className="font-semibold">{analytics.completionRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.scoreDistribution.map((item) => (
                    <div key={item.range} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.range}</span>
                        <span className="font-medium">{item.count} students</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{
                            width: `${(item.count / analytics.totalAttempts) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attempts Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Attempts Over Time
              </CardTitle>
              <CardDescription>Daily test attempt statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.attemptsOverTime.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {analytics.attemptsOverTime.map((item) => (
                    <div key={item.date} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground min-w-28">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <div className="flex-1 h-8 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-end pr-2"
                          style={{
                            width: `${(item.count / Math.max(...analytics.attemptsOverTime.map(a => a.count))) * 100}%`,
                          }}
                        >
                          <span className="text-white text-sm font-medium">{item.count}</span>
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
            <>
              {/* Difficulty Distribution */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Question Difficulty Distribution
                  </CardTitle>
                  <CardDescription>Based on student success rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Easy (≥70%)</p>
                        <p className="text-4xl font-bold text-green-600">
                          {insights.difficultyDistribution.easy}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">questions</p>
                      </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Medium (40-70%)</p>
                        <p className="text-4xl font-bold text-yellow-600">
                          {insights.difficultyDistribution.medium}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">questions</p>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Hard (&lt;40%)</p>
                        <p className="text-4xl font-bold text-red-600">
                          {insights.difficultyDistribution.hard}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">questions</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Most Missed Questions */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Missed Questions</CardTitle>
                  <CardDescription>Questions with lowest success rates</CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.mostMissedQuestions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  ) : (
                    <div className="space-y-4">
                      {insights.mostMissedQuestions.map((question, index) => (
                        <Card key={question.question_id} className="border-l-4 border-l-red-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">#{index + 1}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {question.question_type.toUpperCase()} • {question.marks} marks
                                  </span>
                                </div>
                                <p className="text-sm mb-3">{question.question_text}</p>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Correct: </span>
                                    <span className="font-medium text-green-600">
                                      {question.correct_count}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Incorrect: </span>
                                    <span className="font-medium text-red-600">
                                      {question.incorrect_count}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Unattempted: </span>
                                    <span className="font-medium text-gray-600">
                                      {question.unattempted_count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center flex-shrink-0">
                                <div
                                  className={`text-2xl font-bold ${
                                    question.success_rate >= 70
                                      ? 'text-green-600'
                                      : question.success_rate >= 40
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {question.success_rate}%
                                </div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
