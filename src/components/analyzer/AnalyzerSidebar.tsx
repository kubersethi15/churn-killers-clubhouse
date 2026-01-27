import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyses, Analysis } from "@/hooks/useAnalyses";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FileText,
  Presentation,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Trash2,
  Loader2,
  ChevronDown,
  Home,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AnalyzerSidebarProps {
  onSelectAnalysis: (analysis: Analysis) => void;
  onNewAnalysis: () => void;
  selectedAnalysisId?: string;
}

const analysisTypeIcons: Record<string, React.ReactNode> = {
  "call-transcript": <MessageSquare className="h-4 w-4" />,
  "qbr-deck": <Presentation className="h-4 w-4" />,
  "success-plan": <Target className="h-4 w-4" />,
  "health-assessment": <FileText className="h-4 w-4" />,
};

const analysisTypeLabels: Record<string, string> = {
  "call-transcript": "Call Transcript",
  "qbr-deck": "QBR Deck",
  "success-plan": "Success Plan",
  "health-assessment": "Health Assessment",
};

export const AnalyzerSidebar = ({
  onSelectAnalysis,
  onNewAnalysis,
  selectedAnalysisId,
}: AnalyzerSidebarProps) => {
  const { user, profile, signOut } = useAuth();
  const { analyses, isLoading, deleteAnalysis } = useAnalyses();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);

    const { error } = await deleteAnalysis(id);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed.",
      });
      if (selectedAnalysisId === id) {
        onNewAnalysis();
      }
    }

    setDeletingId(null);
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <Link to="/" className="flex-1">
              <h1 className="text-lg font-serif font-bold text-sidebar-foreground">
                <span className="text-red">CS</span> Analyzer
              </h1>
            </Link>
          )}
          <SidebarTrigger className="text-sidebar-foreground" />
        </div>

        {!collapsed && (
          <Button
            onClick={onNewAnalysis}
            className="w-full mt-4 bg-red hover:bg-red-dark text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        )}

        {collapsed && (
          <Button
            onClick={onNewAnalysis}
            className="w-full mt-4 bg-red hover:bg-red-dark text-white"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {!user ? (
            <div className="p-4 text-center">
              {!collapsed && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to save and view your analysis history
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/auth", { state: { from: "/cs-analyzer" } })}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-4 text-center">
              {!collapsed && (
                <p className="text-sm text-muted-foreground">
                  No analyses yet. Start by creating a new analysis.
                </p>
              )}
            </div>
          ) : (
            <SidebarMenu className="p-2">
              {analyses.map((analysis) => (
                <SidebarMenuItem key={analysis.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectAnalysis(analysis)}
                    isActive={selectedAnalysisId === analysis.id}
                    className="group relative"
                    tooltip={collapsed ? analysis.title : undefined}
                  >
                    <span className="text-muted-foreground">
                      {analysisTypeIcons[analysis.analysis_type] || (
                        <FileText className="h-4 w-4" />
                      )}
                    </span>
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {analysis.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(analysis.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    )}
                    {!collapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, analysis.id)}
                        disabled={deletingId === analysis.id}
                      >
                        {deletingId === analysis.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={collapsed ? "Home" : undefined}>
              <Link to="/">
                <Home className="h-4 w-4" />
                {!collapsed && <span>Back to Home</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {user && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <div className="w-6 h-6 rounded-full bg-red/10 flex items-center justify-center text-red text-xs font-medium">
                      {initials}
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{displayName}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
