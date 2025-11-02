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

  return (
    <div
      className={cn(
        "absolute top-2 left-2 right-16 sm:top-4 sm:left-4 sm:right-auto z-10 w-auto sm:w-full sm:max-w-lg",
        className,
      )}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Search 
              className="h-5 w-5 text-gray-600" 
              aria-hidden="true"
            />
          </div>
          <Input
            type="text"
            value={destination}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "pl-12 pr-12 h-14 text-base",
              "shadow-xl border border-gray-200",
              "bg-white backdrop-blur-md",
              "hover:shadow-2xl transition-shadow duration-200",
              "focus-visible:ring-2 focus-visible:ring-blue-500/20",
              "focus-visible:border-blue-500/50",
            )}
          />
          {destination && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="入力をクリア"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

