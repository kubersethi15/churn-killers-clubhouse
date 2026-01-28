import { ParsedSection, KeyValue, ActionItem, Stakeholder, PostureType } from "./types";

// Parse the markdown into sections by headers
export const parseIntoSections = (markdown: string): ParsedSection[] => {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const h3Match = line.match(/^### (.+)/);
    const h2Match = line.match(/^## (.+)/);
    
    if (h3Match || h2Match) {
      if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        sections.push(currentSection);
      }
      
      currentSection = {
        title: (h3Match?.[1] || h2Match?.[1] || "").trim(),
        content: "",
        level: h3Match ? 3 : 2,
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    }
  }
  
  if (currentSection) {
    currentSection.content = contentLines.join("\n").trim();
    sections.push(currentSection);
  }
  
  return sections;
};

// Extract key-value pairs from content like "**Key:** Value"
// Excludes "One-Line Truth" since it's rendered separately as Strategic Truth
export const extractKeyValues = (content: string): KeyValue[] => {
  const pairs: KeyValue[] = [];
  const regex = /\*\*([^*]+):\*\*\s*([^\n]+)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const key = match[1].trim();
    // Skip One-Line Truth - it's shown separately as Strategic Truth
    if (key.toLowerCase().includes("one-line truth") || key.toLowerCase().includes("one line truth")) {
      continue;
    }
    pairs.push({ key, value: match[2].trim() });
  }
  
  return pairs;
};

// Get posture type from string
export const getPostureType = (value: string): PostureType => {
  const lower = value.toLowerCase();
  if (lower.includes("green") || lower.includes("strong") || lower.includes("high") || lower.includes("positive") || lower.includes("supporter")) {
    return "green";
  }
  if (lower.includes("red") || lower.includes("weak") || lower.includes("critical") || lower.includes("negative") || lower.includes("skeptic") || lower.includes("low")) {
    return "red";
  }
  if (lower.includes("amber") || lower.includes("medium") || lower.includes("moderate") || lower.includes("mixed")) {
    return "amber";
  }
  return "neutral";
};

// Parse action items from content
export const parseActionItems = (content: string): ActionItem[] => {
  const actions: ActionItem[] = [];
  const lines = content.split("\n").filter(l => l.trim());
  let currentAction: ActionItem | null = null;
  
  for (const line of lines) {
    const numberedMatch = line.match(/^\d+\.\s*\*\*(.+?)\*\*/);
    const bulletMatch = line.match(/^[-•]\s*\*\*(.+?)\*\*/);
    const actionMatch = line.match(/^\d+\.\s*(.+)/);
    
    if (numberedMatch || bulletMatch || actionMatch) {
      if (currentAction) actions.push(currentAction);
      currentAction = {
        action: numberedMatch?.[1] || bulletMatch?.[1] || actionMatch?.[1] || "",
        owner: "",
        when: "",
        reason: "",
      };
    }
    
    if (currentAction) {
      const ownerMatch = line.match(/Owner[:\s]*([^\n,]+)/i);
      const whenMatch = line.match(/When[:\s]*([^\n,]+)/i);
      const reasonMatch = line.match(/Reason[:\s]*([^\n]+)/i);
      
      if (ownerMatch) currentAction.owner = ownerMatch[1].trim();
      if (whenMatch) currentAction.when = whenMatch[1].trim();
      if (reasonMatch) currentAction.reason = reasonMatch[1].trim();
    }
  }
  
  if (currentAction) actions.push(currentAction);
  return actions;
};

// Parse stakeholders from content
export const parseStakeholders = (content: string): Stakeholder[] => {
  const stakeholders: Stakeholder[] = [];
  const lines = content.split("\n");
  
  for (const line of lines) {
    const match = line.match(/[-•]\s*\*\*([^*]+)\*\*[:\s]*([^,]+),?\s*(supporter|neutral|skeptic|unknown)?/i);
    if (match) {
      stakeholders.push({
        name: match[1].trim(),
        role: match[2].trim(),
        posture: match[3] || "unknown",
      });
    }
  }
  
  return stakeholders;
};

// Parse questions grouped by category
export const parseQuestions = (content: string): { [key: string]: string[] } => {
  const categories: { [key: string]: string[] } = {};
  let currentCategory = "General";
  
  const lines = content.split("\n");
  for (const line of lines) {
    const categoryMatch = line.match(/^[-•]?\s*\*\*([^*]+)\*\*/);
    const questionMatch = line.match(/^[-•]\s*(.+\?)/);
    
    if (categoryMatch && !line.includes("?")) {
      currentCategory = categoryMatch[1].trim();
      if (!categories[currentCategory]) categories[currentCategory] = [];
    } else if (questionMatch) {
      if (!categories[currentCategory]) categories[currentCategory] = [];
      categories[currentCategory].push(questionMatch[1].trim());
    }
  }
  
  return categories;
};

// Extract one-line truth from content
export const extractOneLinerTruth = (content: string): string | null => {
  const match = content.match(/One-line truth[:\s]*(.+)/i);
  return match ? match[1].trim() : null;
};
