export interface ParsedSection {
  title: string;
  content: string;
  level: number;
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface ActionItem {
  action: string;
  owner: string;
  when: string;
  reason: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  posture: string;
  power: string;
  evidence: string;
}

export type PostureType = 'green' | 'amber' | 'red' | 'neutral';

// Severity badge types for Executive Snapshot
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface SeverityMetric {
  key: string;
  value: string;
  level: SeverityLevel;
}
