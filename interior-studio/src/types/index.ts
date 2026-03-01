export type UserRole = "CLIENT" | "DESIGNER" | "ADMIN";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type RenderStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED" | "PUBLISHED";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}
