import { Star } from "lucide-react";
import khaledImg from "../../assets/testimonials/khaled.webp";
import saraImg from "../../assets/testimonials/sara.webp";
import ahmedImg from "../../assets/testimonials/ahmed.webp";

const testimonials = [
  {
    id: 1,
    name: "أحمد المنصور",
    device: "شاشة مكسورة - آيفون 15",
    text: "خدمة ممتازة وسرعة في الإصلاح. الورشة كانت محترفة جداً والسعر معقول.",
    rating: 5,
    image: ahmedImg,
    highlighted: false,
  },
  {
    id: 2,
    name: "سارة الحربي",
    device: "لابتوب لا يشتغل - ماك بوك",
    text: "وجدت الورشة المناسبة بسهولة وتم الإصلاح في نفس اليوم.",
    rating: 5,
    image: saraImg,
    highlighted: true,
  },
  {
    id: 3,
    name: "خالد العتيبي",
    device: "شاشة تلفزيون - سامسونج",
    text: "تجربة رائعة من البداية للنهاية. التتبع المباشر للإصلاح مميز جداً.",
    rating: 5,
    image: khaledImg,
    highlighted: false,
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="h-4 w-4 fill-secondary text-secondary"
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* العنوان */}
      <div className="mb-12 text-center">
        <p className="text-sm text-gray-400">آراء العملاء</p>
        <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
          ماذا يقول عملاؤنا؟
        </h2>
      </div>

      {/* الكروت */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-6 transition hover:border-secondary"
          >
            {/* معلومات الشخص */}
            <div className="flex items-center gap-3">
              <img
                src={t.image}
                alt={t.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-base font-medium text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400">{t.device}</p>
              </div>
            </div>

            {/* النص */}
            <p className="text-sm leading-relaxed text-gray-500">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* النجوم */}
            <StarRating />
          </div>
        ))}
      </div>
    </section>
  );
}
