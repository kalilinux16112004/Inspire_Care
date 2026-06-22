'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, ChevronRight, User, Briefcase, MessageSquare, Send, ShieldCheck, Loader2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate form submission - in production, send to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('[v0] Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#edf5fd]/70 dark:bg-slate-950/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Contact Details & Map */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Trust Badge Indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-full w-fit border border-blue-100/50 dark:border-blue-900/30">
                <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Get in Touch</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a1e3a] dark:text-white leading-tight">
                We&apos;re Here to Help
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
                Have questions or need support? Reach out to us anytime.
                <br />
                We&apos;ll get back to you as soon as possible.
              </p>
            </div>

            {/* Visual Info Cards */}
            <div className="space-y-3">
              {/* Phone Card */}
              <a href="tel:+91-XXXX-XXXX-XX" className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/80 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Phone</h4>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-base mt-0.5">+91-XXXX-XXXX-XX</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Available 24/7 for support</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Email Card */}
              <a href="mailto:contact@teaminspirecare.com" className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/80 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Email</h4>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-base mt-0.5">contact@teaminspirecare.com</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">We&apos;ll get back within 24 hours</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Location Card */}
              <a href="https://maps.google.com/?q=Raj+Antila+CHS+Ltd+Poonam+Garden+SK+Stone+Mira+Road+East+Thane" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/80 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Location</h4>
                    <p className="text-slate-700 dark:text-slate-200 font-bold text-sm mt-0.5 leading-snug">
                      1st Floor, Raj Antila CHS Ltd., Poonam Garden, S.K.Stone
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mira Road(E), Thane-401107</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </a>
            </div>

            {/* Custom Google Map Block */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.8813848016425!2d72.86808077498301!3d19.28752378196112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b0413c50ad0d%3A0xbc0cc184cfaeac49!2sRaj%20Antila!5e0!3m2!1sen!2sin!4v1780762374588!5m2!1sen!2sin"
                width="100%"
                height="180"
                className="border-0 block"
                loading="lazy"
                title="Inspire Care Hospital Map Location"
              ></iframe>
              <a
                href="https://maps.google.com/?q=Raj+Antila+CHS+Ltd+Poonam+Garden+SK+Stone+Mira+Road+East+Thane"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer z-10"
              >
                View on Google Maps
              </a>
            </div>

            {/* Emergency Alert Box */}
            <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/20 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 relative overflow-hidden group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Phone className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-red-600 dark:text-red-400 text-xs tracking-wider uppercase">Emergency Support</h4>
                  <p className="text-slate-700 dark:text-slate-350 text-xs mt-1 leading-relaxed max-w-sm">
                    For urgent clinical situations or critical trauma events, call our 24/7 hotline.
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-red-600 dark:text-red-400 font-extrabold text-lg tracking-tight">
                  +91-XXXX-XXXX-99
                </span>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-full">
                  24/7 Available
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/80 shadow-md flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold text-[#0a1e3a] dark:text-white relative pb-3">
                  Send us a Message
                  <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#0b66e4] dark:bg-blue-500 rounded-full"></span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Fill out the form below and we&apos;ll get back to you.
                </p>
              </div>

              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500 text-emerald-600 rounded-xl text-sm font-semibold">
                  Thank you! We&apos;ve received your message and will get back to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name & Email inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600"
                    />
                  </div>
                </div>

                {/* Phone input */}
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  />
                </div>

                {/* Subject input */}
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  />
                </div>

                {/* Message input */}
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-4.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={1000}
                    className="pl-10 pr-4 pt-3.5 pb-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-36 rounded-xl w-full focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  />
                  <div className="absolute bottom-3 right-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    {formData.message.length} / 1000
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0b66e4] hover:bg-[#0957c3] text-white font-bold h-12 rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              {/* Confidentiality Notice */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-slate-950/40 border border-blue-100/30 dark:border-slate-800/80 rounded-xl flex items-center justify-center gap-2 text-[11px] text-[#0b66e4] dark:text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0b66e4] dark:text-blue-400 flex-shrink-0" />
                <span>Your information is secure and confidential.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
