import {useState, useMemo, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import {getUsers} from "@/services/api";
import {PageHeader, Button, Card, Badge, Skeleton} from "@/components/ui";
import {UserFormModal, DeleteUserModal} from "@/components/features/team";
import type {IUser} from "@/types";

const roleOptions = [
  {value: "all", label: "All Roles"},
  {value: "partner", label: "Partner"},
  {value: "associate", label: "Associate"},
  {value: "paralegal", label: "Paralegal"},
  {value: "staff", label: "Staff"},
];

const getRoleVariant = (role: IUser["role"]) => {
  const variants = {
    partner: "default" as const,
    associate: "secondary" as const,
    paralegal: "warning" as const,
    staff: "outline" as const,
  };
  return variants[role];
};

const Team = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // Read filter from URL query params on mount
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (
      roleParam &&
      ["partner", "associate", "paralegal", "staff"].includes(roleParam)
    ) {
      setRoleFilter(roleParam);
    }
  }, [searchParams]);

  const {data: users, isLoading} = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [users, searchQuery, roleFilter]);

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleDelete = (user: IUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Team"
          description="Manage your ABC Law Firm team members."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage your ABC Law Firm team members."
        actions={
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-amber-500"
          />
        </div>

        {/* Role Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-500">
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Team Grid */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No team members found.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {user.name}
                    </h3>
                    <Badge
                      variant={getRoleVariant(user.role)}
                      className="capitalize mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.specialties && user.specialties.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {user.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          {s}
                        </span>
                      ))}
                      {user.specialties.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          +{user.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        userData={selectedUser}
      />
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        userData={selectedUser}
      />
    </div>
  );
};

export default Team;
