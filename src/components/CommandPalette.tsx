import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Global ⌘K command palette.
 *
 * Mounted once in App.tsx. Listens for Cmd/Ctrl+K (and the / key on focus-free
 * areas) and surfaces quick navigation. Power-user feature; also signals
 * product maturity to anyone who tries it.
 */
export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Where to? Type a destination or command…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="CS Analyzer">
          <CommandItem onSelect={() => go("/cs-analyzer")}>
            <Sparkles className="mr-2 h-4 w-4 text-red" />
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
