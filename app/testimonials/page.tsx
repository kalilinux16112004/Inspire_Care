'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Star, MessageCircle } from 'lucide-react';

export default function TestimonialsPage() {
  const [ratingFilter, setRatingFilter] = useState('all');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', rating: 5, message: '' });

  const testimonials = [
    {
      id: 1,
      name: 'Mr. Rajesh Sharma',
      rating: 5,
      date: 'March 2024',
      service: 'Cardiology Consultation',
      message: 'Exceptional care and very patient. Dr. Kumar explained everything in detail. The entire staff was very helpful and professional. Highly recommended!',
      verified: true,
    },
    {
      id: 2,
      name: 'Mrs. Priya Patel',
      rating: 5,
      date: 'February 2024',
      service: 'Obstetrics',
      message: 'Best cardiologist I have met. Very professional and caring. Thank you for bringing my baby safely into the world. Cannot thank you enough!',
      verified: true,
    },
    {
      id: 3,
      name: 'Mr. Amit Gupta',
      rating: 4.5,
      date: 'January 2024',
      service: 'Orthopedic Surgery',
      message: 'Great doctor, very knowledgeable. A bit busy but always gives time to patients. My knee surgery was successful and I am recovering well.',
      verified: true,
    },
    {
      id: 4,
      name: 'Mrs. Neha Singh',
      rating: 5,
      date: 'December 2023',
      service: 'Pediatrics',
      message: 'Dr. Neha is amazing with children! My son was scared but she made him comfortable. Very caring and explains everything to parents clearly.',
      verified: true,
    },
    {
      id: 5,
      name: 'Mr. Vikram Desai',
      rating: 4,
      date: 'November 2023',
      service: 'General Surgery',
      message: 'Good experience overall. The surgery went well and the post-operative care was excellent. Recovery has been smooth.',
      verified: true,
    },
    {
      id: 6,
      name: 'Mrs. Anjali Verma',
      rating: 5,
      date: 'October 2023',
      service: 'Respiratory Medicine',
      message: 'Dr. Anjali helped me control my asthma symptoms completely. Very patient and gives personalized treatment plans. Highly satisfied!',
      verified: true,
    },
    {
      id: 7,
      name: 'Mr. Suresh Iyer',
      rating: 4.5,
      date: 'September 2023',
      service: 'Emergency Services',
      message: 'When I had an accident, the emergency team was very quick and efficient. Saved my life! Great hospital with excellent staff.',
      verified: true,
    },
    {
      id: 8,
      name: 'Mrs. Geeta Malhotra',
      rating: 5,
      date: 'August 2023',
      service: 'General Check-up',
      message: 'Very clean hospital with friendly staff. All doctors are highly qualified. I trust this hospital completely with my family health.',
      verified: true,
    },
  ];

  const filteredTestimonials =
    ratingFilter === 'all'
      ? testimonials
      : testimonials.filter(t => Math.floor(t.rating) === parseInt(ratingFilter));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] Testimonial submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', rating: 5, message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const averageRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <>
      <Navigation />
      <main>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Patient Testimonials' }]} />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-green-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Patient Testimonials</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from our patients about their experiences and the care they received.
            </p>
          </div>
        </section>

        {/* Rating Summary */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-5xl font-bold text-primary mb-2">{averageRating}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">Based on {testimonials.length} reviews</p>
              </div>

              {[5, 4, 3, 2].map(rating => {
                const count = testimonials.filter(t => Math.floor(t.rating) === rating).length;
                const percentage = (count / testimonials.length) * 100;
                return (
                  <div key={rating} className="text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">Filter by rating:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  ratingFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white text-foreground border border-gray-300 hover:border-primary'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2].map(rating => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(rating.toString())}
                  className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                    ratingFilter === rating.toString()
                      ? 'bg-primary text-white'
                      : 'bg-white text-foreground border border-gray-300 hover:border-primary'
                  }`}
                >
                  {rating}
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {filteredTestimonials.map(testimonial => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.date}</p>
                    </div>
                    {testimonial.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Verified</span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(testimonial.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm font-semibold ml-2">{testimonial.rating}</span>
                  </div>

                  {/* Service */}
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-3">
                    {testimonial.service}
                  </span>

                  {/* Message */}
                  <p className="text-muted-foreground leading-relaxed italic">
                    &quot;{testimonial.message}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Submit Testimonial Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <MessageCircle className="w-8 h-8 text-primary" />
                Share Your Experience
              </h2>
              <p className="text-muted-foreground mb-8">
                Help other patients by sharing your experience at Team Inspire Care Hospital.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                  <p className="text-green-700 font-semibold mb-2">Thank you!</p>
                  <p className="text-green-600">Your testimonial has been received. It will be reviewed and published soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Your Rating</label>
                    <div className="flex gap-4">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating }))}
                          className={`text-3xl transition-transform hover:scale-125 ${
                            formData.rating === rating ? 'scale-125' : ''
                          }`}
                        >
                          {formData.rating >= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Your Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Share your experience..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Submit Testimonial
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
