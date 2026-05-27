import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Sparkles,
  FileText,
  BookOpen,
  Layers,
  ArrowRight,
  LogIn,
  LogOut,
  Home,
  Mail,
  Search,
  Copy,
  Share2,
  Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Global ⌘K command palette — context-aware per route.
 *
 * Each route declares its own commands via window events (lightweight
 * pub-sub). Pages dispatch a `cs-palette-set-context` event with their
 * commands when they mount, and clear them on unmount. The palette merges
 * those commands with the global navigation set.
 *
 * This means: on the analyzer page, ⌘K shows analyzer-specific actions
 * (Run new analysis, Jump to transcript). On a shared report, it shows
 * "Copy link" / "Open in new tab". On the newsletter, "Subscribe". Etc.
 */

export interface PaletteCommand {
  id: string;
  label: string;
  hint?: string;
  icon?: "search" | "copy" | "share" | "download" | "sparkles" | "file" | "layers" | "arrow";
  run: () => void;
}

const iconMap = {
  search: Search,
  copy: Copy,
  share: Share2,
  download: Download,
  sparkles: Sparkles,
  file: FileText,
  layers: Layers,
  arrow: ArrowRight,
} as const;

const CONTEXT_EVENT = "cs-palette-set-context";

/**
 * Helper hook for pages — registers context-specific commands while mounted.
 *
 * Usage:
 *   usePaletteContext("transcript-page", [
 *     { id: "search", label: "Search transcript", icon: "search", run: () => focusSearch() },
 *   ]);
 */
export const usePaletteContext = (contextId: string, commands: PaletteCommand[]) => {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(CONTEXT_EVENT, { detail: { contextId, commands } })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent(CONTEXT_EVENT, { detail: { contextId, commands: [] } })
      );
    };
  }, [contextId, commands]);
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [contextCommands, setContextCommands] = useState<PaletteCommand[]>([]);
  const [contextLabel, setContextLabel] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Listen for context updates from pages
  useEffect(() => {
    const onContext = (e: Event) => {
      const detail = (e as CustomEvent).detail as { contextId: string; commands: PaletteCommand[] };
      setContextCommands(detail.commands || []);
    };
    window.addEventListener(CONTEXT_EVENT, onContext);
    return () => window.removeEventListener(CONTEXT_EVENT, onContext);
  }, []);

  // Derive a friendly section label based on route
  useEffect(() => {
    if (location.pathname.startsWith("/cs-analyzer/share")) setContextLabel("This report");
    else if (location.pathname.startsWith("/cs-analyzer/demo")) setContextLabel("Demo");
    else if (location.pathname === "/cs-analyzer") setContextLabel("Analyzer");
    else if (location.pathname.startsWith("/newsletter")) setContextLabel("Newsletter");
    else if (location.pathname.startsWith("/playbook")) setContextLabel("Playbook");
    else setContextLabel("");
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close palette when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const runContext = (cmd: PaletteCommand) => {
    setOpen(false);
    // Defer so the dialog closes before the action fires (avoids focus fights)
    setTimeout(() => cmd.run(), 0);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Where to? Type a destination or command…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        {/* Page-specific commands first when present */}
        {contextCommands.length > 0 && (
          <>
            <CommandGroup heading={contextLabel || "This page"}>
              {contextCommands.map((cmd) => {
                const Icon = cmd.icon ? iconMap[cmd.icon] : Sparkles;
                return (
                  <CommandItem key={cmd.id} onSelect={() => runContext(cmd)}>
                    <Icon className="mr-2 h-4 w-4 text-red" />
                    <span>{cmd.label}</span>
                    {cmd.hint && (
                      <span className="ml-auto text-xs text-muted-foreground">{cmd.hint}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="CS Analyzer">
          <CommandItem onSelect={() => go("/cs-analyzer")}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>New analysis</span>
            <span className="ml-auto text-xs text-muted-foreground">Run a transcript</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/cs-analyzer/demo")}>
            <Layers className="mr-2 h-4 w-4" />
            <span>See an example report</span>
            <span className="ml-auto text-xs text-muted-foreground">Public demo</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Newsletter">
          <CommandItem onSelect={() => go("/newsletters")}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Past newsletters</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/start")}>
            <ArrowRight className="mr-2 h-4 w-4" />
            <span>Start here — best issues</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/playbook")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Playbook Vault</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/ai-exposure-score")}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI Exposure Score</span>
            <span className="ml-auto text-xs text-muted-foreground">2-min quiz</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/about")}>
            <Mail className="mr-2 h-4 w-4" />
            <span>About</span>
          </CommandItem>
        </CommandGroup>

        {user ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem
                onSelect={async () => {
                  setOpen(false);
                  await signOut();
                  navigate("/");
                }}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => go("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign in</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};
