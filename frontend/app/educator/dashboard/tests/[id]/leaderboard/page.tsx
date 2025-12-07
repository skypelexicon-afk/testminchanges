'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Medal, Award, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LeaderboardEntry {
  rank: number;
  session_id: number;
  student_name: string;
  score: number;
  time_taken_minutes: number;
  date: string;
}

export default function EducatorTestLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'date'>('score');

  useEffect(() => {
    fetchLeaderboard();
  }, [testId, sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/tests/${testId}/leaderboard?sortBy=${sortBy}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <Award className="h-6 w-6 text-gray-300" />;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-900 border-gray-200';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-950 border-orange-200';
    return 'bg-white dark:bg-gray-950';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="leaderboard-title">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Test Leaderboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Top performers (based on first attempts only)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32" data-testid="sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No attempts yet</h3>
            <p className="text-muted-foreground">
              The leaderboard will appear once students complete the test.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <Card
              key={entry.session_id}
              className={`transition-all hover:shadow-md ${getRankBgColor(entry.rank)}`}
              data-testid={`leaderboard-entry-${entry.rank}`}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center min-w-16">
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Student Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {entry.student_name}
                    </h3>
                  </div>

                  {/* Score */}
                  <div className="text-center min-w-24">
                    <div className="text-2xl font-bold text-primary">
                      {entry.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>

                  {/* Time */}
                  <div className="text-center min-w-24 hidden sm:block">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {entry.time_taken_minutes} min
                    </div>
                    <div className="text-xs text-muted-foreground">Time Taken</div>
                  </div>

                  {/* Date */}
                  <div className="text-center min-w-24 hidden md:block">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">Date</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
