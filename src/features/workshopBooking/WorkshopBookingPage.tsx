import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Check, CloudUpload, X } from "lucide-react";
import heroBg from "../../assets/workshops-hero-bg.webp";
import { SearchableSelect } from "../../components/SearchableSelect";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import { useGetAllServicesQuery, useGetDeviceModelsAllQuery, useStoreRepairRequestMutation } from "../auth/authApi";

type BookingStep = 1 | 2 | 3;

const STEPS = [
  { id: 1 as const, label: "بيانات الجهاز" },
  { id: 2 as const, label: "وصف المشكلة" },
  { id: 3 as const, label: "المراجعة" },
];

const EMPTY_DEVICE_MODELS: never[] = [];
const EMPTY_SERVICES: never[] = [];

function WorkshopBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandModelId = useId();
  const serviceId = useId();
  const addressId = useId();
  const descriptionId = useId();
  const uploadId = useId();
  const successTitleId = useId();
  const successDescId = useId();

  const shopId = searchParams.get("shop_id") ?? "";
  const shopName = searchParams.get("shop_name") ?? "";

  const [step, setStep] = useState<BookingStep>(1);
  const [deviceModelId, setDeviceModelId] = useState("");
  const [serviceIdValue, setServiceIdValue] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: deviceModelsData, isLoading: isDeviceModelsLoading, isFetching: isDeviceModelsFetching, isError: isDeviceModelsError } = useGetDeviceModelsAllQuery();
  const { data: servicesData, isLoading: isServicesLoading, isFetching: isServicesFetching, isError: isServicesError } = useGetAllServicesQuery();
  const [storeRepairRequest, { isLoading: isSubmitting }] = useStoreRepairRequestMutation();

  const deviceModels = deviceModelsData?.data ?? EMPTY_DEVICE_MODELS;
  const services = servicesData?.data ?? EMPTY_SERVICES;

  const deviceModelOptions = deviceModels.map((model) => ({
    value: String(model.id),
    label: [model.brand_name, model.name].filter(Boolean).join(" - "),
  }));
  const serviceOptions = services.map((item) => ({ value: String(item.id), label: item.name }));

  const selectedDeviceLabel = deviceModelOptions.find((option) => option.value === deviceModelId)?.label ?? "";
  const selectedServiceLabel = serviceOptions.find((option) => option.value === serviceIdValue)?.label ?? "";
  const canGoNextFromStepOne = deviceModelId !== "" && serviceIdValue !== "" && address.trim() !== "";
  const canGoNextFromStepTwo = description.trim() !== "";

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
    if (step === 1) {
      if (!canGoNextFromStepOne) return;
      setStep(2);
    } else if (step === 2) {
      if (!canGoNextFromStepTwo) return;
      setStep(3);
    }
  }

  function goPrev() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return { file, preview: URL.createObjectURL(file) };
    });
  }

  function removeImage() {
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");

    const formData = new FormData();
    formData.append("shop_id", shopId);
    formData.append("device_model_id", deviceModelId);
    formData.append("service_id", serviceIdValue);
    formData.append("description", description.trim());
    formData.append("address", address.trim());
    if (image) formData.append("image", image.file);

    try {
      await storeRepairRequest(formData).unwrap();
      setShowSuccessModal(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setSubmitError(errorData?.message || "تعذر إرسال طلب الحجز، حاول مرة أخرى.");
    }
  }

  function handleContinue() {
    setShowSuccessModal(false);
    navigate("/workshops");
  }

  const deviceValue = selectedDeviceLabel || "—";
  const serviceValue = selectedServiceLabel || "—";

  const reviewRows = [
    {
      label: "الجهاز",
      value: deviceValue,
    },
    {
      label: "الخدمة",
      value: serviceValue,
    },
    {
      label: "العنوان",
      value: address.trim() || "—",
    },
    {
      label: "الوصف",
      value: description.trim() || "—",
    },
    { label: "الصورة", value: image ? image.file.name : "بدون صورة" },
  ];

  const successRows = [
    ...(shopName ? [{ label: "الورشة", value: shopName }] : []),
    { label: "الجهاز", value: deviceValue },
    { label: "الخدمة", value: serviceValue },
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
              <h2 className="text-xl font-bold text-[#0a0a0a]">بيانات الجهاز</h2>

              <div>
                <label htmlFor={brandModelId} className="mb-2 block text-sm font-medium text-[#333]">
                  الماركة والموديل
                </label>

                {isDeviceModelsError ? (
                  <p className="text-sm text-red-600" role="alert">
                    تعذر تحميل الأجهزة، حاول تحديث الصفحة.
                  </p>
                ) : (
                  <SearchableSelect
                    id={brandModelId}
                    value={deviceModelId}
                    options={deviceModelOptions}
                    onChange={setDeviceModelId}
                    disabled={isDeviceModelsLoading}
                    placeholder={isDeviceModelsLoading ? "جاري تحميل الأجهزة..." : "ابحث عن الجهاز أو اختره..."}
                    emptyMessage="لا توجد أجهزة مطابقة"
                  />
                )}

                {isDeviceModelsFetching && !isDeviceModelsLoading ? (
                  <p className="mt-1 text-xs text-[#999]" role="status">
                    جاري تحديث قائمة الأجهزة...
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={serviceId} className="mb-2 block text-sm font-medium text-[#333]">
                  الخدمة المطلوبة
                </label>

                {isServicesError ? (
                  <p className="text-sm text-red-600" role="alert">
                    تعذر تحميل الخدمات، حاول تحديث الصفحة.
                  </p>
                ) : (
                  <SearchableSelect
                    id={serviceId}
                    value={serviceIdValue}
                    options={serviceOptions}
                    onChange={setServiceIdValue}
                    disabled={isServicesLoading}
                    placeholder={isServicesLoading ? "جاري تحميل الخدمات..." : "ابحث عن الخدمة أو اخترها..."}
                    emptyMessage="لا توجد خدمات مطابقة"
                  />
                )}

                {isServicesFetching && !isServicesLoading ? (
                  <p className="mt-1 text-xs text-[#999]" role="status">
                    جاري تحديث قائمة الخدمات...
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={addressId} className="mb-2 block text-sm font-medium text-[#333]">
                  العنوان
                </label>
                <input
                  id={addressId}
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="مثال: الرياض - حي العليا - شارع التخصصي"
                  autoComplete="street-address"
                  className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-secondary"
                />
              </div>

              <div className="flex flex-col items-end gap-2 pt-2">
                {!canGoNextFromStepOne ? <p className="text-xs text-[#999]">اختر الجهاز والخدمة وأدخل العنوان للمتابعة</p> : null}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNextFromStepOne}
                  className="min-w-50 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0a0a0a]">صف المشكلة</h2>

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
                  <span className="mt-3 text-sm font-medium text-primary">أضف صورة توضح المشكلة</span>
                  <span className="mt-1 text-xs text-[#999]">صورة واحدة (صيغ مدعومة: JPG, PNG)</span>
                </label>
                <input id={uploadId} type="file" accept="image/*" className="sr-only" onChange={handleUploadChange} />
              </div>

              {image ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-[#666]">الصورة المرفوعة</p>
                  <div className="relative w-24">
                    <img src={image.preview} alt="" className="aspect-square w-full rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute inset-s-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
                      aria-label={`حذف ${image.file.name}`}
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                    <p className="mt-1 truncate text-[11px] text-[#777]">{image.file.name}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={goPrev} className="min-w-50 rounded-lg bg-[#f3f3f3] px-8 py-2.5 text-sm font-semibold text-primary transition hover:bg-[#ebebeb]">
                  السابق
                </button>
                {!canGoNextFromStepTwo ? <p className="text-xs text-[#999]">أدخل وصف المشكلة للمتابعة</p> : null}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNextFromStepTwo}
                  className="min-w-50 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
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

              {!shopId ? (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                  لم يتم تحديد الورشة. اختر ورشة من صفحة الورشات ثم اضغط «احجز موعد».
                </p>
              ) : null}

              {submitError ? (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button type="button" onClick={goPrev} className="min-w-50 rounded-lg bg-[#f3f3f3] px-8 py-2.5 text-sm font-semibold text-primary transition hover:bg-[#ebebeb]">
                  السابق
                </button>
                <button
                  type="submit"
                  disabled={!shopId || isSubmitting}
                  className="min-w-50 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب"}
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
