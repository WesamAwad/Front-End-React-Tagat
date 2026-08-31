import { Link, useParams } from "react-router-dom";
import { getWorkshopDetailsById } from "./workshopDetails.mock";
import { WorkshopDetailsContactSidebar } from "./WorkshopDetailsContactSidebar";
import { WorkshopDetailsMainPanel } from "./WorkshopDetailsMainPanel";

function DetailsWorkShop() {
  const { id } = useParams<{ id: string }>();
  const workshop = id ? getWorkshopDetailsById(id) : undefined;

  if (!workshop) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-primary">الورشة غير موجودة</h1>
        <p className="mt-2 text-sm text-gray-600">تعذر العثور على الورشة المطلوبة.</p>
        <Link to="/workshops" className="mt-6 inline-flex rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
          العودة إلى الورشات
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-xs">
          <li>
            <Link to="/" className="text-primary transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li className="text-[#ccc]" aria-hidden="true">
            /
          </li>
          <li>
            <Link to="/workshops" className="text-primary transition hover:text-primary">
              الورشات
            </Link>
          </li>
          <li className="text-[#ccc]" aria-hidden="true">
            /
          </li>
          <li className="font-bold text-secondary" aria-current="page">
            تفاصيل الورشة
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className="relative h-56 sm:h-72 lg:h-78.25">
            <img src={workshop.image} alt={workshop.name} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <WorkshopDetailsMainPanel workshop={workshop} />
          </div>
          <WorkshopDetailsContactSidebar workshop={workshop} />
        </div>
      </section>
    </div>
  );
}

export default DetailsWorkShop;
