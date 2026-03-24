import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCategories } from "../../api/categories.api";

export default function CategoryHero() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetchCategories().then((cats) => {
      if (!cats) return;
      // Normalize slugs to handle case and special character differences (e.g. t-shirts vs tshirts)
      const normalize = (s) => s?.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matched = cats.find(c => normalize(c.slug) === normalize(slug));
      setCategory(matched);
    });
  }, [slug]);

  if (!category) return null;

  return (
    <section className="relative h-[30vh] lg:h-[40vh] w-full overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        {/* Cinematic Overlay from HTML */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/80"></div>
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <span className="text-accent text-[9px] lg:text-[11px] font-black tracking-[0.4em] lg:tracking-[0.6em] uppercase mb-2 lg:mb-4 block opacity-80">
          Collection 04
        </span>
        <h1 className="text-text-primary text-5xl md:text-8xl lg:text-9xl font-[Oswald] leading-none tracking-tighter uppercase">
          {category.name}
        </h1>
      </div>
    </section>
  );
}