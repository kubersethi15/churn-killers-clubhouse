import { ParsedSection, KeyValue, ActionItem, Stakeholder, PostureType, SeverityLevel, SeverityMetric } from "./types";

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
    if (key.toLowerCase().includes("one-line truth") || key.toLowerCase().includes("one line truth") || key.toLowerCase().includes("strategic truth")) {
      continue;
    }
    pairs.push({ key, value: match[2].trim() });
  }
  
  return pairs;
};

// Get posture type from string
export const getPostureType = (value: string): PostureType => {
  const lower = value.toLowerCase();
  if (lower.includes("green") || lower.includes("strong") || lower.includes("high") || lower.includes("positive") || lower.includes("supporter") || lower.includes("champion")) {
    return "green";
  }
  if (lower.includes("red") || lower.includes("weak") || lower.includes("critical") || lower.includes("negative") || lower.includes("skeptic") || lower.includes("low") || lower.includes("churn") || lower.includes("displacement")) {
    return "red";
  }
  if (lower.includes("amber") || lower.includes("medium") || lower.includes("moderate") || lower.includes("mixed") || lower.includes("fragile") || lower.includes("downsell")) {
    return "amber";
  }
  return "neutral";
};

// Get severity level for metrics (more granular than posture)
export const getSeverityLevel = (key: string, value: string): SeverityLevel => {
  const lowerKey = key.toLowerCase();
  const lowerValue = value.toLowerCase();
  
  // Revenue Threat Level mapping
  if (lowerKey.includes("revenue") && lowerKey.includes("threat")) {
    if (lowerValue.includes("churn") || lowerValue.includes("critical")) return "critical";
    if (lowerValue.includes("displacement") || lowerValue.includes("competitive")) return "high";
    if (lowerValue.includes("downsell")) return "medium";
    if (lowerValue.includes("none")) return "none";
    return "low";
  }
  
  // Account Posture mapping
  if (lowerKey.includes("account") && lowerKey.includes("posture")) {
    if (lowerValue.includes("red")) return "critical";
    if (lowerValue.includes("amber")) return "medium";
    if (lowerValue.includes("green")) return "none";
    return "low";
  }
  
  // Champion Strength mapping
  if (lowerKey.includes("champion")) {
    if (lowerValue.includes("weak")) return "critical";
    if (lowerValue.includes("fragile")) return "high";
    if (lowerValue.includes("moderate")) return "medium";
    if (lowerValue.includes("strong")) return "none";
    return "low";
  }
  
  // Commercial/Political Risk mapping
  if (lowerKey.includes("risk") || lowerKey.includes("complexity")) {
    if (lowerValue.includes("high") || lowerValue.includes("critical")) return "critical";
    if (lowerValue.includes("medium")) return "medium";
    if (lowerValue.includes("low")) return "none";
    return "low";
  }
  
  // Default based on common value patterns
  const posture = getPostureType(value);
  if (posture === "red") return "high";
  if (posture === "amber") return "medium";
  if (posture === "green") return "none";
  return "low";
};

// Extract severity metrics for Executive Snapshot
export const extractSeverityMetrics = (content: string): SeverityMetric[] => {
  const keyValues = extractKeyValues(content);
  return keyValues.map(kv => ({
    key: kv.key,
    value: kv.value,
    level: getSeverityLevel(kv.key, kv.value),
  }));
};

