import {useState} from "react";
import {Plus} from "lucide-react";
import {PageHeader, Button} from "@/components/ui";
import {
  ClientList,
  ClientFormModal,
  DeleteConfirmModal,
} from "@/components/features/clients";
import type {IClient} from "@/types";

const Clients = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [deletingClient, setDeletingClient] = useState<IClient | null>(null);

  const handleNewClient = () => {
    setEditingClient(null);
    setIsFormModalOpen(true);
  };

  const handleEditClient = (client: IClient) => {
    setEditingClient(client);
    setIsFormModalOpen(true);
  };

  const handleDeleteClient = (client: IClient) => {
    setDeletingClient(client);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingClient(null);
  };

  const handleCloseDeleteModal = () => {
    setDeletingClient(null);
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client relationships and contact information."
        actions={
          <Button onClick={handleNewClient}>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        }
      />

      <ClientList onEdit={handleEditClient} onDelete={handleDeleteClient} />

      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        client={editingClient}
      />

      {deletingClient && (
        <DeleteConfirmModal
          isOpen={!!deletingClient}
          onClose={handleCloseDeleteModal}
          clientId={deletingClient._id}
          clientName={deletingClient.name}
        />
      )}
    </div>
  );
};

export default Clients;
