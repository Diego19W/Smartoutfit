import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  className = "",
}: CustomSelectProps) {
  // Extraer si tiene pl-8 u otro padding-left del className
  const hasLeftPadding = className.includes('pl-');
  const baseClasses = hasLeftPadding 
    ? "w-full pr-10 py-2.5 border border-black/20 bg-white hover:border-black focus:border-black outline-none text-sm tracking-wider appearance-none transition-colors cursor-pointer"
    : "w-full px-4 py-2.5 pr-10 border border-black/20 bg-white hover:border-black focus:border-black outline-none text-sm tracking-wider appearance-none transition-colors cursor-pointer";
  
  return (
    <div className={`relative ${className.replace(/pl-\d+/, '')}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClasses} ${hasLeftPadding ? className.match(/pl-\d+/)?.[0] || '' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
    </div>
  );
}