// Parse action items from content (handles both list and table formats)
export const parseActionItems = (content: string): ActionItem[] => {
  const actions: ActionItem[] = [];
  const lines = content.split("\n").filter(l => l.trim());
  
  // First, try to parse as markdown table
  const tableMatch = content.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
  if (tableMatch && tableMatch.length > 2) {
    // Skip header and separator rows
    const dataRows = tableMatch.slice(2);
    for (const row of dataRows) {
      const cells = row.split("|").filter(c => c.trim()).map(c => c.trim());
      if (cells.length >= 3) {
        actions.push({
          action: cells[0]?.replace(/\*\*/g, "") || "",
          owner: cells[1] || "",
          when: cells[2] || "",
          reason: cells[3] || "",
        });
      }
    }
    if (actions.length > 0) return actions;
  }
  
  // Fallback to list parsing
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
      const ownerMatch = line.match(/Owner[:\s]*([^\n,|]+)/i);
      const timelineMatch = line.match(/Timeline[:\s]*([^\n,|]+)/i);
      const whenMatch = line.match(/When[:\s]*([^\n,|]+)/i);
      const reasonMatch = line.match(/Reason[:\s]*([^\n|]+)/i);
      
      if (ownerMatch) currentAction.owner = ownerMatch[1].trim();
      if (timelineMatch) currentAction.when = timelineMatch[1].trim();
      if (whenMatch) currentAction.when = whenMatch[1].trim();
      if (reasonMatch) currentAction.reason = reasonMatch[1].trim();
    }
  }
  
  if (currentAction) actions.push(currentAction);
  return actions;
};

// Parse stakeholders from content (handles both list and table formats)
export const parseStakeholders = (content: string): Stakeholder[] => {
  const stakeholders: Stakeholder[] = [];
  const lines = content.split("\n");
  
  // First, try to parse as markdown table
  // Look for table with columns: Stakeholder | Role | Posture | Power Level | Evidence
  const tableLines = lines.filter(l => l.includes("|"));
  if (tableLines.length > 2) {
    // Find header row to identify column positions
    const headerLine = tableLines[0]?.toLowerCase() || "";
    const hasStakeholder = headerLine.includes("stakeholder") || headerLine.includes("name");
    const hasRole = headerLine.includes("role");
    const hasPosture = headerLine.includes("posture");
    const hasPower = headerLine.includes("power");
    const hasEvidence = headerLine.includes("evidence");
    
    if (hasStakeholder && hasRole) {
      // Skip header and separator rows
      const dataRows = tableLines.slice(2);
      for (const row of dataRows) {
        const cells = row.split("|").filter(c => c.trim()).map(c => c.trim());
        if (cells.length >= 2 && cells[0] && !cells[0].includes("---")) {
          stakeholders.push({
            name: cells[0]?.replace(/\*\*/g, "") || "",
            role: cells[1]?.replace(/\*\*/g, "") || "",
            posture: cells[2]?.replace(/\*\*/g, "") || "Unknown",
            power: cells[3]?.replace(/\*\*/g, "") || "Unknown",
            evidence: cells[4]?.replace(/\*\*/g, "") || "",
          });
        }
      }
      if (stakeholders.length > 0) return stakeholders;
    }
  }
  
  // Fallback to list parsing
  for (const line of lines) {
    const match = line.match(/[-•]\s*\*\*([^*]+)\*\*[:\s]*([^,]+),?\s*(supporter|neutral|skeptic|unknown|champion)?/i);
    if (match) {
      stakeholders.push({
        name: match[1].trim(),
        role: match[2].trim(),
        posture: match[3] || "unknown",
        power: "Unknown",
        evidence: "",
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
  // Try multiple patterns for strategic truth
  const patterns = [
    /One-line Strategic Truth[:\s]*(.+)/i,
    /One-line truth[:\s]*(.+)/i,
    /Strategic Truth[:\s]*(.+)/i,
    /\*\*One-line Strategic Truth:\*\*\s*(.+)/i,
    /\*\*Strategic Truth:\*\*\s*(.+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
};

// Check if section has meaningful content (not just placeholder)
export const hasMeaningfulContent = (content: string): boolean => {
  const trimmed = content.trim();
  if (!trimmed) return false;
  
  // Check for placeholder phrases
  const placeholderPatterns = [
    /not enough information/i,
    /no data available/i,
    /insufficient evidence/i,
    /^[-•\s]*$/,
  ];
  
  for (const pattern of placeholderPatterns) {
    if (pattern.test(trimmed)) return false;
  }
  
  return true;
};
