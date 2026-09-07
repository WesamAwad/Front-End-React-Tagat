import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import SuccessToast from "../../components/SuccessToast";
import heroBg from "../../assets/contact/hero.jpg";
import mapImg from "../../assets/contact/map.png";
import phoneIcon from "../../assets/contact/phone.svg";
import mailIcon from "../../assets/contact/mail.svg";
import mapPinIcon from "../../assets/contact/map-pin.svg";
import clockIcon from "../../assets/contact/clock.svg";

const SUBJECT_OPTIONS = ["استفسار عام", "شكوى", "اقتراح", "دعم فني", "شراكة"];

const CONTACT_INFO = [
  {
    id: "phone",
    label: "اتصل بنا",
    value: "9200 12345 (الرقم الموحد)",
    icon: phoneIcon,
    href: "tel:920012345",
  },
  {
    id: "email",
    label: "البريد الإلكتروني",
    value: "support@swiftfix.sa",
    icon: mailIcon,
    href: "mailto:support@swiftfix.sa",
  },
  {
    id: "location",
    label: "الموقع الرئيسي",
    value: "طريق الملك فهد، حي الصحافة، الرياض",
    icon: mapPinIcon,
  },
  {
    id: "hours",
    label: "ساعات العمل",
    value: "طوال أيام الأسبوع من 8 ص إلى 10 م",
    icon: clockIcon,
  },
] as const;

const FAQS = [
  {
    id: "parts",
    question: "كيف تضمنون جودة قطع الغيار المستخدمة؟",
    answer: "نتعامل فقط مع ورش تستخدم قطع غيار أصلية أو درجة أولى معتمدة مع تقديم ضمان خطي للعميل يصل لـ 6 أشهر.",
  },
  {
    id: "cities",
    question: "ما هي المدن المتاح بها الخدمة حالياً؟",
    answer: "الخدمة متوفرة حالياً بالكامل في الرياض، جدة، الدمام، والخبر وقريباً في باقي مناطق المملكة.",
  },
  {
    id: "pickup",
    question: "هل يتوفر خيار استلام وتسليم الجهاز من المنزل؟",
    answer: "نعم بالتأكيد، يمكنك اختيار خدمة 'الاستلام من الباب' وسيتكفل مندوبنا باستلام جهازك وإعادته لك بعد الإصلاح.",
  },
];

function ContactPage() {
  const fullNameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);
  const [successOpen, setSuccessOpen] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccessOpen(true);
    setFullName("");
    setEmail("");
    setSubject(SUBJECT_OPTIONS[0]);
    setMessage("");
  }

  function toggleFaq(id: string) {
    setOpenFaqId((current) => (current === id ? null : id));
  }

  return (
    <div className="pb-16">
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-xs text-[#999]">
          <li>
            <Link to="/" className="transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-secondary" aria-current="page">
            تواصل معنا
          </li>
        </ol>
      </nav>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl">
          <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="relative px-4 py-14 text-center sm:px-6 sm:py-16">
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-[32px]">تواصل معنا</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:text-base">فريق الدعم الفني وخدمة العملاء في سويفت فيكس جاهز للإجابة على جميع استفساراتكم على مدار الساعة.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e5e7eb] bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0a0a0a]">أرسل لنا رسالة مباشرة</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor={fullNameId} className="mb-2 block text-sm text-[#0a0a0a] sm:text-base">
                  الاسم كامل
                </label>
                <input
                  id={fullNameId}
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="الاسم كامل"
                  className="w-full rounded border border-[#e5e5e5] px-3 py-3 text-sm text-primary outline-none transition placeholder:text-[#a3a3a3] focus:border-secondary"
                />
              </div>

              <div>
                <label htmlFor={emailId} className="mb-2 block text-sm text-[#0a0a0a] sm:text-base">
                  البريد الالكتروني
                </label>
                <input
                  id={emailId}
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="البريد الالكتروني"
                  className="w-full rounded border border-[#e5e5e5] px-3 py-3 text-sm text-primary outline-none transition placeholder:text-[#a3a3a3] focus:border-secondary"
                />
              </div>

              <div>
                <label htmlFor={subjectId} className="mb-2 block text-sm text-[#0a0a0a] sm:text-base">
                  الموضوع
                </label>
                <div className="relative">
                  <select
                    id={subjectId}
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full appearance-none rounded border border-[#e5e5e5] px-3 py-3 pe-10 text-sm text-primary outline-none transition focus:border-secondary"
                  >
                    {SUBJECT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-[#999]" aria-hidden="true" />
                </div>
              </div>

              <div>
                <label htmlFor={messageId} className="mb-2 block text-sm text-[#0a0a0a] sm:text-base">
                  الموضوع
                </label>
                <textarea
                  id={messageId}
                  required
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="كيف يمكننا مساعدتك اليوم؟"
                  className="w-full resize-y rounded border border-[#e5e5e5] px-3 py-3 text-sm text-primary outline-none transition placeholder:text-[#a3a3a3] focus:border-secondary"
                />
              </div>
            </div>

            <button type="submit" className="mt-6 w-full rounded bg-primary px-6 py-3 text-xs font-bold text-white transition hover:bg-primary-hover sm:text-sm">
              إرسال الرسالة
            </button>
          </form>

          <aside className="flex flex-col gap-4">
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => {
                const content = (
                  <>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fff4eb]">
                      <img src={item.icon} alt="" className="size-5 object-contain" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="text-sm text-[#666]">{item.label}</p>
                      <p className="mt-1 text-sm font-medium text-primary">{item.value}</p>
                    </div>
                  </>
                );

                const className = "flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 transition hover:border-secondary/40";

                if ("href" in item && item.href) {
                  return (
                    <a key={item.id} href={item.href} className={className}>
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={item.id} className={className}>
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e5e7eb]">
              <img src={mapImg} alt="خريطة مواقع سويفت فيكس في الرياض" className="h-68.5 w-full object-cover" />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-primary">الأسئلة الشائعة</h2>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-4">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <div key={faq.id} className="rounded-xl border border-[#e5e7eb] bg-white">
                <button type="button" aria-expanded={isOpen} onClick={() => toggleFaq(faq.id)} className="flex w-full items-center justify-between gap-3 p-5 text-start">
                  <span className="text-sm font-medium text-primary sm:text-base">{faq.question}</span>
                  <ChevronDown className={`size-4 shrink-0 text-[#777] transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {isOpen ? <p className="border-t border-[#f0f0f0] px-5 py-4 text-sm leading-relaxed text-[#666]">{faq.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <SuccessToast open={successOpen} title="تم الإرسال بنجاح" message="شكراً لتواصلك معنا، سنرد عليك في أقرب وقت." onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

export default ContactPage;
