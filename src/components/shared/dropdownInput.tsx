import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

// Interface for each dropdown select option
export interface DropdownOption {
  value: string;
  label: string;
}

// Interface for component props
interface DropdownInputProps {
  label?: string; // Group label displayed inside the dropdown popup
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the currently selected option to display its label in the trigger
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside of the container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between cursor-pointer hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      >
        <span className={selectedOption ? "text-gray-900 font-semibold" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Options Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Optional Group Title Label */}
          {label && (
            <div className="text-xs font-semibold text-gray-400 px-3.5 py-1.5 select-none">
              {label}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left outline-none ${
                    isSelected
                      ? "bg-soft text-secondary font-extrabold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-950 font-semibold"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-secondary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

