"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/constants/categories";
import { useDebounce } from "@/hooks/use-debounce";

export interface FilterOption {
  id: string;
  label: string;
}

export interface StatusTab {
  label: string;
  value: string;
}

interface TableBarFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
  onSearchChange: (search: string) => void;
  onStatusChange?: (status: string) => void;
  filterOptions?: Category[];
  statusTabs?: StatusTab[];
  defaultStatus?: string;
  placeholder?: string;
  type?: "default" | "custom" | "none";
  searchDelay?: number;
}

export function TableBarFilter({
  onFilterChange,
  onSearchChange,
  onStatusChange,
  filterOptions = [],
  statusTabs = [],
  defaultStatus = "all",
  placeholder = "Tìm kiếm...",
  type = "default",
  searchDelay = 500,
}: TableBarFilterProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState(defaultStatus);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    filterOptions[0] || { id: "all", label: "Tất cả", value: "all" }
  );
  const [open, setOpen] = useState(false);

  const debouncedSearch = useDebounce(search, searchDelay);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setActiveStatus(status);
    onStatusChange?.(status);
  }, [onStatusChange]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
    if (category.id === "all") {
      setFilters({});
      onFilterChange({});
    } else {
      handleFilterChange("category", category.value);
    }
    setOpen(false);
  }, [handleFilterChange, onFilterChange]);

  const renderSearchInput = useCallback(() => (
    <div className={cn(
      "relative",
      type === "custom" ? "flex-1" : "min-w-[400px]"
    )}>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-8 w-full"
      />
    </div>
  ), [search, handleSearchChange, placeholder, type]);

  const renderFilterDropdown = useCallback(() => {
    if (!filterOptions?.length) return null;

    if (type === "custom") {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-[200px] justify-between border-sidebar-border"
            >
              {selectedCategory.label}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Tìm danh mục..." />
              <CommandEmpty>Không tìm thấy danh mục</CommandEmpty>
              <CommandGroup>
                {filterOptions.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.label}
                    onSelect={() => handleCategorySelect(category)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategory.id === category.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-sidebar-border"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleFilterChange(option.id, option.label)}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [type, filterOptions, open, selectedCategory, handleCategorySelect, handleFilterChange]);

  return (
    <div className="flex justify-between space-y-4">
      {statusTabs.length > 0 && (
        <Tabs
          value={activeStatus}
          onValueChange={handleStatusChange}
          className="w-full"
        >
          <TabsList className="bg-muted gap-2 px-2">
            {statusTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm !flex-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      <div className="flex gap-2">
        {renderSearchInput()}
        {renderFilterDropdown()}
      </div>
    </div>
  );
}
