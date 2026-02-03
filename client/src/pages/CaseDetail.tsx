import {useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {
  ChevronRight,
  Calendar,
  User,
  Building2,
  Edit,
  Trash2,
  FileText,
  CheckSquare,
  MessageSquare,
  Clock,
} from "lucide-react";
import {getCaseById, getTasksByCase, getClientById} from "@/services/api";
import {
  Card,
  Badge,
  Button,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import {CaseFormModal, DeleteCaseModal} from "@/components/features/cases";
import {TaskFormModal} from "@/components/features/tasks";
import type {ICase, IClient, IUser} from "@/types";

const getPriorityVariant = (priority: ICase["priority"]) => {
  const variants = {
    high: "destructive" as const,
    medium: "warning" as const,
    low: "secondary" as const,
  };
  return variants[priority];
};

const getStatusVariant = (status: ICase["status"]) => {
  const variants = {
    intake: "default" as const,
    discovery: "secondary" as const,
    trial: "warning" as const,
    closed: "success" as const,
  };
  return variants[status];
};

export default function CaseDetail() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const {data: caseData, isLoading} = useQuery({
    queryKey: ["case", id],
    queryFn: () => getCaseById(id!),
    enabled: !!id,
  });

  const {data: tasks} = useQuery({
    queryKey: ["tasks", "case", id],
    queryFn: () => getTasksByCase(id!),
    enabled: !!id,
  });

  const clientId =
    typeof caseData?.client === "string"
      ? caseData.client
      : caseData?.client?._id;
  const {data: clientData} = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId!),
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Case not found</p>
        <Button variant="link" onClick={() => navigate("/cases")}>
          Back to Cases
        </Button>
      </div>
    );
  }

  const clientName =
    clientData?.name ||
    (typeof caseData.client === "object"
      ? (caseData.client as IClient).name
      : "Unknown Client");
  const assignedUser =
    Array.isArray(caseData.assignedTeam) && caseData.assignedTeam.length > 0
      ? (caseData.assignedTeam[0] as IUser)
      : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-200">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          to="/cases"
          className="hover:text-slate-700 dark:hover:text-slate-200">
          Cases
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          {caseData.caseNumber}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {caseData.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono">
            {caseData.caseNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Client
              </p>
              <Link
                to={`/clients/${clientId}`}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                {clientName}
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assigned To
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {assignedUser?.name || "Unassigned"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deadline
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {caseData.deadline
                  ? new Date(caseData.deadline).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={getStatusVariant(caseData.status)}
              className="capitalize">
              {caseData.status}
            </Badge>
            <Badge
              variant={getPriorityVariant(caseData.priority)}
              className="capitalize">
              {caseData.priority}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="w-4 h-4 mr-2" />
            Tasks ({tasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity">
            <MessageSquare className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Case Description
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {caseData.stage
                ? `Current Stage: ${caseData.stage}`
                : "No description available for this case."}
            </p>
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
              <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Status Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Case created - Status:{" "}
                    <Badge
                      variant={getStatusVariant(caseData.status)}
                      className="capitalize ml-1">
                      {caseData.status}
                    </Badge>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="p-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No documents attached to this case yet.
              </p>
              <Button variant="outline" className="mt-4">
                Upload Document
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                Related Tasks
              </h3>
              <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
                Create Task
              </Button>
            </div>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {task.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in-progress"
                            ? "warning"
                            : "secondary"
                      }>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  No tasks associated with this case.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="p-6">
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No recent activity on this case.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <CaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        caseData={caseData}
      />
      <DeleteCaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        caseData={caseData}
        redirectOnDelete
      />
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        prefilledCaseId={id}
      />
    </div>
  );
}
