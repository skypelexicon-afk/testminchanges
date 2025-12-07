'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Course {
  id: number;
  title: string;
  subject?: string;
  price: number;
}

interface CourseRecommendationManagerProps {
  testId: number;
}

export default function CourseRecommendationManager({ testId }: CourseRecommendationManagerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoursesAndRecommendations();
  }, [testId]);

  const fetchCoursesAndRecommendations = async () => {
    try {
      setLoading(true);
      // Fetch educator's courses
      const coursesResponse = await axios.get(`${API_URL}/api/courses/educator/courses`, {
        withCredentials: true,
      });

      // Fetch current recommendations
      const recommendationsResponse = await axios.get(
        `${API_URL}/api/tests/${testId}/recommendation-ids`,
        { withCredentials: true }
      );

      if (coursesResponse.data.success) {
        setCourses(coursesResponse.data.data);
      }

      if (recommendationsResponse.data.success) {
        setSelectedCourseIds(recommendationsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSaveRecommendations = async () => {
    try {
      setSaving(true);
      const response = await axios.post(
        `${API_URL}/api/tests/${testId}/recommendations`,
        { courseIds: selectedCourseIds },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Course recommendations saved successfully!');
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
      toast.error('Failed to save recommendations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="course-recommendation-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recommend Courses for This Test
        </CardTitle>
        <CardDescription>
          Select courses to recommend to students after they complete this test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No courses available. Create a course first to recommend it.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`course-option-${course.id}`}
                >
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={selectedCourseIds.includes(course.id)}
                    onCheckedChange={() => handleToggleCourse(course.id)}
                    data-testid={`course-checkbox-${course.id}`}
                  />
                  <label
                    htmlFor={`course-${course.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="font-medium">{course.title}</p>
                    {course.subject && (
                      <p className="text-sm text-muted-foreground">{course.subject}</p>
                    )}
                    <p className="text-sm text-primary font-semibold mt-1">
                      ₹{course.price}
                    </p>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedCourseIds.length} course(s) selected
              </p>
              <Button
                onClick={handleSaveRecommendations}
                disabled={saving}
                data-testid="save-recommendations-button"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Recommendations
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
