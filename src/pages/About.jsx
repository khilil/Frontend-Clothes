const About = () => {
  return (
    <main className="font-secondary text-textPrimary bg-background min-h-screen">

      {/* HERO */}
      <section className="pt-20 px-5 pb-10 md:pt-[60px] md:px-4 md:pb-8 text-center text-textPrimary">
        <nav className="text-[10px] md:text-[9px] tracking-[0.2em] uppercase mb-6">
          <a href="#" className="text-textSecondary no-underline">Home</a>
          <span className="mx-2">/</span>
          <strong>About Us</strong>
        </nav>

        <h1 className="font-primary text-[96px] lg:text-[72px] md:text-[48px] sm:text-[40px] tracking-[-0.05em] leading-none">OUR STORY</h1>
      </section>

      {/* IMAGE */}
      <section>
        <div className="max-w-[1200px] mx-auto h-[600px] lg:h-[420px] md:h-[300px] overflow-hidden rounded-[32px] lg:rounded-3xl md:rounded-2xl">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMhJPH52uhc2uLVL6E9VFWUJJ45NhBgAMsSKXSlI7HSTPRjaQXIekP_DtzuPxRAQelsMMm9pQCL0c1Bz_98-LfkyYdhUqZvnB16AWJZY7TL69xACH_Fq7M_5lKN3Jol1VjE-ORrEC8Oyd01Vk05qeKzaBXmLOskqq4-8OFN8QaMrS_uv63Q80R4MmH-VVqf5XBjyMRDrQqlsj1wXC1_E_TDIi72OWRh4G9PxcOsWeA0eiM07iAJRyBnQ_NWqX0879AoSfl0k3Ee7O9"
            alt="Modern Men Lifestyle"
            className="w-full h-full object-cover grayscale brightness-90 transition-transform duration-1000 ease-in-out hover:scale-105"
          />
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-[800px] mx-auto my-[120px] lg:my-[100px] lg:px-5 md:my-20 text-center">
        <h2 className="font-display italic text-4xl lg:text-[28px] md:text-2xl mb-10">Crafting the Modern Silhouette</h2>

        <p className="text-textSecondary leading-[1.8] mb-6 md:text-[15px] sm:text-sm">
          Founded in 2020, MODERN MEN emerged from a simple realization:
          the modern gentleman deserves a wardrobe that speaks to his ambition
          without sacrificing comfort.
        </p>

        <p className="text-textSecondary leading-[1.8] mb-6 md:text-[15px] sm:text-sm">
          Our philosophy blends traditional craftsmanship with contemporary
          design, focusing on quality, comfort, and confidence.
        </p>

        <p className="text-textSecondary leading-[1.8] mb-6 md:text-[15px] sm:text-sm">
          Every piece is produced in limited runs to ensure premium quality
          and reduce environmental impact.
        </p>

        <div className="w-[96px] h-px bg-textPrimary opacity-20 mx-auto mt-10"></div>
      </section>

      {/* VALUES */}
      <section className="bg-secondary py-[120px] px-5 sm:py-20 sm:px-4">
        <div className="text-center mb-20 text-textPrimary">
          <h4 className="text-[12px] tracking-[0.4em] uppercase mb-2 font-bold opacity-70">Our Core Values</h4>
          <h3 className="font-primary text-[28px]">THE STANDARDS WE LIVE BY</h3>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8">
          <div className="bg-background p-12 md:p-8 rounded-[32px] text-center transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-textPrimary border border-textPrimary/5">
            <div className="w-16 h-16 sm:w-14 sm:h-14 bg-textPrimary text-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
            <h5 className="font-bold mb-2">Premium Quality</h5>
            <p className="text-textPrimary/60 text-sm">Only the finest materials sourced from heritage mills.</p>
          </div>

          <div className="bg-background p-12 md:p-8 rounded-[32px] text-center transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-textPrimary border border-textPrimary/5">
            <div className="w-16 h-16 sm:w-14 sm:h-14 bg-textPrimary text-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <h5 className="font-bold mb-2">Fast Shipping</h5>
            <p className="text-textPrimary/60 text-sm">Optimized global logistics for quick delivery.</p>
          </div>

          <div className="bg-background p-12 md:p-8 rounded-[32px] text-center transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-textPrimary border border-textPrimary/5">
            <div className="w-16 h-16 sm:w-14 sm:h-14 bg-textPrimary text-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h5 className="font-bold mb-2">24/7 Support</h5>
            <p className="text-textPrimary/60 text-sm">Concierge team always available for assistance.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-textPrimary text-center py-[120px] px-5 sm:py-20 sm:px-4">
        <h2 className="font-primary text-5xl md:text-4xl sm:text-[32px]">JOIN THE REVOLUTION</h2>
        <p className="text-accent my-6 mb-10 md:text-sm">Elegance is the only beauty that never fades.</p>
        <a href="#" className="inline-block bg-textPrimary text-primary py-4 px-12 md:py-3.5 md:px-9 rounded-full no-underline text-[11px] md:text-[10px] tracking-[0.3em] uppercase font-black transition-colors hover:bg-accent">Explore Collection</a>
      </section>

    </main>
  );
};

export default About;
