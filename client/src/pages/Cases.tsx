import {useState} from "react";
import {CaseKanban, CaseFormModal} from "@/components/features/cases";
import {PageHeader, Button} from "@/components/ui";
import {Plus} from "lucide-react";

const Cases = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Case Management"
        description="Track and manage all your legal cases in one place."
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        }
      />
      <CaseKanban />
      <CaseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Cases;
