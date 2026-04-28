
const products = [
  {
    title: "Raw Denim Tapered",
    subtitle: "Selvedge Finish",
    price: "$185.00",
    img1: "https://lh3.googleusercontent.com/aida-public/AB6AXuCodgCBHrDDAKZiy_yLimGjExrGQiJCfXcXJfLWHl4Irh2cLT4n4gReNV689yTVQ9fJoTCJ3FNsbYaLIoXVRCDhgsj1PHVZAKrFjiiDMdCMef22iG7YPZu2Uf3WODJGniW_m4dvs0W1kZ64Dyvz7jgfd9qnUqB5Oj4RR0f0XDXh7rOLdrPBYEA7CXnJtiW-DLsG7Wg5wfxK4vfCsIg_TUKqQ0DYZLbKLOoj7j1Vl3g3UYLHKNW8pfdOvv2kGOkuBURQfEoUJiRSifgs",
    img2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs9WQldQT9ZGJbWJ68InNhiV1oLDbI575rx8p-Z3rSJLJCka7bEeyAyw20NtNVH0YZ2EKc40JMwu2hPyFnE_PoY4LKC1fknLVHsNXS-kL2X8KuKRiReiHDJTUq2CRL9JTAQqLCy3Plh53TyYYObKjlHeuE90nCcFCim1r_EGrOq-LVd3DckR1gCo5E5VmJuPSWFa0we3DjNIifh58JepO45b3urTlhy7vRLzZAcXg611xlcC1d4U4rQCxLiIW8Zy1Yp6n82cKXC9hf"
  },
  {
    title: "Heavy Cotton Crew",
    subtitle: "Premium Slate",
    price: "$65.00",
    img1: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWF4PTb3zmAbIdIirT7eY4DhgJBx4vO67JP5MS7BECxSSi6K4MT8c07xzeZMyXfJqN_JDcEfrl_xAsyMch_WbfelTD_rsmGHePjYvJRa7OBFERkWq2x2y3l-7BIGk4_SiqtQW95PHHE2R6fps9DfuGJxSpWXziPY2tK1IuN0vii6KNC4VFe6f0V9SLJMfcD7jR65SF3uKMR7E51ixXtpOwYmAR09240s-tu3-BY5nTzPE6J2wrXJ49m8C8r_HRyQtqokNsg_guYzQ2",
    img2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG5grYfiRd6Pr_epZfGVr6vP75nCUx5d3faRYuRLP_QunjgzUMUK55QJ78B63LG652tX5dBllWrLbllu5OoN85VcJDOkNsZYN4LdLYSqEx1k72KEiAbED4MBtvfDPGcniFvoqSscotaKqk1BzYqdVndGwMnKqlUg8lJYgOmxqN5ZiWYvJC7w0Bmt6uK5feGSkZfkwwNluuieN3iIafv_r69BxlFC9JdNhKrkOOcdzohyl9CBdwUP4Cnou6qVDbCyzmjrm1UQJvlDIv"
  }
];

function AdminProducts() {
  return (
    <section className="px-0 sm:px-12 py-[90px] sm:py-0 text-white">
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-end border-l-4 border-accent pl-7 mb-6 sm:mb-[90px] gap-6 sm:gap-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.4em] text-accent">NEW ARRIVALS</span>
          <h2 className="font-oswald text-[64px] sm:text-[88px] leading-[0.9] mt-1.5">THE EDIT</h2>
        </div>
        <a href="#" className="text-[11px] font-black tracking-[0.3em] no-underline text-white border-b-2 border-white pb-1.5 transition-all duration-300 hover:text-accent hover:border-accent">EXPLORE ALL</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[18px]">
        {products.map((p, i) => (
          <div className="bg-black border border-white/5 overflow-hidden group" key={i}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img loading="lazy" src={p.img1} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease group-hover:opacity-0" />
              <img loading="lazy" src={p.img2} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease opacity-0 group-hover:opacity-100" />

              <button className="absolute left-0 right-0 bottom-0 h-14 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase border-none cursor-pointer opacity-0 translate-y-3 transition-all duration-[0.35s] ease group-hover:opacity-100 group-hover:translate-y-0 hover:!bg-accent">ADD TO BAG</button>
            </div>

            <div className="p-5 md:pt-[22px] md:px-5 md:pb-[26px]">
              <h4 className="text-[11px] font-black tracking-[0.25em] uppercase mb-1.5">{p.title}</h4>
              <p className="text-[10px] tracking-[0.15em] uppercase opacity-45 mb-3.5">{p.subtitle}</p>
              <strong className="font-oswald text-xl tracking-[0.05em]">{p.price}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminProducts;
