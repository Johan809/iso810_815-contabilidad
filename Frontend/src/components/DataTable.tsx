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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface Filter {
  key: string;
  label: string;
  type: "select" | "boolean" | "number" | "text";
  options?: FilterOption[];
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
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  filters = [],
  onUpdate = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;
  const showActionsColumn = !!onEdit || !!onUpdate || !!onDelete;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchTerm]);

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

    // Then apply specific filters
    const matchesFilters = Object.entries(activeFilters).every(
      ([key, value]) => {
        //ignoring null values
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

    return matchesSearch && matchesFilters;
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

  const clearFilters = () => {
    setActiveFilters({});
  };

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

            {Object.keys(activeFilters).length > 0 && (
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
                  colSpan={columns.length + 1}
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
