import { Fragment } from "react";
import { ChevronDown, Search } from "lucide-react";
import heroBg from "../../assets/Container.webp";

const stats = [
  { value: "+4.8", label: "تقييم ممتاز" },
  { value: "+5,000", label: "تسجيل" },
  { value: "+12,000", label: "إصلاح متكامل" },
  { value: "+500", label: "ورشة موثقة" },
];

export function HeroSection() {
  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl">
        <img src={heroBg} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12">
          <h1 className="text-start text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            أصلح جهازك مع <span className="text-secondary">أفضل</span> <span>الورش</span>
          </h1>
          <p className="mt-4 max-w-2xl text-start text-sm leading-relaxed text-white/70 sm:text-base"> سويفت فيكس يربطك بأفضل ورش إصلاح الأجهزة الإلكترونية الموثقة. أسرع، أرخص، وأكثر أماناً.</p>

          <div className="mx-auto mt-8 w-[90%] overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="flex items-center">
              <div className="relative flex-1">
                <input type="text" placeholder="ابحث عن ورشة أو نوع الجهاز..." className="w-full py-4 pr-4 pl-11 text-sm text-primary outline-none placeholder:text-primary/40" />
                <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
              </div>
              <div className="flex items-center gap-1 border-r border-primary/10 px-3">
                <button type="button" className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-primary/70 transition hover:bg-primary-light hover:text-primary">
                  بحث
                </button>
                <button type="button" className="hidden cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-primary/70 transition hover:bg-primary-light hover:text-primary sm:block">
                  الرياض
                </button>
                <button type="button" className="cursor-pointer rounded-lg p-1.5 text-primary/40 transition hover:bg-primary-light hover:text-primary" aria-label="المزيد">
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-y-6 px-6 pt-5 pb-13 sm:flex sm:items-center sm:justify-between sm:px-16">
            {stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 && <div className="hidden h-10 w-px bg-white/50 sm:block" />}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">{stat.label}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
