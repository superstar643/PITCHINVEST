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
import { SearchableCountrySelect } from './ui/searchable-country-select';
import { getSortedCountries } from '@/lib/countries';

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
  stageValue?: string;
  onStageChange?: (value: string) => void;
  cityValue?: string;
  onCityChange?: (value: string) => void;
  roleValue?: string;
  onRoleChange?: (value: string) => void;
  investmentRangeValue?: string;
  onInvestmentRangeChange?: (value: string) => void;
  equityRangeValue?: string;
  onEquityRangeChange?: (value: string) => void;
  availabilityValue?: string;
  onAvailabilityChange?: (value: string) => void;
  tagValue?: string;
  onTagChange?: (value: string) => void;
  popularityValue?: string;
  onPopularityChange?: (value: string) => void;
  statuses?: string[];
  categories?: string[];
  proposalTypes?: string[];
  stages?: string[];
  cities?: string[];
  roles?: string[];
  investmentRanges?: string[];
  equityRanges?: string[];
  availabilities?: string[];
  tags?: string[];
  popularities?: string[];
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
  stageValue,
  onStageChange,
  cityValue,
  onCityChange,
  roleValue,
  onRoleChange,
  investmentRangeValue,
  onInvestmentRangeChange,
  equityRangeValue,
  onEquityRangeChange,
  availabilityValue,
  onAvailabilityChange,
  onReset,
  statuses,
  categories,
  countries,
  proposalTypes,
  stages,
  cities,
  roles,
  investmentRanges,
  equityRanges,
  availabilities,
  tagValue,
  onTagChange,
  popularityValue,
  onPopularityChange,
  tags,
  popularities,
  searchPlaceholder = "Search projects, innovations...",
}) => {
  const showStatus = statusValue !== undefined && onStatusChange !== undefined;
  const showCategory = categoryValue !== undefined && onCategoryChange !== undefined;
  const showProposalType = proposalTypeValue !== undefined && onProposalTypeChange !== undefined;
  const showStage = stageValue !== undefined && onStageChange !== undefined;
  const showCity = cityValue !== undefined && onCityChange !== undefined;
  const showRole = roleValue !== undefined && onRoleChange !== undefined;
  const showInvestmentRange = investmentRangeValue !== undefined && onInvestmentRangeChange !== undefined;
  const showEquityRange = equityRangeValue !== undefined && onEquityRangeChange !== undefined;
  const showAvailability = availabilityValue !== undefined && onAvailabilityChange !== undefined;
  const showTag = tagValue !== undefined && onTagChange !== undefined;
  const showPopularity = popularityValue !== undefined && onPopularityChange !== undefined;

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-8 bg-white py-3 px-4 rounded-lg md:rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-100">
      {/* Search Input */}
      <div className="flex-shrink-0 w-full sm:w-auto min-w-0 sm:min-w-[200px] md:min-w-[220px] relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg md:rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-gray-50"
        />
      </div>

      {/* Status Dropdown - Optional */}
      {showStatus && (
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[130px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
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

      {/* Availability Status Dropdown - Optional - Show before Country */}
      {showAvailability && (
        <Select value={availabilityValue} onValueChange={onAvailabilityChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[130px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {availabilities?.map((availability) => (
              <SelectItem key={availability} value={availability}>
                {availability}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Country Dropdown - Using SearchableCountrySelect like Settings/Registration */}
      <SearchableCountrySelect
        countries={getSortedCountries()}
        value={countryValue === 'all' ? '' : countryValue}
        onValueChange={(value) => {
          onCountryChange(value || 'all');
        }}
        type="country"
        placeholder="All Countries"
        triggerClassName="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[130px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20"
      />

      {/* Tags Dropdown - Optional */}
      {showTag && (
        <Select value={tagValue} onValueChange={onTagChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[120px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))
            ) : null}
          </SelectContent>
        </Select>
      )}

      {/* Popularity Dropdown - Optional */}
      {showPopularity && (
        <Select value={popularityValue} onValueChange={onPopularityChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[120px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Popularity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Popularity</SelectItem>
            {popularities?.map((popularity) => (
              <SelectItem key={popularity} value={popularity}>
                {popularity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}


      {/* Category Dropdown - Optional */}
      {showCategory && (
        <Select value={categoryValue} onValueChange={onCategoryChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[120px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
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

      {/* City Dropdown - Optional */}
      {showCity && (
        <Select value={cityValue} onValueChange={onCityChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[110px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities?.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Proposal Type Dropdown - Optional */}
      {showProposalType && (
        <Select value={proposalTypeValue} onValueChange={onProposalTypeChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[130px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
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

      {/* Stage Dropdown - Optional */}
      {showStage && (
        <Select value={stageValue} onValueChange={onStageChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[110px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages?.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}


      {/* Role/Investor Type Dropdown - Optional */}
      {showRole && (
        <Select value={roleValue} onValueChange={onRoleChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[130px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Investor Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {roles?.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Investment Amount Range Dropdown - Optional */}
      {showInvestmentRange && (
        <Select value={investmentRangeValue} onValueChange={onInvestmentRangeChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[140px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Investment Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranges</SelectItem>
            {investmentRanges?.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Equity Percentage Range Dropdown - Optional */}
      {showEquityRange && (
        <Select value={equityRangeValue} onValueChange={onEquityRangeChange}>
          <SelectTrigger className="flex-shrink-0 w-full sm:w-fit min-w-0 sm:min-w-[100px] border-gray-200 rounded-lg md:rounded-full text-sm h-9 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#0a3d5c]/20">
            <SelectValue placeholder="Equity %" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All %</SelectItem>
            {equityRanges?.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}



      {/* Spacer to center RESET button in remaining space on desktop */}
      <div className="hidden md:block flex-grow"></div>

      {/* Reset Button */}
      <Button
        onClick={onReset}
        variant="outline"
        className="flex-shrink-0 w-full sm:w-auto sm:ml-auto md:ml-0 border-2 border-[#d5b775] text-[#d5b775] hover:bg-[#d5b775]/10 font-semibold px-4 md:px-5 rounded-lg md:rounded-full h-9 transition-all text-sm whitespace-nowrap"
      >
        RESET
      </Button>
      
      {/* Matching spacer on right for perfect centering */}
      <div className="hidden md:block flex-grow"></div>
    </div>
  );
};

export default FilterBar;
