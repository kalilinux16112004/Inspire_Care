'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Shield, Loader2, ChevronDown } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  is_active?: boolean;
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  }, [supabase]);

  const categories = ['all', ...new Set(services.map((service) => service.category || 'General'))];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <>
      <Navigation />
      <main>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
        {loading ? (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/40">
            <div className="max-w-6xl mx-auto text-center">
              <Loader2 className="mx-auto mb-6 w-8 h-8 animate-spin text-primary dark:text-blue-400" />
              <p className="text-lg text-slate-700 dark:text-slate-350">Loading services...</p>
            </div>
          </section>
        ) : null}

        {/* Hero Section */}
        <section className="bg-linear-to-r from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/40">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Comprehensive Healthcare Services</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              World-class medical facilities across multiple specializations to meet all your healthcare needs.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Filter by Department</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${selectedCategory === cat
                    ? 'bg-primary dark:bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-900 text-foreground dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                    }`}
                >
                  {cat === 'all' ? 'All Services' : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-primary/30 dark:hover:border-blue-500/30 hover:shadow-md transition-all duration-300 group"
                >
                  {/* Image */}
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Shield className="w-12 h-12 text-white opacity-40" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {service.name}
                    </h3>

                    {service.category && (
                      <span className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded mb-2">
                        {service.category}
                      </span>
                    )}

                    {service.description && (
                      <p className="text-slate-655 dark:text-slate-400 text-xs md:text-sm mb-3 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'How do I book an appointment?',
                  a: 'You can book appointments through our website, call our helpline, or visit our hospital directly.',
                },
                {
                  q: 'Do you accept insurance?',
                  a: 'Yes, we accept most major insurance plans. Please contact our billing department for details.',
                },
                {
                  q: 'What is the cost of consultation?',
                  a: 'Consultation fees vary by department and doctor. Please check the service details above.',
                },
                {
                  q: 'Can I consult a specialist?',
                  a: 'Yes, we have experienced specialists across multiple departments. Referrals can be arranged.',
                },
              ].map((faq, idx) => (
                <details key={idx} className="bg-slate-50 dark:bg-slate-800/20 p-4 border border-slate-200/50 dark:border-slate-800 rounded-lg group cursor-pointer transition-all">
                  <summary className="font-semibold flex items-center justify-between text-foreground">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-primary dark:text-blue-400 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
