import phoneImg from "../../assets/categories/phone.svg";
import laptopImg from "../../assets/categories/laptop.svg";
import tvImg from "../../assets/categories/tv.svg";
import printerImg from "../../assets/categories/printer.svg";
import gamesImg from "../../assets/categories/games.svg";
import homeImg from "../../assets/categories/home.svg";

const categories = [
  { label: "هواتف ذكية", image: phoneImg },
  { label: "لابتوب وكمبيوتر", image: laptopImg },
  { label: "تلفزيونات", image: tvImg },
  { label: "طابعات وسكانر", image: printerImg },
  { label: "ألعاب إلكترونية", image: gamesImg },
  { label: "أجهزة منزلية", image: homeImg },
];

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-end">
          <p className="text-start text-sm font-medium text-secondary">تصفح حسب الفئة</p>
          <h2 className="mt-1 text-xl font-bold text-primary sm:text-2xl">ما الجهاز الذي تريد إصلاحه؟</h2>
        </div>
        <button type="button" className="cursor-pointer text-sm font-medium text-primary/60 transition hover:text-primary">
          عرض الكل
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <button key={cat.label} type="button" className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl bg-primary-light p-10 transition hover:ring-2 hover:ring-secondary">
            <img src={cat.image} alt="" className="h-12 w-12 object-contain transition group-hover:scale-105" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
