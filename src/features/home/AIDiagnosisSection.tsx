import aiRobotImg from "../../assets/ai-robot.webp";

export function AIDiagnosisSection() {
  return (
    <section className="mx-auto ">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
        {/* المحتوى - يمين بـ RTL */}
        <div className="w-full lg:w-1/2 max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400">تشخيص ذكي</p>

          <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
            افحص مشكلتك <span className="text-secondary">بالذكاء</span> الاصطناعي
          </h2>

          <p className="mt-4 text-base leading-relaxed text-gray-500">صف مشكلتك او ارفع صورة لجهازك ودع الذكاء الاصطناعي يحدد السبب ويقترح الحلول المناسبه في زيارة الورشة</p>

          <button type="button" className="mt-8 cursor-pointer rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary-hover">
            افحص المشكلة الان
          </button>
        </div>

        {/* الصورة مع الشكل الخلفي */}
        <div className="relative w-full lg:w-1/2">
          <div className="ai-shape absolute left-0 inset-y-0 h-[99%] w-[60%] rounded-r-sm bg-primary" style={{ clipPath: "polygon(0 0, 0% 0, 220% 100%, 0% 100%)" }} aria-hidden="true" />
          <img src={aiRobotImg} alt="تشخيص الذكاء الاصطناعي" className="relative mx-auto w-full max-w-md object-contain" />
        </div>
      </div>
    </section>
  );
}
