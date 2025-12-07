'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RecommendedCourse {
  course_id: number;
  title: string;
  description: string | null;
  image: string;
  price: number;
  originalPrice: number;
  discountLabel: string | null;
  educatorName: string | null;
  educatorImage: string | null;
}

interface RecommendedCoursesProps {
  testId: number;
}

export default function RecommendedCourses({ testId }: RecommendedCoursesProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [testId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/tests/${testId}/recommendations`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId: number) => {
    router.push(`/all-courses/course/${courseId}`);
  };

  const handleBuyNow = (courseId: number) => {
    router.push(`/all-courses/explore/${courseId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Courses for You
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

  if (courses.length === 0) {
    return null;
  }

  return (
    <Card data-testid="recommended-courses">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recommended Courses for You
        </CardTitle>
        <CardDescription>
          Enhance your learning with these recommended courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.course_id} className="hover:shadow-md transition-shadow">
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {course.discountLabel && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {course.discountLabel}
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                {course.educatorName && (
                  <CardDescription className="text-sm">
                    by {course.educatorName}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {course.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold">₹{course.price}</span>
                  {course.originalPrice > course.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{course.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewCourse(course.course_id)}
                    data-testid={`view-course-${course.course_id}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleBuyNow(course.course_id)}
                    data-testid={`buy-course-${course.course_id}`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
