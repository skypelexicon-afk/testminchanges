'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Doubt {
  id: number;
  question_number: number | null;
  doubt_text: string;
  screenshot_url: string | null;
  status: string;
  response_text: string | null;
  responded_at: string | null;
  created_at: string;
  student_name?: string;
}

interface DoubtSectionProps {
  sessionId: number;
  testId: number;
}

export default function DoubtSection({ sessionId, testId }: DoubtSectionProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [allTestDoubts, setAllTestDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    questionNumber: '',
    doubtText: '',
    screenshotUrl: '',
  });

  useEffect(() => {
    fetchDoubts();
    fetchAllTestDoubts();
  }, [sessionId, testId]);

  const fetchDoubts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doubts/session/${sessionId}/doubts`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setDoubts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doubts:', error);
    }
  };

  const fetchAllTestDoubts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/doubts/test/${testId}/doubts`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllTestDoubts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching test doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doubtText.trim()) {
      toast.error('Please enter your doubt');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/api/doubts/session/${sessionId}/doubts`,
        {
          questionNumber: formData.questionNumber ? parseInt(formData.questionNumber) : null,
          doubtText: formData.doubtText,
          screenshotUrl: formData.screenshotUrl || null,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Doubt submitted successfully!');
        setFormData({ questionNumber: '', doubtText: '', screenshotUrl: '' });
        setShowForm(false);
        fetchDoubts();
        fetchAllTestDoubts();
      }
    } catch (error) {
      console.error('Error submitting doubt:', error);
      toast.error('Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ask Doubt Section */}
      <Card data-testid="doubt-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Ask a Doubt
              </CardTitle>
              <CardDescription>
                Have questions? Ask and see responses from the educator
              </CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} data-testid="ask-doubt-button">
                Ask Doubt
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmitDoubt} className="space-y-4">
              <div>
                <Label htmlFor="questionNumber">Question Number (Optional)</Label>
                <Input
                  id="questionNumber"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.questionNumber}
                  onChange={(e) => setFormData({ ...formData, questionNumber: e.target.value })}
                  data-testid="doubt-question-number"
                />
              </div>
              <div>
                <Label htmlFor="doubtText">Your Doubt *</Label>
                <Textarea
                  id="doubtText"
                  placeholder="Describe your doubt in detail..."
                  value={formData.doubtText}
                  onChange={(e) => setFormData({ ...formData, doubtText: e.target.value })}
                  rows={4}
                  required
                  data-testid="doubt-text"
                />
              </div>
              <div>
                <Label htmlFor="screenshotUrl">Screenshot URL (Optional)</Label>
                <Input
                  id="screenshotUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.screenshotUrl}
                  onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                  data-testid="doubt-screenshot-url"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} data-testid="submit-doubt">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Doubt'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* All Test Doubts Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Doubts for This Test</CardTitle>
          <CardDescription>
            View doubts and responses from all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : allTestDoubts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No doubts yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTestDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`doubt-${doubt.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {doubt.question_number && (
                        <div className="text-xs text-muted-foreground mb-1">
                          Question #{doubt.question_number}
                        </div>
                      )}
                      <p className="font-medium">{doubt.doubt_text}</p>
                      {doubt.screenshot_url && (
                        <a
                          href={doubt.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          View Screenshot
                        </a>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Asked on {new Date(doubt.created_at).toLocaleDateString()}
                        {doubt.student_name && ` by ${doubt.student_name}`}
                      </div>
                    </div>
                    {doubt.status === 'responded' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded flex-shrink-0 ml-2">
                        Pending
                      </span>
                    )}
                  </div>
                  {doubt.response_text && (
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mt-3">
                      <div className="text-sm font-medium mb-1 text-blue-900 dark:text-blue-100">
                        Educator's Response:
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {doubt.response_text}
                      </p>
                      {doubt.responded_at && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Responded on {new Date(doubt.responded_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
