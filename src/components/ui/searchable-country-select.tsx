import * as React from 'react';
import { Search, X } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Country } from '@/lib/countries';
import ReactCountryFlag from 'react-country-flag';

interface SearchableCountrySelectProps {
  countries: Country[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  type?: 'phone' | 'country'; // 'phone' for phone code selector, 'country' for country selector
  className?: string;
  triggerClassName?: string;
  preferredCountryCode?: string; // ISO country code to prefer when multiple countries share same phone code (e.g., US vs CA for +1)
}

export const SearchableCountrySelect: React.FC<SearchableCountrySelectProps> = ({
  countries,
  value,
  onValueChange,
  placeholder = 'Select',
  type = 'country',
  className,
  triggerClassName,
  preferredCountryCode,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const isSearchingRef = React.useRef(false);
  const listItemsRef = React.useRef<(HTMLDivElement | null)[]>([]);

  // Filter countries based on search query
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery.trim()) return countries;

    const query = searchQuery.toLowerCase().trim();
    return countries.filter((country) => {
      const nameMatch = country.name.toLowerCase().includes(query);
      const codeMatch = country.code.toLowerCase().includes(query);
      const phoneMatch = country.phoneCode.includes(query);
      return nameMatch || codeMatch || phoneMatch;
    });
  }, [countries, searchQuery]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      // Use requestAnimationFrame to ensure focus happens after DOM updates
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus();
        isSearchingRef.current = true;
      }, 150);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchQuery('');
      isSearchingRef.current = false;
    }
  }, [open]);

  // Only maintain focus when actively typing, not when just hovering
  // Removed aggressive interval to prevent flickering

  // Reset highlighted index when search query changes
  React.useEffect(() => {
    setHighlightedIndex(-1);
    // Reset refs array
    listItemsRef.current = [];
  }, [searchQuery]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listItemsRef.current[highlightedIndex]) {
      listItemsRef.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  // For phone type, prefer the country with the preferred country code if provided
  // This ensures US is selected over Canada when both use +1
  const selectedCountry = React.useMemo(() => {
    if (type === 'phone') {
      if (preferredCountryCode) {
        // First try to find by preferred country code
        const preferred = countries.find(
          c => c.phoneCode === value && c.code.toUpperCase() === preferredCountryCode.toUpperCase()
        );
        if (preferred) return preferred;
      }
      // Fallback to first match
      return countries.find(c => c.phoneCode === value);
    } else {
      return countries.find(c => c.name === value);
    }
  }, [countries, value, type, preferredCountryCode]);

  // Determine which country should be considered "selected" for checkmark display
  // For phone type with +1, only show checkmark on the preferred country
  const getIsSelected = React.useCallback((country: Country): boolean => {
    if (type === 'phone') {
      // For phone code, only match if phone code matches AND it's the selected country
      if (country.phoneCode !== value) return false;
      
      // If we have a preferred country code, only show checkmark on that specific country
      if (preferredCountryCode) {
        return country.code.toUpperCase() === preferredCountryCode.toUpperCase();
      }
      
      // If no preference, check if this is the first country with this phone code
      // (to ensure only one checkmark shows)
      const firstMatch = countries.find(c => c.phoneCode === value);
      return firstMatch?.code === country.code;
    } else {
      return country.name === value;
    }
  }, [countries, value, type, preferredCountryCode]);

  return (
    <SelectPrimitive.Root
      value={
        type === 'phone' && preferredCountryCode && selectedCountry
          ? `${value}|${selectedCountry.code}`
          : value === '' ? '__all_countries__' : value
      }
      onValueChange={(selectedValue) => {
        if (type === 'phone') {
          // Extract phone code from composite value
          const phoneCode = selectedValue.split('|')[0];
          onValueChange(phoneCode);
        } else {
          // For country type, pass empty string for "All Countries" (__all_countries__) or the country name
          if (selectedValue === '__all_countries__') {
            onValueChange('');
          } else {
            onValueChange(selectedValue || '');
          }
        }
      }}
      open={open}
      onOpenChange={setOpen}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          triggerClassName
        )}
      >
        {selectedCountry ? (
          type === 'phone' ? (
            <>
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode={selectedCountry.code}
                  svg
                  style={{
                    width: '1.25rem',
                    height: '1rem',
                  }}
                  title={selectedCountry.name}
                />
                <span className="text-sm text-gray-900">{selectedCountry.phoneCode}</span>
              </div>
              <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectPrimitive.Icon>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                <ReactCountryFlag
                  countryCode={selectedCountry.code}
                  svg
                  style={{
                    width: '1.25rem',
                    height: '1rem',
                  }}
                  title={selectedCountry.name}
                />
                <span className="text-sm text-gray-900 truncate">{selectedCountry.name}</span>
              </div>
              <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectPrimitive.Icon>
            </>
          )
        ) : (
          <>
            {/* Show placeholder text manually when no country is selected */}
            <span className="text-sm text-gray-900">{placeholder}</span>
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </>
        )}
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border/40 bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200 max-w-[100vw] p-0',
            className
          )}
          position="popper"
          side="bottom"
          align="start"
          sideOffset={5}
          onKeyDown={(e) => {
            // Only prevent Select from handling keys when search input is actually focused
            if (searchInputRef.current === document.activeElement) {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
          onKeyPress={(e) => {
            // Only prevent when search input is actually focused
            if (searchInputRef.current === document.activeElement) {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
          onKeyUp={(e) => {
            // Only prevent when search input is actually focused
            if (searchInputRef.current === document.activeElement) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onPointerDown={(e) => {
            // Prevent pointer events on list items from affecting input focus when user is typing
            if (searchInputRef.current === document.activeElement && isSearchingRef.current) {
              // Only prevent if actively typing/searching
              e.stopPropagation();
            }
          }}
        >
          {/* Search Input */}
          <div 
            className="sticky top-0 z-10 bg-popover border-b border-border px-2 py-2"
            onKeyDown={(e) => {
              // Prevent all keyboard events from reaching Select
              if (searchInputRef.current === document.activeElement || isSearchingRef.current) {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }
            }}
            onKeyPress={(e) => {
              if (isSearchingRef.current) {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }
            }}
            onKeyUp={(e) => {
              if (isSearchingRef.current) {
                e.stopPropagation();
              }
            }}
            onMouseDown={(e) => {
              // Prevent mouse events from stealing focus
              if (e.target === searchInputRef.current || searchInputRef.current?.contains(e.target as Node)) {
                e.stopPropagation();
              }
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  isSearchingRef.current = true;
                  // Immediately refocus to prevent loss
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }}
                onKeyDown={(e) => {
                  isSearchingRef.current = true;
                  
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    setSearchQuery('');
                    setOpen(false);
                    isSearchingRef.current = false;
                    setHighlightedIndex(-1);
                    return;
                  }
                  
                  // Handle arrow key navigation
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    e.stopPropagation();
                    setHighlightedIndex((prev) => {
                      const maxIndex = filteredCountries.length - 1;
                      const newIndex = prev < maxIndex ? prev + 1 : prev;
                      // Scroll into view
                      setTimeout(() => {
                        if (listItemsRef.current[newIndex]) {
                          listItemsRef.current[newIndex]?.scrollIntoView({
                            block: 'nearest',
                            behavior: 'smooth',
                          });
                        }
                      }, 0);
                      return newIndex;
                    });
                    // Keep focus on input
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                    return;
                  }
                  
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    e.stopPropagation();
                    setHighlightedIndex((prev) => {
                      const newIndex = prev > 0 ? prev - 1 : 0;
                      // Scroll into view
                      setTimeout(() => {
                        if (listItemsRef.current[newIndex]) {
                          listItemsRef.current[newIndex]?.scrollIntoView({
                            block: 'nearest',
                            behavior: 'smooth',
                          });
                        }
                      }, 0);
                      return newIndex;
                    });
                    // Keep focus on input
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                    return;
                  }
                  
                  // Handle Enter to select highlighted item
                  if (e.key === 'Enter' && highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
                    e.preventDefault();
                    e.stopPropagation();
                    const selectedCountry = filteredCountries[highlightedIndex];
                    if (type === 'phone') {
                      onValueChange(selectedCountry.phoneCode);
                    } else {
                      onValueChange(selectedCountry.code);
                    }
                    setOpen(false);
                    setSearchQuery('');
                    setHighlightedIndex(-1);
                    isSearchingRef.current = false;
                    return;
                  }
                  
                  // Prevent Tab and Home/End from moving focus
                  if (['Tab', 'Home', 'End'].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  
                  // For other keys, allow normal input but prevent propagation to Select
                  if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab', 'Home', 'End'].includes(e.key)) {
                    e.stopPropagation();
                  }
                  
                  // Immediately refocus after any key press
                  setTimeout(() => {
                    if (isSearchingRef.current && searchInputRef.current) {
                      searchInputRef.current.focus();
                    }
                  }, 0);
                }}
                onKeyPress={(e) => {
                  // Prevent keypress events from propagating
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  isSearchingRef.current = true;
                }}
                onKeyUp={(e) => {
                  // Prevent keyup events from propagating
                  e.stopPropagation();
                  isSearchingRef.current = true;
                  // Refocus after keyup
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }}
                onInput={(e) => {
                  // Handle input events (for IME and other input methods)
                  isSearchingRef.current = true;
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }}
                onCompositionStart={() => {
                  isSearchingRef.current = true;
                }}
                onCompositionEnd={() => {
                  isSearchingRef.current = true;
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }}
                onFocus={(e) => {
                  // Keep focus on input
                  e.stopPropagation();
                  isSearchingRef.current = true;
                }}
                onBlur={(e) => {
                  // Don't aggressively refocus on hover - this causes the blue border shaking
                  // Only allow normal blur behavior - focus will be restored when typing or clicking input
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  const dropdownContent = e.currentTarget.closest('[data-radix-select-content]');
                  
                  // Only mark as not searching if focus left the dropdown entirely
                  if (!relatedTarget || !dropdownContent?.contains(relatedTarget)) {
                    isSearchingRef.current = false;
                  }
                  // Don't prevent blur or refocus - let it happen naturally
                  // The input will get focus back when user types or clicks on it
                }}
                onPointerDown={(e) => {
                  // Only prevent if clicking on the input itself, not in the list
                  if (e.target === searchInputRef.current || searchInputRef.current?.contains(e.target as Node)) {
                    e.stopPropagation();
                    e.preventDefault();
                    isSearchingRef.current = true;
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                  }
                }}
                onMouseDown={(e) => {
                  // Only prevent if clicking on the input itself, not in the list
                  if (e.target === searchInputRef.current || searchInputRef.current?.contains(e.target as Node)) {
                    e.stopPropagation();
                    e.preventDefault();
                    isSearchingRef.current = true;
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                  }
                }}
                onClick={(e) => {
                  // Only handle if clicking on the input itself
                  if (e.target === searchInputRef.current || searchInputRef.current?.contains(e.target as Node)) {
                    e.stopPropagation();
                    e.preventDefault();
                    isSearchingRef.current = true;
                    searchInputRef.current?.focus();
                  }
                }}
                className="pl-9 pr-8 h-9 text-sm"
                autoFocus={open}
                tabIndex={0}
              />
              {searchQuery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Countries List with Scrollbar */}
          <SelectPrimitive.Viewport 
            className={cn(
              "p-1 max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar"
            )}
          >
            {/* Optionally show "All Countries" option for filters */}
            {type === 'country' && !searchQuery.trim() && (
              <SelectPrimitive.Item
                value="__all_countries__"
                onSelect={() => {
                  onValueChange('');
                  setOpen(false);
                }}
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent/50 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors'
                )}
              >
                <SelectPrimitive.ItemText>
                  <span>All Countries</span>
                </SelectPrimitive.ItemText>
                {!value && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-primary" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                )}
              </SelectPrimitive.Item>
            )}
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => {
                // For phone type with multiple countries sharing same phone code,
                // use composite value to ensure only one checkmark shows
                const itemValue = type === 'phone' 
                  ? `${country.phoneCode}|${country.code}` 
                  : country.name;
                
                // Determine if this item should show as selected based on preferred country code
                const isSelected = getIsSelected(country);
                const isHighlighted = highlightedIndex === index;
                
                // Only show the preferred country when multiple share the same phone code and no search is active
                // But allow all to show when searching
                if (type === 'phone' && 
                    country.phoneCode === value && 
                    preferredCountryCode && 
                    !searchQuery.trim()) {
                  const countriesWithSameCode = countries.filter(c => c.phoneCode === value);
                  if (countriesWithSameCode.length > 1 && 
                      country.code.toUpperCase() !== preferredCountryCode.toUpperCase()) {
                    // Skip this country - show only the preferred one when not searching
                    return null;
                  }
                }
                
                return (
                  <SelectPrimitive.Item
                    key={type === 'phone' ? `${country.phoneCode}-${country.code}` : country.name}
                    value={itemValue}
                    ref={(el) => {
                      // Store ref for scrolling into view using the map index
                      listItemsRef.current[index] = el;
                    }}
                    onSelect={() => {
                      if (type === 'phone') {
                        // Extract just the phone code for the callback
                        onValueChange(country.phoneCode);
                        setOpen(false);
                      } else {
                        // For country type, pass the country name
                        onValueChange(country.name);
                        setOpen(false);
                      }
                      setHighlightedIndex(-1);
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent/50 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors',
                      isHighlighted && 'bg-accent/50 text-accent-foreground'
                    )}
                  >
                    <SelectPrimitive.ItemText>
                      <div className="flex items-center gap-2">
                        <ReactCountryFlag
                          countryCode={country.code}
                          svg
                          style={{
                            width: '1.25rem',
                            height: '1rem',
                          }}
                          title={country.name}
                        />
                        <span>
                          {type === 'phone'
                            ? `${country.phoneCode} ${country.name}`
                            : country.name}
                        </span>
                      </div>
                    </SelectPrimitive.ItemText>
                    {isSelected && (
                      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <Check className="h-4 w-4 text-primary" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                    )}
                  </SelectPrimitive.Item>
                );
              }).filter(Boolean)
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No countries found
              </div>
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

