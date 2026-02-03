import {useState} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  ChevronRight,
  Phone,
  Mail,
  Building2,
  Pencil,
  Trash2,
  FileText,
  ListTodo,
  MessageSquare,
  Send,
} from "lucide-react";
import {getClientById, getCases, getTasks, addClientNote} from "@/services/api";
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  Button,
  Skeleton,
  EmptyState,
  Textarea,
} from "@/components/ui";
import {
  ClientFormModal,
  DeleteConfirmModal,
} from "@/components/features/clients";
import type {ICase, ITask} from "@/types";

type TabType = "notes" | "cases" | "tasks";

const ClientDetail = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Fetch client data
  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });

  // Fetch all cases to filter by client
  const {data: allCases} = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  // Fetch all tasks
  const {data: allTasks} = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  // Filter cases for this client
  const clientCases =
    allCases?.filter((c) => {
      const clientId = typeof c.client === "string" ? c.client : c.client?._id;
      return clientId === id;
    }) || [];

  // Filter tasks for this client's cases
  const clientCaseIds = clientCases.map((c) => c._id);
  const clientTasks =
    allTasks?.filter((t) => {
      const caseId =
        typeof t.relatedCase === "string" ? t.relatedCase : t.relatedCase?._id;
      return caseId && clientCaseIds.includes(caseId);
    }) || [];

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: () =>
      addClientNote(id!, {content: newNote, author: "Current User"}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["client", id]});
      setNewNote("");
    },
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate();
    }
  };

  const handleDeleted = () => {
    navigate("/clients");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <EmptyState
        title="Client not found"
        description="The client you're looking for doesn't exist or has been deleted."
        action={
          <Link to="/clients">
            <Button>Back to Clients</Button>
          </Link>
        }
      />
    );
  }

  const tabs = [
    {
      id: "notes" as TabType,
      label: "Notes",
      icon: MessageSquare,
      count: client.notes?.length || 0,
    },
    {
      id: "cases" as TabType,
      label: "Cases",
      icon: FileText,
      count: clientCases.length,
    },
    {
      id: "tasks" as TabType,
      label: "Tasks",
      icon: ListTodo,
      count: clientTasks.length,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "secondary" | "default"> = {
      active: "success",
      inactive: "secondary",
      prospect: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getCaseBadge = (status: ICase["status"]) => {
    const variants: Record<
      string,
      "default" | "secondary" | "warning" | "success"
    > = {
      intake: "default",
      discovery: "secondary",
      trial: "warning",
      closed: "success",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTaskBadge = (status: ITask["status"]) => {
    const variants: Record<string, "default" | "warning" | "success"> = {
      pending: "default",
      "in-progress": "warning",
      completed: "success",
    };
    return <Badge variant={variants[status]}>{status.replace("-", " ")}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-200">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          to="/clients"
          className="hover:text-slate-700 dark:hover:text-slate-200">
          Clients
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100 font-medium">
          {client.name}
        </span>
      </nav>

      {/* Header */}
      <PageHeader
        title={client.name}
        description={client.companyName || "Individual Client"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        }
      />

      {/* Client Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email
                </p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {client.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phone
                </p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {client.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Company
                </p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {client.companyName || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Status
                </p>
                {getStatusBadge(client.status)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          {/* Add Note */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addNoteMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          {client.notes && client.notes.length > 0 ? (
            client.notes
              .slice()
              .reverse()
              .map((note, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">{note.author}</span>
                      <span>•</span>
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <EmptyState
              title="No notes yet"
              description="Add a note to keep track of important information."
            />
          )}
        </div>
      )}

      {activeTab === "cases" && (
        <div className="space-y-4">
          {clientCases.length > 0 ? (
            clientCases.map((caseItem) => (
              <Card key={caseItem._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {caseItem.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        #{caseItem.caseNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getCaseBadge(caseItem.status)}
                      <Badge
                        variant={
                          caseItem.priority === "high"
                            ? "destructive"
                            : "secondary"
                        }>
                        {caseItem.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No cases"
              description="This client doesn't have any cases yet."
            />
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-4">
          {clientTasks.length > 0 ? (
            clientTasks.map((task) => (
              <Card key={task._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getTaskBadge(task.status)}
                      <Badge
                        variant={
                          task.priority === "high" ? "destructive" : "secondary"
                        }>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No tasks"
              description="No tasks related to this client's cases."
            />
          )}
        </div>
      )}

      {/* Modals */}
      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        clientId={client._id}
        clientName={client.name}
        onDeleted={handleDeleted}
      />
    </div>
  );
};

export default ClientDetail;
