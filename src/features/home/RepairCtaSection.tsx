import ctaBgImg from "../../assets/cta-section-bg.webp";

export function RepairCtaSection() {

  return (
    <section className="w-full">
      <div className="relative min-h-78.25 overflow-hidden">
        <img src={ctaBgImg} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[rgba(22,42,79,0.52)]" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold leading-normal text-white sm:text-4xl">جاهز لإصلاح جهازك؟</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/90">أرسل طلبك الآن واستقبل عروضاً من أفضل الورش خلال ساعات. يمكنك إضافة رقم هاتفك لتواصل أسرع.</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="cursor-pointer rounded-md bg-secondary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-secondary-hover">
              أرسل طلب إصلاح
            </button>
            <button type="button" className="cursor-pointer rounded-md bg-white px-6 py-2.5 text-sm font-bold text-secondary transition hover:bg-gray-100">
              اعرف أكثر
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
