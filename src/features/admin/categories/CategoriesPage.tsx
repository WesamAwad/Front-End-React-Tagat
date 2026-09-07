import { useState } from "react";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { getPageSlice } from "../../../utils/getPageSlice";
import {
  useGetCategoriesAllQuery,
  useStoreCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../auth/authApi";
import type { AuthValidationErrorResponse, Category } from "../../../types/authTypes";

const EMPTY_CATEGORIES: never[] = [];
const PAGE_SIZE = 10;

function formatCategoryDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name: string } | null>(null);
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, isFetching } = useGetCategoriesAllQuery();
  const [storeCategory, { isLoading: isStoring }] = useStoreCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = data?.data ?? EMPTY_CATEGORIES;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categories.filter((category) => category.name.toLowerCase().includes(normalizedQuery))
    : categories;
  const { pageItems, currentPage } = getPageSlice(filteredCategories, page, PAGE_SIZE);
  const isEditing = Boolean(editingCategory);
  const isSaving = isStoring || isUpdating;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const openAddForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setNameError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setNameError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setNameError("");
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError("");
    setSubmitError("");

    const category_name = categoryName.trim();

    try {
      if (editingCategory) {
        const result = await updateCategory({ id: editingCategory.id, category_name }).unwrap();
        setSuccessMessage(result.message || "تم تعديل الفئة بنجاح");
      } else {
        const result = await storeCategory({ category_name }).unwrap();
        setSuccessMessage(result.message || "تمت إضافة الفئة بنجاح");
      }
      closeForm();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.category_name?.[0]) {
        setNameError(errors.category_name[0]);
        return;
      }

      setSubmitError(errorData?.message || (isEditing ? "تعذر تعديل الفئة، حاول مرة أخرى." : "تعذر إضافة الفئة، حاول مرة أخرى."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteCategory(deleteTarget.id).unwrap();
      setSuccessMessage(result.message || "تم حذف الفئة بنجاح");
      setDeleteTarget(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الفئة، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">الفئات</h1>
          <p className="mt-1 text-sm text-gray-500">إضافة وتعديل وحذف الفئات</p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
          <TableSearch id="categories-search" value={searchQuery} onChange={handleSearchChange} placeholder="ابحث عن فئة..." />
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover"
          >
            <Plus className="size-4" aria-hidden="true" />
            إضافة فئة
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">{isEditing ? "تعديل الفئة" : "إضافة فئة"}</h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-primary-light hover:text-primary"
              aria-label="إغلاق النموذج"
            >
              <X className="size-4" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {submitError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {submitError}
              </p>
            ) : null}

            <div>
              <label htmlFor="category_name" className="mb-2 block text-sm font-medium text-label">
                اسم الفئة
              </label>
              <input
                id="category_name"
                name="category_name"
                type="text"
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  setNameError("");
                }}
                placeholder="ادخل اسم الفئة"
                disabled={isSaving}
                className={`w-full max-w-md rounded-lg border py-3 px-4 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                  nameError ? "border-red-500" : "border-primary/15"
                }`}
              />
              {nameError ? <p className="mt-1.5 text-sm text-red-600">{nameError}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "جاري الحفظ..." : isEditing ? "حفظ التعديل" : "حفظ"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
              >
                إلغاء
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-primary/70" role="status">
            جاري تحميل الفئات...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الفئات</p>
          <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد فئات"}</p>
          <p className="mt-1 text-xs text-gray-500">ابدأ بإضافة أول فئة من الزر أعلاه</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد نتائج للبحث</p>
          <p className="mt-1 text-xs text-gray-500">جرّب كلمة بحث أخرى أو امسح البحث</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          {isFetching ? (
            <p className="border-b border-primary/10 bg-primary-light/40 px-4 py-2 text-center text-xs text-primary/70" role="status">
              جاري تحديث القائمة...
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-176 w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-center text-xs font-semibold text-primary">
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    اسم الفئة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    تاريخ الإنشاء
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    آخر تحديث
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {pageItems.map((category) => (
                  <tr key={category.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-gray-800 sm:px-6">
                      <span className="inline-flex items-center justify-center gap-2">
                        <Tags className="size-4 text-primary/40" aria-hidden="true" />
                        {category.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatCategoryDate(category.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatCategoryDate(category.updated_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center sm:px-6">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`تعديل ${category.name}`}
                          onClick={() => openEditForm(category)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                        >
                          <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${category.name}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(category);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} totalItems={filteredCategories.length} pageSize={PAGE_SIZE} itemLabel="فئة" onPageChange={setPage} />
        </div>
      )}

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الفئة"
        message={deleteTarget ? `هل تريد حذف فئة ${deleteTarget.name}؟` : ""}
        confirmLabel="حذف"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteError("");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default CategoriesPage;
