function HomeWorkshopPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary">مرحباً بك في لوحة الورشة</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          من هنا تقدر تدير طلبات العملاء، قطع الغيار، وإعدادات حسابك. حالياً اللوحة جاهزة
          للبناء — الخطوة الجاية نربطها بالـ API ونضيف الشاشات الفعلية.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "طلبات جديدة", value: "0", hint: "بانتظار الربط بالـ API" },
          { title: "طلبات قيد التنفيذ", value: "0", hint: "بانتظار الربط بالـ API" },
          { title: "تقييم الورشة", value: "—", hint: "سيظهر بعد تفعيل الحساب" },
        ].map((card) => (
          <article key={card.title} className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
            <p className="mt-2 text-xs text-gray-400">{card.hint}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default HomeWorkshopPage;
