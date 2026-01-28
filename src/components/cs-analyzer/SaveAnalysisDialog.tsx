import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FolderPlus, Folder, FileText } from "lucide-react";
import { AnalysisGroup } from "@/hooks/useAnalysisGroups";

type SaveOption = "existing" | "new" | "standalone";

interface SaveAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: AnalysisGroup[];
  onSave: (groupId: string | null, newGroupName?: string) => Promise<void>;
  isSaving: boolean;
  suggestedTitle: string;
}

export const SaveAnalysisDialog = ({
  open,
  onOpenChange,
  groups,
  onSave,
  isSaving,
  suggestedTitle,
}: SaveAnalysisDialogProps) => {
  const [saveOption, setSaveOption] = useState<SaveOption>(
    groups.length > 0 ? "existing" : "new"
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");

  const handleSave = async () => {
    if (saveOption === "existing" && selectedGroupId) {
      await onSave(selectedGroupId);
    } else if (saveOption === "new" && newGroupName.trim()) {
      await onSave(null, newGroupName.trim());
    } else {
      await onSave(null);
    }
    
    // Reset form
    setSaveOption(groups.length > 0 ? "existing" : "new");
    setSelectedGroupId("");
    setNewGroupName("");
  };

  const isValid =
    saveOption === "standalone" ||
    (saveOption === "existing" && selectedGroupId) ||
    (saveOption === "new" && newGroupName.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Analysis</DialogTitle>
          <DialogDescription>
            Choose how to organize "{suggestedTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={saveOption}
            onValueChange={(v) => setSaveOption(v as SaveOption)}
            className="space-y-3"
          >
            {groups.length > 0 && (
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="existing" id="existing" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="existing" className="flex items-center gap-2 cursor-pointer">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    Add to existing group
                  </Label>
                  {saveOption === "existing" && (
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="new" id="new" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="new" className="flex items-center gap-2 cursor-pointer">
                  <FolderPlus className="h-4 w-4 text-muted-foreground" />
                  Create new group
                </Label>
                {saveOption === "new" && (
                  <Input
                    placeholder="e.g., Acme Corp, Q1 Renewals, Enterprise Accounts"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    maxLength={50}
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="standalone" id="standalone" className="mt-1" />
              <Label htmlFor="standalone" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Keep as standalone (no group)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Analysis"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
