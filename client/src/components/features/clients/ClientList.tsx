import {useState, useMemo, useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {
  Search,
  Phone,
  Mail,
  FileText,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {getClients} from "@/services/api";
import {
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import type {IClient} from "@/types";

interface ClientListProps {
  onEdit: (client: IClient) => void;
  onDelete: (client: IClient) => void;
}

const statusOptions = [
  {value: "all", label: "All Statuses"},
  {value: "active", label: "Active"},
  {value: "inactive", label: "Inactive"},
  {value: "prospect", label: "Prospect"},
];

export function ClientList({onEdit, onDelete}: ClientListProps) {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Read filter from URL query params on mount
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (
      statusParam &&
      ["active", "inactive", "prospect"].includes(statusParam)
    ) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  const {
    data: clients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const filteredClients = useMemo(() => {
    if (!clients) return [];

    return clients.filter((client) => {
      // Status filter
      if (statusFilter !== "all" && client.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.companyName?.toLowerCase().includes(query) ?? false)
        );
      }

      return true;
    });
  }, [clients, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<span className="text-4xl">⚠️</span>}
        title="Error loading clients"
        description="There was a problem fetching the client data. Please try again."
      />
    );
  }

  const getStatusBadge = (status: IClient["status"]) => {
    const variants = {
      active: "success" as const,
      inactive: "secondary" as const,
      prospect: "default" as const,
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-500">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Results */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title={
            searchQuery || statusFilter !== "all"
              ? "No clients found"
              : "No clients yet"
          }
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Create your first client to get started."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card
              key={client._id}
              className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {client.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {client.companyName || "Individual"}
                    </p>
                  </div>
                  {getStatusBadge(client.status)}
                </div>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{client.totalMatters} Matters</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link to={`/clients/${client._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(client)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(client)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientList;
