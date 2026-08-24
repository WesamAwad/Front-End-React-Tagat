import { Link } from "react-router-dom";
import { UserRound, Wrench } from "lucide-react";

const accountTypes = [
  {
    to: "/signup/client",
    label: "عميل",
    title: "أنشئ حساب كعميل",
    description: "للبحث عن ورش الصيانة، تشخيص أعطال الأجهزة بالذكاء الاصطناعي، وحجز مواعيد الإصلاح.",
    button: "متابعة كعميل",
    icon: UserRound,
  },
  {
    to: "/signup/workshop",
    label: "صاحب ورشة",
    title: "أنشئ حساب كصاحب ورشة",
    description: "لإدارة الورشة، استقبال طلبات العملاء وتنظيم عمليات الصيانة.",
    button: "متابعة كصاحب ورشة",
    icon: Wrench,
  },
];

function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">أنشئ حسابك</h1>
        <p className="mt-3 text-base text-primary/50">اختر نوع الحساب للمتابعة</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {accountTypes.map((type) => {
            const Icon = type.icon;

            return (
              <article key={type.to} className="flex flex-col items-center rounded-2xl border border-primary/10 bg-white p-6 text-center shadow-sm transition-colors hover:border-secondary md:items-start md:text-start">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-secondary bg-secondary/15">
                  <Icon className="size-6 text-secondary" strokeWidth={1.75} />
                </div>

                <p className="text-sm text-primary/50">{type.label}</p>
                <h2 className="mt-1 text-lg font-bold text-primary">{type.title}</h2>
                <p className="mt-3 grow text-sm leading-relaxed text-primary/60">{type.description}</p>

                <Link to={type.to} className="mt-6 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-hover">
                  {type.button}
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-primary/70">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-semibold text-secondary hover:text-secondary-hover">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
