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
    <section className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 lg:px-8">
      <h2 className="mb-8 text-xl font-bold text-primary sm:text-2xl">أمثلة على الأجهزة التي نقوم بإصلاحها</h2>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <li key={cat.label} className="flex flex-col items-center gap-3 rounded-xl bg-primary-light p-10">
            <img src={cat.image} alt="" className="h-12 w-12 object-contain" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">{cat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
