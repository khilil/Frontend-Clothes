import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState(null); // 'success', 'error', null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      // Simulate form submission
      setFormStatus('success');
      setTimeout(() => setFormStatus(null), 5000);
      setFormData({ name: '', email: '', message: '' });
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-primary font-secondary selection:bg-accent selection:text-primary">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:pt-40 md:pb-32 text-center overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-primary to-background">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
          <nav className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-8 opacity-60 flex items-center justify-center space-x-3">
            <Link to="/" className="text-text-secondary hover:text-accent transition-colors duration-300">Home</Link>
            <span className="text-text-secondary/80">/</span>
            <strong className="text-accent font-medium">Contact Us</strong>
          </nav>
          <h1 className="font-display italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-accent mb-6 leading-none tracking-tight shadow-accent/10 drop-shadow-sm">
            Contact Us
          </h1>
          <p className="font-primary tracking-widest uppercase text-sm sm:text-lg md:text-xl text-text-secondary mt-6 opacity-90">
            We're here to help you &mdash; anytime.
          </p>
          <div className="w-16 md:w-24 h-[1px] bg-accent/40 mx-auto mt-12"></div>
        </div>
      </section>

      {/* 2. Contact Info Cards */}
      <section className="py-20 md:py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Email Card */}
          <div className="bg-secondary/20 p-10 rounded-2xl text-center border border-transparent hover:border-accent/20 hover:bg-secondary/40 transition-all duration-500 group shadow-lg shadow-black/20 hover:-translate-y-2 transform">
            <div className="w-16 h-16 mx-auto bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent group-hover:text-primary transition-all duration-500 shadow-lg">
              <Mail size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-primary tracking-wide text-text-primary mb-4">Email Address</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">Reach out to us via email and our team will get back to you promptly.</p>
            <a href="mailto:support@fenrirera.com" className="text-accent font-primary tracking-widest text-sm hover:underline hover:underline-offset-4 transition-all duration-300">
              support@fenrirera.com
            </a>
          </div>

          {/* Phone Card */}
          <div className="bg-secondary/20 p-10 rounded-2xl text-center border border-transparent hover:border-accent/20 hover:bg-secondary/40 transition-all duration-500 group shadow-lg shadow-black/20 hover:-translate-y-2 transform">
            <div className="w-16 h-16 mx-auto bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent group-hover:text-primary transition-all duration-500 shadow-lg">
              <Phone size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-primary tracking-wide text-text-primary mb-4">Phone Support</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">Need immediate assistance? Give us a call during our business hours.</p>
            <a href="tel:+912249700000" className="text-accent font-primary tracking-widest text-sm hover:underline hover:underline-offset-4 transition-all duration-300">
              +91 (0) 22 4970 0000
            </a>
          </div>

          {/* Address Card */}
          <div className="bg-secondary/20 p-10 rounded-2xl text-center border border-transparent hover:border-accent/20 hover:bg-secondary/40 transition-all duration-500 group shadow-lg shadow-black/20 hover:-translate-y-2 transform">
            <div className="w-16 h-16 mx-auto bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent group-hover:text-primary transition-all duration-500 shadow-lg">
              <MapPin size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-primary tracking-wide text-text-primary mb-4">Atelier Location</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">Visit our headquarters to experience Fenrir craftsmanship in person.</p>
            <span className="text-accent font-primary tracking-widest text-sm uppercase">
              Surat, India
            </span>
          </div>
        </div>
      </section>

      {/* 3. Contact Form & Image Section */}
      <section className="py-20 md:py-32 px-6 bg-secondary/30 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left: Image / Branding */}
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-primary/50 h-full min-h-[500px]">
            <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
            <img loading="lazy" 
              src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1600&auto=format&fit=crop" 
              alt="Fenrir Era Support" 
              className="w-full h-full object-cover grayscale-[0.8] brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent z-10 flex flex-col justify-end p-12">
              <MessageSquare size={48} strokeWidth={1} className="text-accent mb-6" />
              <h2 className="text-3xl md:text-5xl font-display italic text-text-primary leading-tight mb-4">
                Let's Start a Conversation.
              </h2>
              <p className="text-text-secondary leading-relaxed text-base md:text-lg max-w-md">
                Whether you have a question about an order, styling advice, or our collections, we are at your service.
              </p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-background/50 backdrop-blur-md p-10 md:p-14 rounded-2xl border border-[#2a2a2a] shadow-xl">
            <h3 className="text-2xl md:text-3xl font-primary tracking-wider text-text-primary mb-8">
              SEND US A MESSAGE
            </h3>

            {formStatus === 'success' && (
              <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm flex items-center">
                <span className="mr-2">✓</span> Your message has been sent successfully. We will get back to you soon.
              </div>
            )}
            
            {formStatus === 'error' && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center">
                <span className="mr-2">✗</span> Please fill out all required fields.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[11px] font-black tracking-[0.2em] text-text-secondary uppercase ml-1">Full Name *</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-primary border border-[#2a2a2a] px-5 py-4 focus:border-accent focus:outline-none transition-colors duration-300 text-text-primary placeholder:text-text-secondary/70 text-sm rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[11px] font-black tracking-[0.2em] text-text-secondary uppercase ml-1">Email Address *</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-primary border border-[#2a2a2a] px-5 py-4 focus:border-accent focus:outline-none transition-colors duration-300 text-text-primary placeholder:text-text-secondary/70 text-sm rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[11px] font-black tracking-[0.2em] text-text-secondary uppercase ml-1">Message *</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="5"
                  className="w-full bg-primary border border-[#2a2a2a] px-5 py-4 focus:border-accent focus:outline-none transition-colors duration-300 text-text-primary placeholder:text-text-secondary/70 text-sm rounded-xl resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 flex items-center justify-center space-x-3 px-8 py-5 bg-accent text-primary font-primary uppercase tracking-[0.15em] hover:bg-white hover:-translate-y-1 transition-all duration-300 rounded-xl shadow-lg shadow-accent/10 font-semibold group"
              >
                <span>Send Message</span>
                <Send size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>
      </section>

    </main>
  );
};

export default ContactUs;
