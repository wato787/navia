import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
};

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "目的地を検索",
  className,
  children,
}: SearchBarProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  const handleSearchClick = () => {
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
  };

  return (
    <div
      className={cn(
        "absolute top-2 left-2 right-16 sm:top-4 sm:left-4 sm:right-auto z-10 w-auto sm:w-full sm:max-w-lg",
        className,
      )}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <Input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "pl-4 pr-24 h-14 text-base",
              "shadow-xl border border-gray-200",
              "bg-white backdrop-blur-md",
              "hover:shadow-2xl transition-shadow duration-200",
              "focus-visible:ring-2 focus-visible:ring-blue-500/20",
              "focus-visible:border-blue-500/50",
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="入力をクリア"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearchClick}
              disabled={!value.trim()}
              className={cn(
                "p-2 rounded-full transition-colors",
                value.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed",
              )}
              aria-label="検索"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
        {children}
      </form>
    </div>
  );
}
