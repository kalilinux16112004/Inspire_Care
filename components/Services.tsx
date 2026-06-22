'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  is_active?: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);

      try {
        const result = await supabase
          .from("services")
          .select("*")
          .order("name");

        console.log("SUPABASE RESULT:", result);

        if (result.error) {
          alert(
            JSON.stringify(
              {
                message: result.error.message,
                details: result.error.details,
                hint: result.error.hint,
                code: result.error.code,
              },
              null,
              2
            )
          );

          throw result.error;
        }

        setServices(result.data ?? []);
      } catch (err) {
        console.log("RAW ERROR:", err);

        if (err instanceof Error) {
          console.log("MESSAGE:", err.message);
          console.log("STACK:", err.stack);
        }

        console.log("STRINGIFIED:", JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services" className="py-16 bg-white dark:bg-slate-900/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white text-balance">
            Comprehensive Medical Services
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            From preventive care to advanced treatments, our complete range of services delivers exceptional outcomes with cutting-edge medical technology.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-blue-400" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services available at the moment</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/30 dark:hover:border-blue-500/30 hover:shadow-md active:scale-[0.99] transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                        <Shield className="w-12 h-12 text-white opacity-40" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {service.name}
                      </h3>

                      {service.category && (
                        <span className="inline-block px-2.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md">
                          {service.category}
                        </span>
                      )}

                      {service.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-3">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                      <Link href="/services" className="text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 font-bold text-sm flex items-center gap-1">
                        Learn More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-10 text-center">
              <Link href="/services">
                <Button size="lg" className="bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold h-12 px-8 active:scale-95 transition-all cursor-pointer shadow-sm">
                  View All Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
