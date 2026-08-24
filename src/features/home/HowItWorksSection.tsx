import { Fragment } from "react";
import { UserPlus, Search, FileText, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  {
    number: "01",
    title: "إنشاء الحساب",
    description: "أنشئ حسابك كعميل وسجّل بياناتك.   .",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "ابحث عن ورشة",
    description: "حدد جهازك ومشكلتك وموقعك واختر الورشة الأنسب.",
    icon: Search,
  },
  {
    number: "03",
    title: "اختر واحجز",
    description: "اختر الموعد المناسب وأرسل طلبك للورشة وانتظر تأكيدها.",
    icon: FileText,
  },
  {
    number: "04",
    title: "تتبع الإصلاح",
    description: "تابع حالة إصلاح جهازك في الوقت الفعلي.",
    icon: Activity,
  },
];

function CurvedArrow() {
  return (
    <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="text-secondary/40">
      <path d="M75 5 C60 5, 55 35, 40 35 S20 5, 5 5" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      <path d="M10 1 L4 5 L10 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* العنوان */}
      <div className="mb-14 text-center">
        <p className="text-sm font-medium text-gray-400">العملية</p>
        <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">كيف يعمل سويفت فيكس؟</h2>
      </div>

      {/* الخطوات */}
      <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-7 lg:gap-0">
        {steps.map((step, index) => (
          <Fragment key={step.number}>
            {/* الخطوة */}
            <div className="flex flex-col items-center text-center">
              {/* الأيقونة مع الرقم */}
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-100 bg-gray-50 shadow-sm">
                  <step.icon className="h-6 w-6 text-secondary" />
                </div>
                <span className="absolute -bottom-1 -inset-s-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">{step.number}</span>
              </div>

              {/* العنوان */}
              <h3 className="mt-3 text-sm font-bold text-primary sm:text-base">{step.title}</h3>

              {/* الوصف */}
              <p className="mt-2 max-w-50 text-xs leading-relaxed text-gray-500 sm:text-sm">{step.description}</p>
            </div>

            {/* السهم المنحني بين الخطوات */}
            {index < steps.length - 1 && (
              <div className="hidden items-center justify-center lg:flex">
                <CurvedArrow />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
