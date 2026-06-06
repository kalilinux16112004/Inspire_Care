'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Shield, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setServices(
          (data || []).map((service: any) => ({
            id: String(service.id),
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price,
            duration_minutes: service.duration_minutes,
            is_active: service.is_active,
          }))
        );
      } catch (error) {
        console.error('[v0] Error fetching services:', error);
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
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
              <Loader2 className="mx-auto mb-6 w-8 h-8 animate-spin text-primary" />
              <p className="text-lg text-slate-700">Loading services...</p>
            </div>
          </section>
        ) : null}

        {/* Hero Section */}
        <section className="bg-linear-to-r from-blue-50 to-green-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Comprehensive Healthcare Services</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              World-class medical facilities across multiple specializations to meet all your healthcare needs.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Filter by Department</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Services' : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className="bg-linear-to-r from-blue-500 to-green-500 p-6 text-white">
                    <Shield className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold">{service.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4">{service.description || 'Comprehensive service details will be available soon.'}</p>
                    <div className="mb-4">
                      <p className="font-semibold text-sm mb-2">Category</p>
                      <p className="text-slate-600 text-sm">{service.category || 'General'}</p>
                    </div>
                    <div className="border-t pt-4 flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {service.price != null ? `₹${service.price.toFixed(0)}` : 'Price on request'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {service.duration_minutes ? `${service.duration_minutes} mins` : 'Duration varies'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
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
                <details key={idx} className="bg-gray-50 p-4 rounded-lg group cursor-pointer">
                  <summary className="font-semibold flex items-center justify-between">
                    {faq.q}
                    <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-muted-foreground mt-3">{faq.a}</p>
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
