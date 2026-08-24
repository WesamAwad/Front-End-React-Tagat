import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import joinImg from "../../assets/join-workshop.webp";

const features = ["لوحة تحكم شاملة لإدارة الطلبات", "مدفوعات مضمونة ومحمية", "ظهور أمام آلاف العملاء", "تقارير وتحليلات متقدمة"];

export function JoinWorkshopSection() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl">
        <div className="flex flex-col items-stretch lg:flex-row">
          {/* المحتوى - يمين بـ RTL */}
          <div className="flex w-full flex-col justify-center bg-primary p-8 sm:p-12 lg:w-1/2 lg:p-16">
            <span className="inline-block w-fit rounded-full bg-secondary/20 px-4 py-1 text-xs font-semibold text-secondary">لأصحاب الورش</span>

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">انضم كورشة شريكة</h2>

            <p className="mt-4 text-sm leading-relaxed text-gray-300">سجّل ورشتك في سويفت فيكس وابدأ في استقبال طلبات الإصلاح من آلاف العملاء. إدارة سهلة، مدفوعات آمنة، ونمو مستمر.</p>

            <ul className="mt-6 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-gray-100">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => navigate("/signup/workshop")}
              className="mt-8 cursor-pointer rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary-hover"
            >
              سجّل ورشتك الآن
            </button>
          </div>

          {/* الصورة - يسار بـ RTL */}
          <div className="min-h-90 w-full lg:w-1/2">
            <img src={joinImg} alt="انضم كورشة شريكة" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
