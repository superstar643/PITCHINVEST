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
  // Optional filters
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  proposalTypeValue?: string;
  onProposalTypeChange?: (value: string) => void;
  statuses?: string[];
  categories?: string[];
  proposalTypes?: string[];
  searchPlaceholder?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  categoryValue,
  onCategoryChange,
  countryValue,
  onCountryChange,
  proposalTypeValue,
  onProposalTypeChange,
  onReset,
  statuses,
  categories,
  countries,
  proposalTypes,
  searchPlaceholder = "Search projects, innovations...",
}) => {
  const showStatus = statusValue !== undefined && onStatusChange !== undefined;
  const showCategory = categoryValue !== undefined && onCategoryChange !== undefined;
  const showProposalType = proposalTypeValue !== undefined && onProposalTypeChange !== undefined;

  return (
    <div className="flex items-center gap-2 md:gap-3 mb-8 bg-white py-3 px-4 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-100 overflow-x-auto">
      {/* Search Input */}
      <div className="flex-shrink-0 min-w-[200px] md:min-w-[240px] relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-gray-50"
        />
      </div>

      {/* Status Dropdown - Optional */}
      {showStatus && (
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="flex-shrink-0 w-fit border-gray-200 rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses?.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Category Dropdown - Optional */}
      {showCategory && (
        <Select value={categoryValue} onValueChange={onCategoryChange}>
          <SelectTrigger className="flex-shrink-0 w-fit border-gray-200 rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Country Dropdown */}
      <Select value={countryValue} onValueChange={onCountryChange}>
        <SelectTrigger className="flex-shrink-0 w-fit border-gray-200 rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countries?.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Proposal Type Dropdown - Optional */}
      {showProposalType && (
        <Select value={proposalTypeValue} onValueChange={onProposalTypeChange}>
          <SelectTrigger className="flex-shrink-0 w-fit border-gray-200 rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Proposal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {proposalTypes?.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset Button */}
      <Button
        onClick={onReset}
        variant="outline"
        className="flex-shrink-0 border-2 border-[#d5b775] text-[#d5b775] hover:bg-[#d5b775]/10 font-semibold px-5 rounded-full h-9 transition-all text-sm"
      >
        RESET
      </Button>
    </div>
  );
};

export default FilterBar;
