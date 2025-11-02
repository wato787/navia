import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DestinationSearchBarProps {
  onSearch?: (destination: string) => void;
  placeholder?: string;
  className?: string;
}

export function DestinationSearchBar({
  onSearch,
  placeholder = "目的地を検索",
  className,
}: DestinationSearchBarProps) {
  const [destination, setDestination] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim() && onSearch) {
      onSearch(destination.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
  };

  const handleClear = () => {
    setDestination("");
  };

  const handleSearchClick = () => {
    if (destination.trim() && onSearch) {
      onSearch(destination.trim());
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
            value={destination}
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
            {destination && (
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
              disabled={!destination.trim()}
              className={cn(
                "p-2 rounded-full transition-colors",
                destination.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed",
              )}
              aria-label="検索"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

