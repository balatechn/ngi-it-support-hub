export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "critical" | "high" | "medium" | "low";
export type TicketCategory =
  | "hardware"
  | "software"
  | "network"
  | "account"
  | "printer"
  | "email"
  | "vpn"
  | "security"
  | "other";

export type AssetType =
  | "laptop"
  | "desktop"
  | "monitor"
  | "printer"
  | "mobile"
  | "server"
  | "network"
  | "software_license"
  | "peripheral";

export type AssetStatus = "assigned" | "in_stock" | "in_repair" | "retired" | "lost";
export type UserRole = "employee" | "engineer" | "manager" | "admin";
export type SLATier = "gold" | "silver" | "bronze";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  branch: string;
  avatar?: string;
  teamsId?: string;
  isOnline?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assignedToId?: string;
  assignedToName?: string;
  department: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  dueAt: string;
  slaTier: SLATier;
  slaBreached: boolean;
  tags: string[];
  comments: TicketComment[];
  attachments: Attachment[];
  teamsChannelId?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  type: AssetType;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  assignedToId?: string;
  assignedToName?: string;
  department?: string;
  branch: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string;
  purchasePrice: number;
  specs?: string;
  notes?: string;
  lastAuditDate: string;
}

export interface SLAPolicy {
  id: string;
  tier: SLATier;
  priority: TicketPriority;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationTimeHours: number;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  country: string;
  headCount: number;
  itEngineers: number;
}

export interface KBArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

export interface DashboardStats {
  totalOpen: number;
  inProgress: number;
  resolvedToday: number;
  slaCompliance: number;
  avgResolutionHours: number;
  criticalOpen: number;
  totalThisWeek: number;
  assignedToMe: number;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  resolved: number;
  breached: number;
}

export interface EngineerStats {
  id: string;
  name: string;
  resolved: number;
  avgTime: number;
  slaCompliance: number;
  rating: number;
  open: number;
}
