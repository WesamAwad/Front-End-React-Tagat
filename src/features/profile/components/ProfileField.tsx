import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type ProfileFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  label: string;
  error?: string;
  /** Icon or control shown at the inline end of the input (left in RTL). */
  adornment: ReactNode;
};

export function ProfileField({ label, error, adornment, ...inputProps }: ProfileFieldProps) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="mb-3 block text-base text-[#101828]">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-3xl border bg-white ps-3 pe-12 text-sm text-[#101828] outline-none transition placeholder:text-[#b8b8b8] focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${error ? "border-red-500" : "border-[#e8e8e8]"}`}
          {...inputProps}
        />
        <div className="absolute inset-y-0 inset-e-3 flex items-center">{adornment}</div>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
