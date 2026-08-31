import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  id: string;
  value: string;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  emptyMessage?: string;
  selectedLabel?: string;
  onChange: (value: string) => void;
};

const baseInputClass =
  "w-full rounded-lg border border-primary/15 py-2.5 ps-4 pe-10 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary";

export function SearchableSelect({
  id,
  value,
  options,
  placeholder = "ابحث أو اختر...",
  disabled = false,
  hasError = false,
  emptyMessage = "لا توجد نتائج",
  selectedLabel,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(normalizedQuery),
  );

  const displayValue = open && !disabled ? query : (selectedOption?.label ?? selectedLabel ?? "");
  const isOpen = open && !disabled;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          disabled={disabled}
          value={displayValue}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          className={`${baseInputClass} disabled:cursor-not-allowed disabled:opacity-70 ${
            hasError ? "border-red-500" : ""
          }`}
        />
        <ChevronDown
          className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-primary/40"
          aria-hidden="true"
        />
      </div>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-primary/15 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-gray-500">{emptyMessage}</li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer px-4 py-2.5 text-sm transition hover:bg-primary-light ${
                  option.value === value ? "bg-primary-light/70 font-medium text-primary" : "text-primary"
                }`}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
