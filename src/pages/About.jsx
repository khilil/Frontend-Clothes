import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Tag, HeartHandshake, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <main className="min-h-screen bg-background text-textPrimary font-secondary selection:bg-accent selection:text-primary">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:pt-40 md:pb-32 text-center overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-primary to-background">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1605369651586-7787fbda0119?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
          <nav className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-8 opacity-60 flex items-center justify-center space-x-3">
            <Link to="/" className="text-textSecondary hover:text-accent transition-colors duration-300">Home</Link>
            <span className="text-textSecondary/50">/</span>
            <strong className="text-accent font-medium">About Us</strong>
          </nav>
          <h1 className="font-display italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-accent mb-6 leading-none tracking-tight shadow-accent/10 drop-shadow-sm">
            Our Story
          </h1>
          <p className="font-primary tracking-widest uppercase text-sm sm:text-lg md:text-xl text-textSecondary mt-6 opacity-90">
            More than fashion &mdash; it's identity.
          </p>
          <div className="w-16 md:w-24 h-[1px] bg-accent/40 mx-auto mt-12"></div>
        </div>
      </section>

      {/* 2. Brand Introduction */}
      <section className="py-20 md:py-32 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-primary tracking-wide text-textPrimary mb-8">
            WELCOME TO <span className="text-accent">FENRIR ERA</span>
          </h2>
          <p className="text-textSecondary text-base md:text-lg leading-relaxed md:leading-[2] font-light tracking-wide">
            Born from the desire to redefine modern luxury, Fenrir Era is built on the belief that what you wear is a reflection of who you are. We design for the bold, the ambitious, and the uncompromising. Evoking power and elegance, every piece in our collection is meticulously crafted to elevate your daily presence.
          </p>
        </div>
      </section>

      {/* 3. Story Section (2-Column) */}
      <section className="py-20 md:py-32 px-6 bg-secondary/30 border-y border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 relative group rounded-2xl overflow-hidden shadow-2xl shadow-primary/50">
            <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
            <img 
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1600&auto=format&fit=crop" 
              alt="Fenrir Era Craftsmanship" 
              className="w-full h-[500px] md:h-[600px] object-cover grayscale-[0.8] brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="w-12 h-[1px] bg-accent"></span>
              <span className="uppercase tracking-[0.2em] text-xs text-accent font-semibold">The Beginning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display italic text-textPrimary leading-tight">
              A Vision of Affordable Luxury
            </h2>
            <p className="text-textSecondary leading-relaxed text-base md:text-lg">
              Fenrir Era started with a simple question: Why must premium quality always come with an unreachable price tag? The answer led us to bypass traditional retail markups and source directly from top-tier artisans globally.
            </p>
            <p className="text-textSecondary leading-relaxed text-base md:text-lg">
              We bridge the gap between high-end fashion and everyday accessibility. Our garments are engineered to offer impeccable fit, enduring comfort, and a striking silhouette that commands attention wherever you go.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Mission & Vision */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Mission Card */}
          <div className="bg-secondary/40 p-12 md:p-16 rounded-2xl border border-[#2a2a2a] hover:border-accent/40 transition-colors duration-500 group shadow-lg shadow-black/20 hover:-translate-y-2 transform">
            <h3 className="text-2xl md:text-3xl font-primary tracking-wider text-accent mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent mr-4 hidden sm:block"></span>
              OUR MISSION
            </h3>
            <p className="text-textSecondary text-lg leading-relaxed group-hover:text-textPrimary transition-colors duration-500">
              To empower individuals through superior quality, unmatched comfort, and unapologetic confidence. We deliver fashion that acts as armor for the modern era.
            </p>
          </div>
          {/* Vision Card */}
          <div className="bg-secondary/40 p-12 md:p-16 rounded-2xl border border-[#2a2a2a] hover:border-accent/40 transition-colors duration-500 group shadow-lg shadow-black/20 hover:-translate-y-2 transform">
            <h3 className="text-2xl md:text-3xl font-primary tracking-wider text-accent mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent mr-4 hidden sm:block"></span>
              OUR VISION
            </h3>
            <p className="text-textSecondary text-lg leading-relaxed group-hover:text-textPrimary transition-colors duration-500">
              To transcend trends and establish Fenrir Era as the ultimate modern fashion identity brand—recognized globally for excellence, exclusivity, and enduring style.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="py-24 md:py-32 px-6 bg-primary border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-xs tracking-[0.4em] uppercase text-textSecondary mb-4">The Fenrir Standard</h2>
            <h3 className="text-4xl md:text-5xl font-display italic text-textPrimary">Why Choose Us.</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Premium Quality", icon: <ShieldCheck size={32} strokeWidth={1.5} />, desc: "Expertly crafted using high-grade, sustainable materials built to last." },
              { title: "Trendy Designs", icon: <Sparkles size={32} strokeWidth={1.5} />, desc: "Constant innovation in modern silhouettes and timeless aesthetics." },
              { title: "Affordable Pricing", icon: <Tag size={32} strokeWidth={1.5} />, desc: "Luxury-tier craftsmanship without the inflated traditional markups." },
              { title: "Client Satisfaction", icon: <HeartHandshake size={32} strokeWidth={1.5} />, desc: "Dedicated concierge service ensuring a seamless shopping experience." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-secondary/20 p-10 rounded-2xl text-center border border-transparent hover:border-accent/20 hover:bg-secondary/40 transition-all duration-500 group">
                <div className="w-16 h-16 mx-auto bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent group-hover:text-primary transition-all duration-500 shadow-lg">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-primary tracking-wide text-textPrimary mb-4">{feature.title}</h4>
                <p className="text-sm text-textSecondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="relative py-32 px-6 overflow-hidden flex items-center justify-center bg-secondary">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"></div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-primary text-textPrimary uppercase tracking-wider mb-8 drop-shadow-lg">
            Join the <span className="text-accent italic font-display lowercase pl-2">Fenrir Era</span>
          </h2>
          <p className="text-lg md:text-xl text-textSecondary mb-12 font-light">
            Step into a new echelon of style. Elevate your wardrobe today.
          </p>
          <Link 
            to="/shop/all" 
            className="inline-flex items-center justify-center px-10 py-5 bg-accent text-primary font-primary uppercase tracking-[0.15em] hover:bg-white hover:-translate-y-1 transition-all duration-300 rounded-2xl shadow-xl shadow-accent/20 font-semibold"
          >
            Shop Now
          </Link>
        </div>
      </section>

    </main>
  );
};

export default About;
