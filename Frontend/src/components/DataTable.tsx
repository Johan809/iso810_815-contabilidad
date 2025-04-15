/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
  HandCoins,
  FilterX,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface Filter {
  key: string;
  label: string;
  type: "select" | "boolean" | "number" | "text" | "date";
  options?: FilterOption[];
  dateConfig?: {
    startKey?: string;
    endKey?: string;
  };
  customFilter?: boolean; // Indicates this filter requires custom handling
}

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
  filterable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  filters?: Filter[];
  onUpdate?: {
    icon: string;
    label: string;
    func: (item: object) => void;
  };
  customFilterFunction?: (item: any, activeFilters: Record<string, any>) => boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  filters = [],
  onUpdate = null,
  customFilterFunction,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilters, setDateFilters] = useState<Record<string, { from?: Date; to?: Date }>>({});
  const itemsPerPage = 8;
  const showActionsColumn = !!onEdit || !!onUpdate || !!onDelete;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchTerm, dateFilters]);

  // Apply filters to data
  const filteredData = data.filter((item) => {
    // First apply search term across all fields
    const matchesSearch =
      searchTerm === "" ||
      Object.values(item).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Apply custom filters if provided
    if (customFilterFunction) {
      if (!customFilterFunction(item, activeFilters)) {
        return false;
      }
    }

    // Then apply standard filters (excluding custom ones)
    const standardFilters = Object.entries(activeFilters).filter(
      ([key]) => !filters.find(f => f.key === key && f.customFilter)
    );
    
    const matchesFilters = standardFilters.every(
      ([key, value]) => {
        // Ignoring null values
        if (
          value === "" ||
          value === undefined ||
          value === null ||
          value === "-1"
        )
          return true;

        // Handle boolean filters
        if (typeof value === "boolean") {
          return item[key] === value;
        }

        // Handle select filters
        return item[key] == value; // Use loose equality to handle string/number comparison
      }
    );

    // Apply date filters
    const matchesDateFilters = Object.entries(dateFilters).every(
      ([key, { from, to }]) => {
        if (!from && !to) return true;

        const dateFilter = filters.find(f => f.key === key && f.type === "date");
        if (!dateFilter) return true;

        const value = item[key];
        if (!value) return false;

        // Parse the date from the item
        const itemDate = value instanceof Date ? value : new Date(value);
        
        // Check if it's a valid date
        if (isNaN(itemDate.getTime())) return false;

        // Set time to start of day for comparison
        const normalizedItemDate = new Date(itemDate);
        normalizedItemDate.setHours(0, 0, 0, 0);

        // Check if date is within range
        let isInRange = true;
        
        if (from) {
          const fromDate = new Date(from);
          fromDate.setHours(0, 0, 0, 0);
          isInRange = isInRange && normalizedItemDate >= fromDate;
        }
        
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          isInRange = isInRange && normalizedItemDate <= toDate;
        }
        
        return isInRange;
      }
    );

    return matchesSearch && matchesFilters && matchesDateFilters;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateFilterChange = (key: string, type: 'from' | 'to', date?: Date) => {
    setDateFilters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: date
      }
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setDateFilters({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || 
    Object.values(dateFilters).some(filter => filter.from || filter.to);

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-8"
            />
          </div>
        </div>

        {filters.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <FilterX className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-1">
                  <label className="text-sm font-medium">{filter.label}</label>

                  {filter.type === "select" && filter.options && (
                    <Select
                      value={activeFilters[filter.key]?.toString() || ""}
                      onValueChange={(value) =>
                        handleFilterChange(filter.key, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem
                            key={option.value.toString()}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "boolean" && (
                    <Select
                      value={activeFilters[filter.key]?.toString() || ""}
                      onValueChange={(value) => {
                        if (value === "-1") {
                          handleFilterChange(filter.key, "");
                        } else {
                          handleFilterChange(filter.key, value === "true");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Todos</SelectItem>
                        <SelectItem value="true">
                          {filter.options && filter.options[0]
                            ? filter.options[0].label
                            : "Sí"}
                        </SelectItem>
                        <SelectItem value="false">
                          {filter.options && filter.options[1]
                            ? filter.options[1].label
                            : "No"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "text" && (
                    <Input
                      value={activeFilters[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                    />
                  )}

                  {filter.type === "number" && (
                    <Input
                      type="number"
                      value={activeFilters[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          filter.key,
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                    />
                  )}

                  {filter.type === "date" && (
                    <div className="flex flex-col space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateFilters[filter.key]?.from && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateFilters[filter.key]?.from ? (
                                  format(dateFilters[filter.key].from, "PPP", { locale: es })
                                ) : (
                                  <span>Desde</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={dateFilters[filter.key]?.from}
                                onSelect={(date) => handleDateFilterChange(filter.key, 'from', date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateFilters[filter.key]?.to && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateFilters[filter.key]?.to ? (
                                  format(dateFilters[filter.key].to, "PPP", { locale: es })
                                ) : (
                                  <span>Hasta</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={dateFilters[filter.key]?.to}
                                onSelect={(date) => handleDateFilterChange(filter.key, 'to', date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      {dateFilters[filter.key]?.from || dateFilters[filter.key]?.to ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDateFilters(prev => ({
                              ...prev,
                              [filter.key]: { from: undefined, to: undefined }
                            }));
                          }}
                          className="text-xs self-end"
                        >
                          <FilterX className="h-3 w-3 mr-1" />
                          Limpiar fecha
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border bg-card/60 backdrop-blur">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="font-medium">
                  {column.header}
                </TableHead>
              ))}
              {showActionsColumn && (
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className="animate-fade-in transition-colors hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {columns.map((column) => (
                    <TableCell key={`${item.id}-${column.key}`}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {showActionsColumn && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-8 w-8 hover:text-primary"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onUpdate.func(item)}
                            className="h-8 w-8 hover:text-primary"
                            title={onUpdate.label}
                          >
                            {onUpdate.icon === "coin" && <HandCoins className="h-4 w-4" />}
                          </Button>
                        )}
                        {/* puedes agregar onDelete aquí si lo implementas */}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActionsColumn ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a{" "}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length} registros
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;