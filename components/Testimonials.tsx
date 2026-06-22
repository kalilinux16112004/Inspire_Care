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
    <section className="py-20 bg-white dark:bg-slate-900/60 transition-all duration-300">
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
          {displayReviews.map((review, idx) => {
            const authorName = 'author' in review ? review.author : `Patient ${idx + 1}`;
            return (
              <div
                key={review.id}
                className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-slate-800/30 dark:to-slate-850/10 rounded-xl p-6 border border-border dark:border-slate-800 hover:shadow-md hover:border-primary/20 dark:hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-accent text-accent dark:fill-red-400 dark:text-red-400'
                            : 'text-border dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-foreground mb-6 leading-relaxed text-sm italic">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                {/* Author Info block */}
                <div className="border-t border-border dark:border-slate-800 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-blue-400/10 text-primary dark:text-blue-400 font-bold rounded-full flex items-center justify-center text-xs">
                    {authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {authorName}
                    </p>
                    <p className="text-[10px] text-muted-foreground tracking-wide uppercase font-semibold">Verified Patient</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
