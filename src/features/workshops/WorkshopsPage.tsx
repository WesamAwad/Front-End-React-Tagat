import { Link } from "react-router-dom";
import { WorkshopsBrowseSection } from "./WorkshopsBrowseSection";
import { WorkshopsHeroSection } from "./WorkshopsHeroSection";

function WorkshopsPage() {
  return (
    <div>
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center  gap-2 text-xs">
          <li>
            <Link to="/" className="text-primary transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li className="text-[#ccc]" aria-hidden="true">
            /
          </li>
          <li className="text-secondary font-bold" aria-current="page">
            الورشات
          </li>
        </ol>
      </nav>

      <WorkshopsHeroSection />
      <WorkshopsBrowseSection />
    </div>
  );
}

export default WorkshopsPage;
