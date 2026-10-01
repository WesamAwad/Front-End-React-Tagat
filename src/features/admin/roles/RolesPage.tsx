import { useEffect, useId, useState } from "react";
import { KeyRound, Pencil, Plus, Shield, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { getPageSlice } from "../../../utils/getPageSlice";
import {
  useDeleteRoleMutation,
  useGetAllRolesQuery,
  useGetRolePermissionsQuery,
  useGiveRolePermissionMutation,
  useRevokeRolePermissionMutation,
  useStoreRoleMutation,
  useUpdateRoleMutation,
} from "../../auth/authApi";
import type { AppRole, AuthValidationErrorResponse, RolePermission } from "../../../types/authTypes";

const EMPTY_ROLES: AppRole[] = [];
const PAGE_SIZE = 10;

function formatRoleDate(value?: string | null) {
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

function RolePermissionsPanel({
  role,
  open,
  onClose,
  onMessage,
}: {
  role: AppRole | null;
  open: boolean;
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const titleId = useId();
  const [permissionError, setPermissionError] = useState("");
  const [pendingPermissionId, setPendingPermissionId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, isFetching } = useGetRolePermissionsQuery(role?.id ?? "", {
    skip: !open || role == null,
  });
  const [givePermission, { isLoading: isGiving }] = useGiveRolePermissionMutation();
  const [revokePermission, { isLoading: isRevoking }] = useRevokeRolePermissionMutation();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPermissionError("");
      setPendingPermissionId(null);
      setSearchQuery("");
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleClose = () => {
    setPermissionError("");
    setPendingPermissionId(null);
    setSearchQuery("");
    onClose();
  };

  if (!open || !role) return null;

  const permissions = data?.permissions ?? [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPermissions = normalizedQuery
    ? permissions.filter((permission) => permission.name.toLowerCase().includes(normalizedQuery))
    : permissions;
  const assignedCount = permissions.filter((permission) => permission.assigned).length;
  const isBusy = isGiving || isRevoking;

  const togglePermission = async (permission: RolePermission) => {
    if (isBusy || role == null) return;

    setPermissionError("");
    setPendingPermissionId(permission.id);

    try {
      if (permission.assigned) {
        const result = await revokePermission({ roleId: role.id, permissionId: permission.id }).unwrap();
        onMessage(result.message || "تمت إزالة الصلاحية من الدور بنجاح.");
      } else {
        const result = await givePermission({ roleId: role.id, permissionId: permission.id }).unwrap();
        onMessage(result.message || "تمت إضافة الصلاحية إلى الدور بنجاح.");
      }
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setPermissionError(errorData?.message || "تعذر تحديث الصلاحية، حاول مرة أخرى.");
    } finally {
      setPendingPermissionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق صلاحيات الدور" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={handleClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-primary/10 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-primary">
              صلاحيات الدور
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {role.name}
              {permissions.length > 0 ? ` · ${assignedCount} من ${permissions.length} مفعّلة` : null}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-1.5 text-gray-500 transition hover:bg-primary-light hover:text-primary" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-primary/10 px-5 py-3">
          <TableSearch id="role-permissions-search" value={searchQuery} onChange={setSearchQuery} placeholder="ابحث عن صلاحية..." />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {permissionError ? (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {permissionError}
            </p>
          ) : null}

          {isLoading ? (
            <p className="py-10 text-center text-sm text-primary/70" role="status">
              جاري تحميل الصلاحيات...
            </p>
          ) : isError ? (
            <p className="py-10 text-center text-sm text-red-700" role="alert">
              تعذر تحميل صلاحيات هذا الدور
            </p>
          ) : permissions.length === 0 ? (
            <p className="py-10 text-center text-sm text-primary/70">لا توجد صلاحيات في النظام حالياً</p>
          ) : filteredPermissions.length === 0 ? (
            <p className="py-10 text-center text-sm text-primary/70">لا توجد نتائج للبحث</p>
          ) : (
            <ul className="divide-y divide-primary/5 overflow-hidden rounded-xl border border-primary/10">
              {filteredPermissions.map((permission) => {
                const isPending = pendingPermissionId === permission.id;
                return (
                  <li key={permission.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-primary">{permission.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{permission.assigned ? "مضافة لهذا الدور" : "غير مضافة"}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={permission.assigned}
                      aria-label={`${permission.assigned ? "إزالة" : "إضافة"} صلاحية ${permission.name}`}
                      disabled={isBusy}
                      onClick={() => void togglePermission(permission)}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:opacity-60 ${
                        permission.assigned ? "bg-secondary" : "bg-primary/20"
                      }`}
                    >
                      <span
                        className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
                          permission.assigned ? "inset-s-1" : "inset-e-1"
                        } ${isPending || isFetching ? "opacity-70" : ""}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function RolesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AppRole | null>(null);
  const [roleName, setRoleName] = useState("");
  const [permissionsRole, setPermissionsRole] = useState<AppRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppRole | null>(null);
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, isFetching } = useGetAllRolesQuery();
  const [storeRole, { isLoading: isStoring }] = useStoreRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = data?.roles ?? EMPTY_ROLES;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRoles = normalizedQuery ? roles.filter((role) => role.name.toLowerCase().includes(normalizedQuery)) : roles;
  const { pageItems, currentPage } = getPageSlice(filteredRoles, page, PAGE_SIZE);
  const isEditing = Boolean(editingRole);
  const isSaving = isStoring || isUpdating;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const openAddForm = () => {
    setEditingRole(null);
    setRoleName("");
    setNameError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const openEditForm = (role: AppRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setNameError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRole(null);
    setRoleName("");
    setNameError("");
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError("");
    setSubmitError("");

    const name = roleName.trim();
    if (!name) {
      setNameError("أدخل اسم الدور");
      return;
    }

    try {
      if (editingRole) {
        const result = await updateRole({ id: editingRole.id, name }).unwrap();
        setSuccessMessage(result.message || "تم تعديل الدور بنجاح.");
      } else {
        const result = await storeRole({ name }).unwrap();
        setSuccessMessage(result.message || "تمت إضافة الدور بنجاح.");
      }
      closeForm();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.name?.[0]) {
        setNameError(errors.name[0]);
        return;
      }

      setSubmitError(errorData?.message || (isEditing ? "تعذر تعديل الدور، حاول مرة أخرى." : "تعذر إضافة الدور، حاول مرة أخرى."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteRole(deleteTarget.id).unwrap();
      setSuccessMessage(result.message || "تم حذف الدور بنجاح.");
      setDeleteTarget(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الدور، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">الأدوار والصلاحيات</h1>
          <p className="mt-1 text-sm text-gray-500">إضافة الأدوار وتعديلها وربط صلاحيات Spatie بكل دور</p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
          <TableSearch id="roles-search" value={searchQuery} onChange={handleSearchChange} placeholder="ابحث عن دور..." />
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover"
          >
            <Plus className="size-4" aria-hidden="true" />
            إضافة دور
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">{isEditing ? "تعديل الدور" : "إضافة دور"}</h2>
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
              <label htmlFor="role_name" className="mb-2 block text-sm font-medium text-label">
                اسم الدور
              </label>
              <input
                id="role_name"
                name="name"
                type="text"
                value={roleName}
                onChange={(event) => {
                  setRoleName(event.target.value);
                  setNameError("");
                }}
                placeholder="مثال: admin"
                disabled={isSaving}
                className={`w-full max-w-md rounded-lg border px-4 py-3 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
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
            جاري تحميل الأدوار...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الأدوار</p>
          <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد أدوار"}</p>
          <p className="mt-1 text-xs text-gray-500">ابدأ بإضافة أول دور من الزر أعلاه</p>
        </div>
      ) : filteredRoles.length === 0 ? (
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
                    اسم الدور
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
                {pageItems.map((role) => (
                  <tr key={role.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-gray-800 sm:px-6">
                      <span className="inline-flex items-center justify-center gap-2">
                        <Shield className="size-4 text-primary/40" aria-hidden="true" />
                        {role.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatRoleDate(role.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatRoleDate(role.updated_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center sm:px-6">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`صلاحيات ${role.name}`}
                          onClick={() => setPermissionsRole(role)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/30 bg-white px-3 py-1.5 text-xs font-medium text-secondary transition hover:bg-orange-50"
                        >
                          <KeyRound className="size-3.5 shrink-0" aria-hidden="true" />
                          الصلاحيات
                        </button>
                        <button
                          type="button"
                          aria-label={`تعديل ${role.name}`}
                          onClick={() => openEditForm(role)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                        >
                          <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${role.name}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(role);
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
          <Pagination page={currentPage} totalItems={filteredRoles.length} pageSize={PAGE_SIZE} itemLabel="دور" onPageChange={setPage} />
        </div>
      )}

      <RolePermissionsPanel role={permissionsRole} open={Boolean(permissionsRole)} onClose={() => setPermissionsRole(null)} onMessage={setSuccessMessage} />

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الدور"
        message={deleteTarget ? `هل تريد حذف دور «${deleteTarget.name}»؟` : ""}
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

export default RolesPage;
