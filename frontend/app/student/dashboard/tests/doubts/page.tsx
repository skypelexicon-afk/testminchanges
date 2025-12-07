'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Doubt {
  id: number;
  session_id: number;
  test_id: number;
  test_name: string;
  test_subject: string;
  question_number: number | null;
  doubt_text: string;
  screenshot_url: string | null;
  status: string;
  response_text: string | null;
  responded_at: string | null;
  created_at: string;
  student_name: string;
  student_email: string;
}

export default function EducatorDoubtsPage() {
  const router = useRouter();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/doubts/educator/doubts`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setDoubts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doubts:', error);
      toast.error('Failed to fetch doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToDoubt = async (doubtId: number) => {
    const responseText = responses[doubtId];
    if (!responseText?.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/doubts/doubts/${doubtId}/respond`,
        { responseText },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Response submitted successfully!');
        setRespondingTo(null);
        setResponses({ ...responses, [doubtId]: '' });
        fetchDoubts();
      }
    } catch (error) {
      console.error('Error responding to doubt:', error);
      toast.error('Failed to submit response');
    }
  };

  const pendingDoubts = doubts.filter((d) => d.status === 'pending');
  const respondedDoubts = doubts.filter((d) => d.status === 'responded');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="doubts-title">
          Student Doubts
        </h1>
        <p className="text-muted-foreground mt-2">Manage and respond to student queries</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" data-testid="pending-tab">
            Pending ({pendingDoubts.length})
          </TabsTrigger>
          <TabsTrigger value="responded" data-testid="responded-tab">
            Responded ({respondedDoubts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingDoubts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No pending doubts</h3>
                <p className="text-muted-foreground">All doubts have been addressed!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingDoubts.map((doubt) => (
                <Card key={doubt.id} className="border-l-4 border-l-yellow-500" data-testid={`doubt-${doubt.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-yellow-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                          <Badge variant="secondary">{doubt.test_subject}</Badge>
                          {doubt.question_number && (
                            <Badge variant="outline">Question #{doubt.question_number}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{doubt.test_name}</CardTitle>
                        <CardDescription className="mt-2">
                          Asked by {doubt.student_name} ({doubt.student_email}) on{' '}
                          {new Date(doubt.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/student/dashboard/tests/${doubt.test_id}/session/${doubt.session_id}/result`)}
                        title="View My Result"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-2">Student's Doubt:</p>
                      <p className="text-sm">{doubt.doubt_text}</p>
                      {doubt.screenshot_url && (
                        <a
                          href={doubt.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                        >
                          View Screenshot
                        </a>
                      )}
                    </div>

                    {respondingTo === doubt.id ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your response here..."
                          value={responses[doubt.id] || ''}
                          onChange={(e) =>
                            setResponses({ ...responses, [doubt.id]: e.target.value })
                          }
                          rows={4}
                          data-testid={`response-textarea-${doubt.id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRespondToDoubt(doubt.id)}
                            data-testid={`submit-response-${doubt.id}`}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Submit Response
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRespondingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setRespondingTo(doubt.id)}
                        data-testid={`respond-button-${doubt.id}`}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responded" className="mt-6">
          {respondedDoubts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No responded doubts yet</h3>
                <p className="text-muted-foreground">Doubts you respond to will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {respondedDoubts.map((doubt) => (
                <Card key={doubt.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            Responded
                          </Badge>
                          <Badge variant="secondary">{doubt.test_subject}</Badge>
                          {doubt.question_number && (
                            <Badge variant="outline">Question #{doubt.question_number}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{doubt.test_name}</CardTitle>
                        <CardDescription className="mt-2">
                          Asked by {doubt.student_name} on{' '}
                          {new Date(doubt.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-2">Student's Doubt:</p>
                      <p className="text-sm">{doubt.doubt_text}</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium mb-2 text-blue-900">Your Response:</p>
                      <p className="text-sm text-blue-800">{doubt.response_text}</p>
                      {doubt.responded_at && (
                        <p className="text-xs text-blue-600 mt-2">
                          Responded on {new Date(doubt.responded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
