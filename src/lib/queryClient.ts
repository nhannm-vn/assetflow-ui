import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys tập trung — tránh gõ tay chuỗi rải rác, dễ invalidate đúng phạm vi.
export const qk = {
  assets: (filters?: unknown) => ["assets", filters] as const,
  asset: (id: number) => ["assets", "detail", id] as const,
  categories: ["categories"] as const,
  locations: ["locations"] as const,
  suppliers: ["suppliers"] as const,
  departments: ["departments"] as const,
  workflows: ["workflows"] as const,
  approvalRoles: ["approval-roles"] as const,
  approvalSteps: (workflowId: number) => ["approval-steps", workflowId] as const,
  departmentWorkflows: ["department-workflows"] as const,
  departmentWorkflowsByDepartment: (departmentId: number) =>
    ["department-workflows", "department", departmentId] as const,
  departmentWorkflowsByWorkflow: (workflowId: number) =>
    ["department-workflows", "workflow", workflowId] as const,
  userApprovalRoles: ["user-approval-roles"] as const,
  userApprovalRolesByUser: (userId: number) => ["user-approval-roles", "user", userId] as const,
  users: ["users"] as const,
  myRequests: ["asset-requests", "my"] as const,
  adminRequests: ["asset-requests", "admin"] as const,
  assetRequest: (id: number) => ["asset-requests", id] as const,
  requestDetailAdmin: (id: number) => ["asset-requests", id, "admin-detail"] as const,
  requestHistory: (id: number) => ["asset-requests", id, "history"] as const,
  pendingApprovals: ["approvals", "pending"] as const,
  myAssignments: ["assignments", "my"] as const,
  adminAssignments: ["assignments", "admin"] as const,
  assignment: (id: number) => ["assignments", id] as const,
  dashboardSummary: ["admin", "dashboard-summary"] as const,
  assignmentReport: (from?: string, to?: string) => ["admin", "report", from, to] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};
