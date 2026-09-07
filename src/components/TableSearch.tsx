import { Search, X } from "lucide-react";

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

export function TableSearch({ value, onChange, placeholder = "ابحث...", id = "table-search", className = "" }: TableSearchProps) {
  return (
    <div className={`relative w-56 shrink-0 sm:w-64 ${className}`}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-primary/15 bg-white py-2.5 ps-10 pe-10 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary"
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-primary-light hover:text-primary" aria-label="مسح البحث">
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
