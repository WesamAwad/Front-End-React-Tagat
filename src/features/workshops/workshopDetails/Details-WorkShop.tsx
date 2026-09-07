import { Link, useParams } from "react-router-dom";
import { useGetPublicShopDetailsQuery } from "../../auth/authApi";
import { mapPublicShopDetailsToWorkshopDetails } from "./mapPublicShopDetailsToWorkshopDetails";
import { WorkshopDetailsContactSidebar } from "./WorkshopDetailsContactSidebar";
import { WorkshopDetailsMainPanel } from "./WorkshopDetailsMainPanel";

function DetailsWorkShop() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, isFetching } = useGetPublicShopDetailsQuery(id ?? "", { skip: !id });

  const workshop = data?.data ? mapPublicShopDetailsToWorkshopDetails(data.data) : undefined;

  if (!id) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-primary">الورشة غير موجودة</h1>
        <Link to="/workshops" className="mt-6 inline-flex rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
          العودة إلى الورشات
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-primary/70" role="status">
          جاري تحميل بيانات الورشة...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-xl font-bold text-primary">تعذر تحميل الورشة</h1>
        <p className="mt-2 text-sm text-gray-600">حاول تحديث الصفحة أو العودة لاحقاً.</p>
        <Link to="/workshops" className="mt-6 inline-flex rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
          العودة إلى الورشات
        </Link>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-primary">{isFetching ? "جاري تحديث البيانات..." : "الورشة غير موجودة"}</h1>
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
            {workshop.name}
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className="relative h-56 bg-primary-light/40 sm:h-72 lg:h-78.25">
            {workshop.image ? (
              <img src={workshop.image} alt={workshop.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-primary/50">لا توجد صورة للورشة</div>
            )}
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
