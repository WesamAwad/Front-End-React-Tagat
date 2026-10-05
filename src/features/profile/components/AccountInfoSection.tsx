import trashIcon from "../../../assets/profile/trash.svg";

type AccountInfoSectionProps = {
  onDeleteClick: () => void;
};

export function AccountInfoSection({ onDeleteClick }: AccountInfoSectionProps) {
  return (
    <section className="rounded-lg border border-primary/10 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 rounded-lg bg-[#fdd9d7] p-5 sm:min-h-27.75 sm:flex-row sm:items-center sm:justify-between sm:pe-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#f44336]">
            <img src={trashIcon} alt="" width="25.4074" height="24" className="shrink-0" />
            حذف الحساب
          </h2>
          <p className="mt-3 text-xs text-black">سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن التراجع عن هذا الإجراء</p>
        </div>

        <button type="button" onClick={onDeleteClick} className="h-12 w-full shrink-0 rounded-3xl bg-[#f44336] px-7 text-base font-medium text-white transition hover:bg-[#e53935] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f44336]/40 sm:w-48">
          حذف الحساب
        </button>
      </div>
    </section>
  );
}
