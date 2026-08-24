import { ChevronDown, MapPin, Search } from "lucide-react";
import heroBg from "../../assets/workshops-hero-bg.webp";

export function WorkshopsHeroSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto min-h-75 max-w-7xl overflow-hidden rounded-xl sm:min-h-85">
        <img src={heroBg} alt="" className="absolute inset-x-0 top-4 h-[calc(100%+2rem)] w-full object-cover object-[center_62%] sm:top-6 sm:h-[calc(100%+3rem)]" />
        <div className="absolute inset-0 bg-primary/52" />

        <div className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <div className="text-start">
              <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-[32px]">
                ابحث عن أفضل <span className="text-secondary">ورشة</span> صيانة لأجهزتك
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">قارن الأسعار والتقييمات، واحجز موعدك فوراً مع ورشات موثوقة وضمان معتمد.</p>
            </div>

            <div className="w-full rounded-xl bg-white p-3 shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 sm:border-e sm:border-gray-200 sm:pe-4">
                  <Search className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
                  <input type="search" placeholder="ما الذي تريد إصلاحه؟ (مثلاً: شاشة آيفون 13)" className="w-full text-sm text-primary outline-none placeholder:text-gray-400" />
                </div>

                <div className="hidden h-10 w-px shrink-0 bg-gray-200 sm:block" />

                <button type="button" className="flex flex-1 items-center gap-2 rounded-lg px-1 py-1 text-start transition hover:bg-gray-50 sm:px-0">
                  <MapPin className="size-4 shrink-0 text-secondary" aria-hidden="true" />
                  <span className="flex-1 text-sm text-gray-700">الرياض، المملكة العربية السعودية</span>
                  <ChevronDown className="size-3 shrink-0 text-gray-400" aria-hidden="true" />
                </button>

                <button type="button" className="shrink-0 rounded-lg bg-secondary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary-hover">
                  ابحث الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
