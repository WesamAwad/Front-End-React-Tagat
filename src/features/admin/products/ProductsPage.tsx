import { useState } from "react";
import { Boxes, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { getPageSlice } from "../../../utils/getPageSlice";
import { useDeleteProductMutation, useGetCategoriesForSelectQuery, useGetProductsAllQuery, useStoreProductMutation, useUpdateProductMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse, Product } from "../../../types/authTypes";

const EMPTY_PRODUCTS: never[] = [];
const PAGE_SIZE = 10;

function formatProductDate(value?: string | null) {
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

function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name: string } | null>(null);
  const [nameError, setNameError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = useGetCategoriesForSelectQuery();
  const { data, isLoading, isError, isFetching } = useGetProductsAllQuery();
  const [storeProduct, { isLoading: isStoring }] = useStoreProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const categories = categoriesData?.data ?? [];
  const products = data?.data ?? EMPTY_PRODUCTS;
  const isEditing = Boolean(editingProduct);
  const isSaving = isStoring || isUpdating;

  const resolveCategoryName = (product: Product) => {
    if (product.category_name) return product.category_name;
    if (product.category_id == null || product.category_id === "") return "—";
    const match = categories.find((category) => String(category.id) === String(product.category_id));
    return match?.name ?? "—";
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) => {
        const name = product.name.toLowerCase();
        const categoryName = resolveCategoryName(product).toLowerCase();
        return name.includes(normalizedQuery) || categoryName.includes(normalizedQuery);
      })
    : products;
  const { pageItems, currentPage } = getPageSlice(filteredProducts, page, PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setProductName("");
    setCategoryId("");
    setNameError("");
    setCategoryError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setCategoryId(product.category_id == null ? "" : String(product.category_id));
    setNameError("");
    setCategoryError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setProductName("");
    setCategoryId("");
    setNameError("");
    setCategoryError("");
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError("");
    setCategoryError("");
    setSubmitError("");

    const product_name = productName.trim();

    try {
      if (editingProduct) {
        const result = await updateProduct({ id: editingProduct.id, product_name, category_id: categoryId }).unwrap();
        setSuccessMessage(result.message || "تم تعديل المنتج بنجاح");
      } else {
        const result = await storeProduct({ product_name, category_id: categoryId }).unwrap();
        setSuccessMessage(result.message || "تمت إضافة المنتج بنجاح");
      }
      closeForm();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.product_name?.[0]) {
        setNameError(errors.product_name[0]);
      }
      if (errors?.category_id?.[0]) {
        setCategoryError(errors.category_id[0]);
      }
      if (errors?.product_name?.[0] || errors?.category_id?.[0]) return;

      setSubmitError(errorData?.message || (isEditing ? "تعذر تعديل المنتج، حاول مرة أخرى." : "تعذر إضافة المنتج، حاول مرة أخرى."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteProduct(deleteTarget.id).unwrap();
      setSuccessMessage(result.message || "تم حذف المنتج بنجاح");
      setDeleteTarget(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف المنتج، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">المنتجات</h1>
          <p className="mt-1 text-sm text-gray-500">إضافة وتعديل وحذف المنتجات</p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
          <TableSearch id="products-search" value={searchQuery} onChange={handleSearchChange} placeholder="ابحث عن منتج..." />
          <button type="button" onClick={openAddForm} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
            <Plus className="size-4" aria-hidden="true" />
            إضافة منتج
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">{isEditing ? "تعديل المنتج" : "إضافة منتج"}</h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-primary-light hover:text-primary" aria-label="إغلاق النموذج">
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
              <label htmlFor="product_name" className="mb-2 block text-sm font-medium text-label">
                اسم المنتج
              </label>
              <input
                id="product_name"
                name="product_name"
                type="text"
                value={productName}
                onChange={(event) => {
                  setProductName(event.target.value);
                  setNameError("");
                }}
                placeholder="ادخل اسم المنتج"
                disabled={isSaving}
                className={`w-full max-w-md rounded-lg border py-3 px-4 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                  nameError ? "border-red-500" : "border-primary/15"
                }`}
              />
              {nameError ? <p className="mt-1.5 text-sm text-red-600">{nameError}</p> : null}
            </div>

            <div>
              <label htmlFor="category_id" className="mb-2 block text-sm font-medium text-label">
                الفئة
              </label>
              <div className="relative w-full max-w-md">
                <select
                  id="category_id"
                  name="category_id"
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setCategoryError("");
                  }}
                  disabled={isSaving || isCategoriesLoading || isCategoriesError}
                  className={`w-full appearance-none rounded-lg border bg-white py-3 ps-4 pe-10 text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                    categoryError ? "border-red-500" : "border-primary/15"
                  }`}
                >
                  <option value="">{isCategoriesLoading ? "جاري تحميل الفئات..." : isCategoriesError ? "تعذر تحميل الفئات" : "اختر الفئة"}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {categoryError ? <p className="mt-1.5 text-sm text-red-600">{categoryError}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={isSaving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
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
            جاري تحميل المنتجات...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل المنتجات</p>
          <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد منتجات"}</p>
          <p className="mt-1 text-xs text-gray-500">ابدأ بإضافة أول منتج من الزر أعلاه</p>
        </div>
      ) : filteredProducts.length === 0 ? (
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
                    اسم المنتج
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الفئة
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
                {pageItems.map((product) => (
                  <tr key={product.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-gray-800 sm:px-6">
                      <span className="inline-flex items-center justify-center gap-2">
                        <Boxes className="size-4 text-primary/40" aria-hidden="true" />
                        {product.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{resolveCategoryName(product)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatProductDate(product.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatProductDate(product.updated_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center sm:px-6">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`تعديل ${product.name}`}
                          onClick={() => openEditForm(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                        >
                          <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${product.name}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(product);
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
          <Pagination page={currentPage} totalItems={filteredProducts.length} pageSize={PAGE_SIZE} itemLabel="منتج" onPageChange={setPage} />
        </div>
      )}

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف المنتج"
        message={deleteTarget ? `هل تريد حذف منتج ${deleteTarget.name}؟` : ""}
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

export default ProductsPage;
