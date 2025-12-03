import React from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  countryValue: string;
  onCountryChange: (value: string) => void;
  onReset: () => void;
  countries: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  countryValue,
  onCountryChange,
  onReset,
  countries,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search projects, innovations..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d5c] focus:border-transparent"
        />
      </div>

      {/* Country Dropdown */}
      <div className="min-w-[200px]">
        <Select value={countryValue} onValueChange={onCountryChange}>
          <SelectTrigger className="w-full border-gray-300">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <Button
        onClick={onReset}
        variant="outline"
        className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-semibold px-6"
      >
        RESET
      </Button>
    </div>
  );
};

export default FilterBar;

