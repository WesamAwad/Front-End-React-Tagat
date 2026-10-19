import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroBg from "../../assets/contact/hero.jpg";
import teamImg from "../../assets/about/team.webp";
import navyShape from "../../assets/about/navy-shape.svg";
import curveOrangeLarge from "../../assets/about/curve-orange-large.svg";
import curveOrangeSmall from "../../assets/about/curve-orange-small.svg";
import curveGray from "../../assets/about/curve-gray.svg";
import chevronDownIcon from "../../assets/about/chevron-down.svg";
import { useGetPlatformStatisticsQuery } from "../auth/authApi";

function formatAboutStat(value: number | undefined, isLoading: boolean) {
  if (isLoading) return "…";
  if (value == null || !Number.isFinite(value)) return "0+";
  return `${Math.trunc(value).toLocaleString("en-US")}+`;
}

const VALUES = [
  { id: "transparency", icon: "⚖️", title: "الشفافية", description: "أسعار معلنة، تقييمات حقيقية، لا مفاجآت" },
  { id: "trust", icon: "🤝", title: "الثقة", description: "توثيق صارم لكل ورشة ومراقبة مستمرة للجودة" },
  { id: "innovation", icon: "💡", title: "الابتكار", description: "تقنية الذكاء الاصطناعي لتشخيص أسرع وأدق" },
];

// textWidth = عرض الوصف في التصميم حتى ينكسر السطر بنفس المكان على الديسكتوب
const VERIFICATION_STEPS = [
  { step: 1, title: "التحقق من الهوية", description: "سجل تجاري ساري وهوية المالك الحقيقية", textWidth: "lg:max-w-39" },
  { step: 2, title: "الزيارة الميدانية", description: "يزور فريقنا الورشة للتحقق من المعدات والبيئة", textWidth: "lg:max-w-35.75" },
  { step: 3, title: "اختبار الجودة", description: "إصلاح تجريبي تحت إشراف متخصصين تقنيين", textWidth: "lg:max-w-43.5" },
  { step: 4, title: "مراجعة السمعة", description: "فحص سجل الشكاوى والتقييمات السابقة", textWidth: "lg:max-w-40.25" },
  { step: 5, title: "المراقبة المستمرة", description: "مراجعة دورية وتنبيهات فورية عند تراجع التقييم", textWidth: "lg:max-w-40" },
];

const FAQS = [
  {
    id: "coverage",
    question: "أين تتوفر سويفت فيكس حالياً؟",
    answer: "الخدمة متاحة حالياً في فلسطين. يمكنك تصفح الورش المسجّلة حسب المدينة، ثم إرسال طلب إصلاح للورشة التي تناسبك.",
  },
  {
    id: "request",
    question: "كيف أرسل طلب إصلاح؟",
    answer: "من صفحة الورشة اضغط «إرسال طلب»، واكتب نوع الجهاز ووصف العطل. يصل الطلب إلى الورشة، وهي من تقبله وتتواصل معك. السعر الظاهر إرشادي وقد يتغير بعد فحص الجهاز.",
  },
  {
    id: "role",
    question: "هل تُصلح سويفت فيكس الجهاز بنفسها؟",
    answer: "لا. سويفت فيكس منصة تربطك بورشة الإصلاح. تنفيذ العمل وقطع الغيار والمدة والضمان يتم الاتفاق عليها مع الورشة مباشرة. شارة «موثّق» تعني أن الورشة اجتازت مراجعة المنصة.",
  },
];

function AboutPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);
  const { data: stats, isLoading: isStatsLoading } = useGetPlatformStatisticsQuery();

  const aboutStats = [
    {
      id: "workshops",
      value: formatAboutStat(stats?.verified_shops_count, isStatsLoading),
      label: "ورشة موثّقة",
      caption: "في 5 مدن رئيسية",
    },
    {
      id: "repairs",
      value: formatAboutStat(stats?.completed_requests_count, isStatsLoading),
      label: "إصلاح مكتمل",
      caption: "بنجاح ورضا العميل",
    },
  ];

  useEffect(() => {
    document.title = "من نحن | SwiftFix";
    return () => {
      document.title = "SwiftFix";
    };
  }, []);

  function toggleFaq(id: string) {
    setOpenFaqId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-xs leading-normal">
          <li>
            <Link to="/" className="text-[#888] transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#ccc]">
            /
          </li>
          <li className="text-[#444]" aria-current="page">
            من نحن
          </li>
        </ol>
      </nav>

      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-51.25 items-center justify-center overflow-hidden">
          <img src={heroBg} alt="" className="absolute top-[-96.81%] left-0 h-[204.47%] w-full max-w-none" />
          <div className="absolute inset-0 bg-[rgba(22,42,79,0.55)]" />
          <div className="relative flex flex-col items-center gap-3 px-6 py-12 text-center text-white">
            <h1 className="text-3xl font-bold leading-normal sm:text-4xl">من نحن</h1>
            <p className="text-base">فريق الدعم الفني وخدمة العملاء في سويفت فيكس جاهز للإجابة على جميع استفساراتكم على مدار الساعة.</p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-14 pb-16 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:px-8 lg:pt-26.25 lg:pb-21">
          {/* النص - يمين بـ RTL */}
          <div className="flex flex-col items-start gap-2 lg:mt-27.75 lg:max-w-136.75">
            <p className="text-xs leading-normal text-[#888]">من نحن</p>
            <h2 className="text-2xl font-bold leading-normal text-[#0a0a0a] sm:text-[32px]">
              منصة تربط العملاء <span className="text-[#f57f17]">بأفضل</span>
              <br />
              ورش الإصلاح
            </h2>
            <p className="max-w-122.25 text-base text-[#737373]">
              سويفت فيكس هي أول منصة سعودية متخصصة في ربط أصحاب الأجهزة الإلكترونية المعطوبة بورش إصلاح موثّقة ومحترفة — بشفافية كاملة في الأسعار وضمان على كل إصلاح.
            </p>
            <Link
              to="/workshops"
              className="rounded border-[0.8px] border-secondary bg-secondary px-5 py-2.5 text-[13px] font-semibold leading-[19.5px] text-white transition hover:border-secondary-hover hover:bg-secondary-hover"
            >
              اعثر على ورشة
            </Link>
          </div>

          {/* الصورة والإحصائيات - يسار بـ RTL */}
          <div className="relative mx-auto w-full max-w-105 lg:mx-0 lg:me-12.5 lg:shrink-0">
            {/* الأشكال الخلفية — مواقعها محسوبة من زاوية الصورة كما في التصميم */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
              <img src={curveOrangeLarge} alt="" className="absolute top-14.5 left-53 max-w-none" />
              <div className="absolute -top-5.75 -left-32.5">
                {/* امتداد الشكل لحافة الشاشة على الشاشات الأعرض من التصميم — نفس لون الـ SVG */}
                <div className="absolute inset-y-0 right-full w-screen bg-[#162a4f]" />
                <img src={navyShape} alt="" className="block max-w-none" />
              </div>
              <img src={curveGray} alt="" className="absolute -top-3.5 -left-118.5 max-w-none" />
              <img src={curveOrangeSmall} alt="" className="absolute top-3.5 -left-119.5 max-w-none" />
            </div>

            <div className="relative aspect-7/5 overflow-hidden rounded border-[0.8px] border-[#c8c8c8]">
              <img src={teamImg} alt="فريق عمل سويفت فيكس" className="absolute top-[-51.54%] left-0 h-[165.62%] w-full max-w-none" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3" aria-busy={isStatsLoading}>
              {aboutStats.map((stat) => (
                <div key={stat.id} className="flex flex-col gap-0.5 rounded border-[0.8px] border-secondary bg-[#fff2e9] p-4">
                  {/* ltr حتى تظهر "+" بعد الرقم كما في التصميم (500+) */}
                  <p dir="ltr" className="text-right text-2xl font-bold leading-normal text-secondary">
                    {stat.value}
                  </p>
                  <p className="text-base font-bold text-[#333]">{stat.label}</p>
                  <p className="text-[10px] leading-normal text-[#262626]">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff2e9] px-4 py-16 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="text-sm leading-normal text-secondary">رسالتنا</p>
          <h2 className="max-w-2xl text-2xl font-bold leading-normal text-[#0a0a0a] sm:text-[32px]">نجعل إصلاح الأجهزة الإلكترونية تجربة موثوقة وشفافة للجميع</h2>
          <p className="max-w-xl text-base text-[#404040]">نؤمن أن لكل عميل الحق في إصلاح عادل بسعر واضح وجودة مضمونة. ونؤمن أن لكل ورشة محترفة الحق في الوصول لعملاء يقدّرون احترافيتها.</p>

          <div className="grid w-full grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.id} className="flex flex-col items-center gap-3 rounded-xl bg-primary p-5">
                <span className="text-[28px] leading-10.5" aria-hidden="true">
                  {value.icon}
                </span>
                <h3 className="text-base font-bold text-white">{value.title}</h3>
                <p className="text-sm leading-normal text-[#f5f5f5]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-22.5 pb-18.5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm leading-normal text-secondary">الثقة والتوثيق</p>
          <h2 className="max-w-2xl text-2xl font-bold leading-normal text-[#0a0a0a] sm:text-[32px]">كل ورشة موثّقة — دائماً</h2>
          <p className="max-w-xl text-base text-[#404040]">لا تظهر أي ورشة في منصتنا قبل اجتياز عملية توثيق صارمة متعددة المراحل</p>
        </div>

        <ol className="mt-12.75 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {VERIFICATION_STEPS.map((item) => (
            <li key={item.step} className="flex flex-col gap-2 rounded border-[0.8px] border-[#e5e5e5] bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold leading-normal text-white">{item.step}</span>
                <h3 className="text-xs font-bold leading-normal text-[#0a0a0a]">{item.title}</h3>
              </div>
              <p className={`text-sm leading-normal text-[#525252] ${item.textWidth}`}>{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 pt-16 pb-30 sm:px-16">
        <h2 className="text-center text-2xl font-bold leading-normal text-primary">الأسئلة الشائعة</h2>

        <div className="mx-auto mt-10 flex max-w-190 flex-col gap-4">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            const answerId = `about-faq-${faq.id}`;

            return (
              <div key={faq.id} className="rounded-xl border border-[#e5e7eb] bg-white">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleFaq(faq.id)}
                  className={`flex w-full items-center justify-between gap-3 px-5 pt-5 text-start ${isOpen ? "pb-3" : "pb-5"}`}
                >
                  <span className={`text-sm leading-normal text-[#0a0a0a] ${isOpen ? "font-bold" : "font-medium"}`}>{faq.question}</span>
                  {/* اتجاه السهم كما في التصميم: لأسفل للمفتوح ولأعلى للمغلق */}
                  <img src={chevronDownIcon} alt="" aria-hidden="true" className={`shrink-0 transition-transform ${isOpen ? "" : "-scale-y-100"}`} />
                </button>
                <p id={answerId} hidden={!isOpen} className="px-5 pb-5 text-sm leading-normal text-[#0a0a0a]">
                  {faq.answer}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
