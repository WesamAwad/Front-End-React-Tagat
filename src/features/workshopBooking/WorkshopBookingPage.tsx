import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Check, ChevronDown, CloudUpload, X } from "lucide-react";
import heroBg from "../../assets/workshops-hero-bg.webp";
import phoneImg from "../../assets/categories/phone.svg";
import laptopImg from "../../assets/categories/laptop.svg";
import tvImg from "../../assets/categories/tv.svg";
import printerImg from "../../assets/categories/printer.svg";
import gamesImg from "../../assets/categories/games.svg";
import homeImg from "../../assets/categories/home.svg";

type BookingStep = 1 | 2 | 3;

type DeviceCategory = {
  id: string;
  label: string;
  image: string;
};

type UploadedFile = {
  id: string;
  name: string;
  preview: string;
};

const STEPS = [
  { id: 1 as const, label: "نوع الجهاز" },
  { id: 2 as const, label: "وصف المشكلة" },
  { id: 3 as const, label: "المراجعة" },
];

const DEVICE_CATEGORIES: DeviceCategory[] = [
  { id: "phones", label: "هواتف ذكية", image: phoneImg },
  { id: "laptops", label: "لابتوب وكمبيوتر", image: laptopImg },
  { id: "tvs", label: "تلفزيونات", image: tvImg },
  { id: "printers", label: "طابعات وسكانر", image: printerImg },
  { id: "games", label: "ألعاب إلكترونية", image: gamesImg },
  { id: "home", label: "أجهزة منزلية", image: homeImg },
];

const SERVICE_OPTIONS = ["استبدال شاشة", "استبدال بطارية", "إصلاح منفذ الشحن", "صيانة عامة", "تشخيص عطل"];

const PROBLEM_TYPES = ["شاشة مكسورة", "لا يشحن", "بطء في الأداء", "مشكلة صوت", "مشكلة شبكة", "أخرى"];

const INITIAL_UPLOADS: UploadedFile[] = [
  {
    id: "file-1",
    name: "screen_damage_1.jpg",
    preview: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
  },
  {
    id: "file-2",
    name: "back_case.jpg",
    preview: "https://images.unsplash.com/photo-1592890288564-766bd6c72716?w=200&h=200&fit=crop",
  },
];

const CONTACT_DEFAULTS = {
  name: "محمد الأحمدي",
  phone: "+966 5X XXX XXXX",
  city: "الرياض - حي العليا",
};

const SUCCESS_WORKSHOP_NAME = "ورشة التقنية المتقدمة";

