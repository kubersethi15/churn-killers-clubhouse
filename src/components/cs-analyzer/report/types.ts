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
}

export type PostureType = 'green' | 'amber' | 'red' | 'neutral';
