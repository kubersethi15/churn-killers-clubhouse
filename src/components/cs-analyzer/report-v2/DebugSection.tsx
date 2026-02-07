import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DebugSectionProps {
  title: string;
  data: unknown;
}

export const DebugSection = ({ title, data }: DebugSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const jsonStr = JSON.stringify(data, null, 2);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonStr);
    toast({ title: "Copied!", description: `${title} JSON copied to clipboard` });
  };

  return (
    <Card className="border border-report-border">
      <CardHeader
        className="border-b border-report-border bg-report-surface/50 py-3 px-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <CardTitle className="font-serif text-base font-bold text-report-heading">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-muted-foreground hover:text-foreground">
            <Copy className="w-3 h-3 mr-1" />
            <span className="text-xs">Copy</span>
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-4">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-report-text bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
            {jsonStr}
          </pre>
        </CardContent>
      )}
    </Card>
  );
};
