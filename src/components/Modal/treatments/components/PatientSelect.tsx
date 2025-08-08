import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { patientsService } from "@/api/patients";
import { useQuery } from "@tanstack/react-query";

interface PatientSelectProps {
  field: any;
  form: any;
  setSelectedPatient: (patient: any) => void;
  disabled?: boolean;
}

export function PatientSelect({ field, form, setSelectedPatient, disabled }: PatientSelectProps) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patient-documents", page, debouncedSearch],
    queryFn: async () => {
      setIsLoadingMore(true);
      try {
        const response = await patientsService.getPatientDocuments(
          undefined,
          20,
          (page - 1) * 20,
          debouncedSearch
        );

        if (page === 1) {
          setAllPatients(response?.data || []);
        } else {
          const newPatients = (response?.data || []).filter(
            (newPatient) =>
              !allPatients.some(
                (existingPatient) => existingPatient.$id === newPatient.$id
              )
          );
          setAllPatients((prev) =>
            page === 1
              ? newPatients
              : [...prev, ...newPatients.filter((np: any) => !prev.some((p) => p.$id === np.$id))]
          );
        }

        setHasMore((response?.data || []).length === 20);
        return response;
      } finally {
        setIsLoadingMore(false);
      }
    },
    staleTime: 3000,
  });

  const fetchMorePatients = () => {
    if (!isLoadingMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <FormItem>
      <FormLabel>Bệnh nhân</FormLabel>
      <div className="relative">
        <FormControl>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between outline-none text-muted-foreground border-sidebar-border hover:bg-white hover:text-muted-foreground"
            onClick={() => setPopoverOpen(!popoverOpen)}
            disabled={disabled}
          >
            {field.value
              ? allPatients.find(
                  (patient) => patient.$id === field.value
                )?.name
              : "Chọn bệnh nhân..."}
          </Button>
        </FormControl>
        {popoverOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border z-[999]">
            <Command className="w-full">
              <CommandInput
                placeholder="Tìm kiếm bệnh nhân..."
                value={searchQuery}
                className="w-full"
                onValueChange={setSearchQuery}
              />
              <CommandEmpty>
                {isLoadingPatients ? "Đang tải..." : "Không tìm thấy bệnh nhân."}
              </CommandEmpty>
              <CommandGroup>
                <div
                  id="scrollableDiv"
                  className="max-h-[300px] overflow-y-auto"
                >
                  <InfiniteScroll
                    dataLength={allPatients.length}
                    next={fetchMorePatients}
                    hasMore={hasMore}
                    loader={
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Đang tải thêm...
                      </div>
                    }
                    scrollableTarget="scrollableDiv"
                    endMessage={
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Không còn bệnh nhân nào
                      </div>
                    }
                  >
                    {allPatients.map((patient) => (
                      <CommandItem
                        key={patient.$id}
                        value={patient.$id}
                        onSelect={() => {
                          field.onChange(patient.$id);
                          setSelectedPatient(patient);
                          setPopoverOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={patient?.avatar || ""}
                              alt={patient?.name}
                            />
                            <AvatarFallback>
                              {patient?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{patient?.name}</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            field.value === patient.$id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </InfiniteScroll>
                </div>
              </CommandGroup>
            </Command>
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
} 