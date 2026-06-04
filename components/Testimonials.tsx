'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  doctor_id: string;
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const result = await supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(3);

        // Log full response for diagnostics
        console.debug('[v0] reviews fetch result:', {
          data: result.data,
          error: result.error,
          status: (result as any).status,
          statusText: (result as any).statusText,
        });

        if (result.error) throw result.error;
        setReviews(result.data || []);
      } catch (err) {
        const error = err as any;
        if (error instanceof Error) {
          console.error('[v0] Error fetching reviews:', {
            message: error.message,
            stack: error.stack,
          });
        } else if (error) {
          console.error('[v0] Error fetching reviews (non-Error):', error);
        } else {
          console.error('[v0] Error fetching reviews: unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const defaultReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent service and compassionate care. The doctors took time to explain everything clearly.',
      author: 'Rajesh Kumar',
    },
    {
      id: '2',
      rating: 5,
      comment: 'Very professional and clean facility. Highly recommended for anyone seeking quality healthcare.',
      author: 'Priya Sharma',
    },
    {
      id: '3',
      rating: 4,
      comment: 'Great doctors and staff. The appointment process was smooth and efficient.',
      author: 'Amit Singh',
    },
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Patient Testimonials
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear what our satisfied patients have to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayReviews.map((review, idx) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 border border-border"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-accent text-accent'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-foreground mb-4 leading-relaxed text-sm">
                &quot;{review.comment}&quot;
              </p>

              {/* Author */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">
                  {'author' in review ? review.author : `Patient ${idx + 1}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