function WorkshopBookingPage() {
  const navigate = useNavigate();
  const brandModelId = useId();
  const serviceId = useId();
  const problemTypeId = useId();
  const descriptionId = useId();
  const termsId = useId();
  const uploadId = useId();
  const successTitleId = useId();
  const successDescId = useId();

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState("tvs");
  const [brandModel, setBrandModel] = useState("");
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");
  const [uploads, setUploads] = useState<UploadedFile[]>(INITIAL_UPLOADS);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const selectedDevice = DEVICE_CATEGORIES.find((item) => item.id === selectedDeviceId);

  useEffect(() => {
    if (!showSuccessModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        navigate("/workshops");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSuccessModal, navigate]);

  function goNext() {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  }

  function goPrev() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextFiles = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      preview: URL.createObjectURL(file),
    }));

    setUploads((prev) => [...prev, ...nextFiles]);
    event.target.value = "";
  }

  function removeUpload(id: string) {
    setUploads((prev) => prev.filter((file) => file.id !== id));
  }

  function handleConfirm(event: FormEvent) {
    event.preventDefault();
    if (!acceptedTerms) return;
    setShowSuccessModal(true);
  }

  function handleContinue() {
    setShowSuccessModal(false);
    navigate("/workshops");
  }

  const reviewDeviceValue = `${selectedDevice?.label ?? "—"} - ${brandModel.trim() || "آيفون 14 برو"}`;
  const successDeviceValue = `${selectedDevice?.label ?? "—"} · ${brandModel.trim() || "آيفون 15 برو"}`;

  const reviewRows = [
    {
      label: "الجهاز",
      value: reviewDeviceValue,
    },
    {
      label: "المشكلة",
      value: problemType || "شاشة مكسورة",
    },
    {
      label: "الوصف",
      value: description.trim() || "الشاشة تحطمت بعد السقوط وأجزاء الزجاج ظاهرة",
    },
    { label: "الاسم", value: CONTACT_DEFAULTS.name },
    { label: "رقم الجوال", value: CONTACT_DEFAULTS.phone },
    { label: "المدينة", value: CONTACT_DEFAULTS.city },
  ];

  const successRows = [
    { label: "الورشة", value: SUCCESS_WORKSHOP_NAME },
    { label: "الجهاز", value: successDeviceValue },
    { label: "الخدمة", value: service || SERVICE_OPTIONS[0] },
  ];

  return (
    <div className="pb-12">
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-xs text-[#999]">
          <li>
            <Link to="/" className="transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/workshops" className="transition hover:text-primary">
              الورشات
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-secondary" aria-current="page">
            حجز موعد
          </li>
        </ol>
      </nav>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl">
          <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="relative px-4 py-14 text-center sm:px-6 sm:py-16">
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-[32px]">
              احجز <span className="text-secondary">موعد</span> مع ورشة
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">قارن الأسعار والتقييمات، واحجز موعدك فوراً مع ورشات موثوقة وضمان معتمد.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ol className="relative flex w-full items-start justify-between" aria-label="خطوات الحجز">
          <span className="absolute top-4 inset-x-4 h-0.5 bg-[#e8e8e8] sm:inset-x-8" aria-hidden="true" />
          <span className="absolute top-4 inset-s-4 h-0.5 bg-secondary transition-all sm:inset-s-8" style={{ width: step < 3 ? "50%" : "calc(100% - 4rem)" }} aria-hidden="true" />
          {STEPS.map((item) => {
            const isDone = step > item.id;
            const isActive = step === item.id;

            return (
              <li key={item.id} className="relative z-10 flex flex-col items-center">
                <span className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${isDone || isActive ? "bg-secondary text-white" : "bg-[#f3f3f3] text-[#aaa]"}`}>
                  {isDone ? <Check className="size-4" aria-hidden="true" /> : item.id}
                </span>
                <span className={`mt-2 text-center text-xs sm:text-sm ${isActive || isDone ? "font-medium text-primary" : "text-[#aaa]"}`}>{item.label}</span>
              </li>
            );
          })}
        </ol>

        <section className="mt-8 rounded-xl border border-[#f0f0f0] bg-white p-4 shadow-sm sm:p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0a0a0a]">اختر نوع الجهاز</h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="نوع الجهاز">
                {DEVICE_CATEGORIES.map((category) => {
                  const selected = selectedDeviceId === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSelectedDeviceId(category.id)}
                      className="flex flex-col items-center gap-3 rounded-lg bg-[#fff8f2] px-3 py-5 transition hover:ring-1 hover:ring-secondary/40"
                    >
                      <img src={category.image} alt="" className="size-10 object-contain" aria-hidden="true" />
                      <span className="text-center text-xs font-medium text-primary sm:text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label htmlFor={brandModelId} className="mb-2 block text-sm font-medium text-[#333]">
                  الماركة والموديل
                </label>
                <input
                  id={brandModelId}
                  type="text"
                  value={brandModel}
                  onChange={(event) => setBrandModel(event.target.value)}
                  placeholder="مثال: آيفون 14 برو"
                  className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-secondary"
                />
              </div>

              <div>
                <label htmlFor={serviceId} className="mb-2 block text-sm font-medium text-[#333]">
                  الخدمة المطلوبة
                </label>
                <div className="relative">
                  <select
                    id={serviceId}
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 pe-10 text-sm text-primary outline-none transition focus:border-secondary"
                  >
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-[#999]" aria-hidden="true" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={goNext} className="min-w-50 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover">
                  التالي
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0a0a0a]">صف المشكلة</h2>

              <div>
                <label htmlFor={problemTypeId} className="mb-2 block text-sm font-medium text-[#333]">
                  نوع المشكلة
                </label>
                <div className="relative">
                  <select
                    id={problemTypeId}
                    value={problemType}
                    onChange={(event) => setProblemType(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 pe-10 text-sm text-primary outline-none transition focus:border-secondary"
                  >
                    <option value="">اختر نوع المشكلة</option>
                    {PROBLEM_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-[#999]" aria-hidden="true" />
                </div>
              </div>

              <div>
                <label htmlFor={descriptionId} className="mb-2 block text-sm font-medium text-[#333]">
                  وصف تفصيلي
                </label>
                <textarea
                  id={descriptionId}
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="وصف للمشكلة"
                  className="w-full resize-y rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-secondary"
                />
              </div>

              <div>
                <label htmlFor={uploadId} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-secondary/50 bg-[#fffaf6] px-4 py-10 text-center transition hover:bg-[#fff4eb]">
                  <CloudUpload className="size-10 text-secondary" aria-hidden="true" />
                  <span className="mt-3 text-sm font-medium text-primary">اسحب الصور أو الفيديو هنا</span>
                  <span className="mt-1 text-xs text-[#999]">أقصى حجم للملف: ٢٠ ميغابايت (صيغ مدعومة: JPG, PNG, MP4)</span>
                </label>
                <input id={uploadId} type="file" accept="image/*,video/mp4" multiple className="sr-only" onChange={handleUploadChange} />
              </div>

              {uploads.length > 0 ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-[#666]">الملفات المرفوعة حالياً</p>
                  <ul className="flex flex-wrap gap-3">
                    {uploads.map((file) => (
                      <li key={file.id} className="relative w-24">
                        <img src={file.preview} alt="" className="aspect-square w-full rounded-md object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUpload(file.id)}
                          className="absolute inset-s-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
                          aria-label={`حذف ${file.name}`}
                        >
                          <X className="size-3" aria-hidden="true" />
                        </button>
                        <p className="mt-1 truncate text-[11px] text-[#777]">{file.name}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button type="button" onClick={goPrev} className="min-w-50 rounded-lg bg-[#f3f3f3] px-8 py-2.5 text-sm font-semibold text-primary transition hover:bg-[#ebebeb]">
                  السابق
                </button>
                <button type="button" onClick={goNext} className="min-w-50 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover">
                  التالي
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <form className="space-y-6" onSubmit={handleConfirm}>
              <h2 className="text-xl font-bold text-[#0a0a0a]">مراجعة الطلب</h2>

              <dl className="divide-y divide-[#f0f0f0] overflow-hidden rounded-lg border border-[#f0f0f0]">
                {reviewRows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-sm font-medium text-[#666]">{row.label}</dt>
                    <dd className="text-sm text-primary sm:text-start">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <label htmlFor={termsId} className="flex cursor-pointer items-start gap-3 rounded-lg bg-[#fff4eb] px-4 py-3 text-sm text-primary">
                <input id={termsId} type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-0.5 size-4 accent-secondary" />
                <span>أوافق على شروط الخدمة وسياسة الخصوصية</span>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button type="button" onClick={goPrev} className="min-w-50 rounded-lg bg-[#f3f3f3] px-8 py-2.5 text-sm font-semibold text-primary transition hover:bg-[#ebebeb]">
                  السابق
                </button>
                <button type="submit" disabled={!acceptedTerms} className="min-w-50 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
                  تأكيد الطلب
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </div>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
          <button type="button" aria-label="إغلاق نافذة النجاح" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={handleContinue} />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={successTitleId}
            aria-describedby={successDescId}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Check className="size-8" strokeWidth={3} aria-hidden="true" />
              </div>
              <h2 id={successTitleId} className="mt-4 text-lg font-bold text-[#0a0a0a]">
                تم إرسال طلب الحجز بنجاح
              </h2>
              <p id={successDescId} className="mt-2 text-sm text-[#777]">
                تم إرسال طلبك إلى الورشة، وبانتظار تأكيدها للموعد.
              </p>
            </div>

            <hr className="my-5 border-[#eee]" />

            <dl className="space-y-3">
              {successRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="shrink-0 text-[#888]">{row.label}</dt>
                  <dd className="text-end font-medium text-primary">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#fff4eb] px-3 py-3 text-sm text-primary">
              <Bell className="size-4 shrink-0 text-secondary" aria-hidden="true" />
              <p>سنرسل لك إشعاراً عند قبول أو رفض الطلب.</p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              متابعة
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default WorkshopBookingPage;
