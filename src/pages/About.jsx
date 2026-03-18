import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main className="luxury-gradient-bg font-secondary text-textPrimary min-h-screen">

      {/* HERO */}
      <section className="pt-24 px-5 pb-16 md:pt-32 md:pb-20 text-center text-textPrimary luxury-gradient-dark">
        <nav className="text-[10px] md:text-[9px] tracking-[0.4em] uppercase mb-8 opacity-60">
          <a href="/" className="text-textSecondary hover:text-accent transition-colors no-underline">Home</a>
          <span className="mx-3">/</span>
          <strong className="text-accent">About Us</strong>
        </nav>

        <h1 className="luxury-text-primary text-[64px] lg:text-[72px] md:text-[56px] sm:text-[40px] leading-none mb-4">OUR STORY</h1>
        <div className="w-12 h-[1px] bg-accent/30 mx-auto mt-8"></div>
      </section>

      {/* IMAGE */}
      <section className="px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto h-[600px] lg:h-[480px] md:h-[360px] overflow-hidden rounded-[40px] shadow-2xl border border-[#1f1f1f]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMhJPH52uhc2uLVL6E9VFWUJJ45NhBgAMsSKXSlI7HSTPRjaQXIekP_DtzuPxRAQelsMMm9pQCL0c1Bz_98-LfkyYdhUqZvnB16AWJZY7TL69xACH_Fq7M_5lKN3Jol1VjE-ORrEC8Oyd01Vk05qeKzaBXmLOskqq4-8OFN8QaMrS_uv63Q80R4MmH-VVqf5XBjyMRDrkqlsj1wXC1_E_TDIi72OWRh4G9PxcOsWeA0eiM07iAJRyBnQ_NWqX0879AoSfl0k3Ee7O9"
            alt="Modern Men Lifestyle"
            className="w-full h-full object-cover grayscale brightness-[0.8] hover:grayscale-0 hover:brightness-100 transition-all duration-[2s] ease-out scale-110 hover:scale-100"
          />
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-[800px] mx-auto my-[160px] lg:my-[120px] px-6 text-center">
        <h2 className="font-display italic text-5xl lg:text-4xl md:text-3xl mb-12 text-accent">Crafting the Modern Silhouette</h2>

        <p className="text-textSecondary leading-[2] mb-8 md:text-[16px] sm:text-sm tracking-wide">
          Founded in 2020, MODERN MEN emerged from a simple realization:
          the modern gentleman deserves a wardrobe that speaks to his ambition
          without sacrificing comfort.
        </p>

        <p className="text-textSecondary leading-[2] mb-8 md:text-[16px] sm:text-sm tracking-wide">
          Our philosophy blends traditional craftsmanship with contemporary
          design, focusing on quality, comfort, and confidence.
        </p>

        <p className="text-textSecondary leading-[2] mb-12 md:text-[16px] sm:text-sm tracking-wide">
          Every piece is produced in limited runs to ensure premium quality
          and reduce environmental impact.
        </p>

        <div className="w-[120px] h-[1px] bg-accent/20 mx-auto mt-16"></div>
      </section>

      {/* VALUES */}
      <section className="bg-secondary/30 py-[160px] px-6 sm:py-24 border-y border-[#1f1f1f]">
        <div className="text-center mb-24 text-textPrimary">
          <h4 className="text-[10px] tracking-[0.5em] uppercase mb-4 font-black text-accent">Our Core Values</h4>
          <h3 className="luxury-text-primary text-3xl md:text-4xl">THE STANDARDS WE LIVE BY</h3>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8">
          <div className="luxury-card p-12 md:p-10 text-center">
            <div className="w-16 h-16 bg-accent text-primary rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-accent/20">
              <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            </div>
            <h5 className="luxury-text-primary text-lg mb-4">Premium Quality</h5>
            <p className="text-textSecondary text-sm leading-relaxed">Only the finest materials sourced from heritage mills across the globe.</p>
          </div>

          <div className="luxury-card p-12 md:p-10 text-center">
            <div className="w-16 h-16 bg-accent text-primary rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-accent/20">
              <span className="material-symbols-outlined text-3xl">local_shipping</span>
            </div>
            <h5 className="luxury-text-primary text-lg mb-4">Express Delivery</h5>
            <p className="text-textSecondary text-sm leading-relaxed">Global logistics optimized for discreet and prompt door-to-door service.</p>
          </div>

          <div className="luxury-card p-12 md:p-10 text-center">
            <div className="w-16 h-16 bg-accent text-primary rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-accent/20">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <h5 className="luxury-text-primary text-lg mb-4">House Concierge</h5>
            <p className="text-textSecondary text-sm leading-relaxed">Our dedicated team is at your service 24/7 for tailored style advice.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="luxury-gradient-dark text-textPrimary text-center py-[160px] px-6 border-t border-[#1f1f1f]">
        <h2 className="luxury-text-primary text-5xl md:text-6xl mb-8">JOIN THE REVOLUTION</h2>
        <p className="text-textSecondary italic font-display text-xl mb-12 opacity-80">"Elegance is the only beauty that never fades."</p>
        <Link to="/shop" className="luxury-button inline-block no-underline">Explore Collection</Link>
      </section>

    </main>
  );
};

export default About;
