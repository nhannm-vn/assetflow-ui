// Khớp AssetManagementSystem.Common.Enums/*.cs — backend serialize enum dạng string.

export const AssetStatus = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  IN_USE: "IN_USE",
  MAINTENANCE: "MAINTENANCE",
  RETIRED: "RETIRED",
  LOST: "LOST",
  DAMAGED: "DAMAGED",
} as const;
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export const AssetRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type AssetRequestStatus = (typeof AssetRequestStatus)[keyof typeof AssetRequestStatus];

export const AssignmentStatus = {
  ACTIVE: "ACTIVE",
  RETURNED: "RETURNED",
  OVERDUE: "OVERDUE",
} as const;
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

export const ApprovalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export type BadgeColor = "emerald" | "amber" | "indigo" | "red" | "slate" | "gray";

interface StatusMeta {
  label: string;
  color: BadgeColor;
}

export const ASSET_STATUS_META: Record<AssetStatus, StatusMeta> = {
  AVAILABLE: { label: "Sẵn sàng", color: "emerald" },
  RESERVED: { label: "Đã giữ chỗ", color: "amber" },
  IN_USE: { label: "Đang sử dụng", color: "indigo" },
  MAINTENANCE: { label: "Bảo trì", color: "amber" },
  RETIRED: { label: "Ngừng sử dụng", color: "gray" },
  LOST: { label: "Thất lạc", color: "red" },
  DAMAGED: { label: "Hư hỏng", color: "red" },
};

export const ASSET_REQUEST_STATUS_META: Record<AssetRequestStatus, StatusMeta> = {
  PENDING: { label: "Chờ duyệt", color: "amber" },
  APPROVED: { label: "Đã duyệt", color: "emerald" },
  REJECTED: { label: "Từ chối", color: "red" },
  CANCELLED: { label: "Đã hủy", color: "gray" },
};

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, StatusMeta> = {
  ACTIVE: { label: "Đang dùng", color: "indigo" },
  RETURNED: { label: "Đã trả", color: "emerald" },
  OVERDUE: { label: "Quá hạn", color: "red" },
};

export const APPROVAL_STATUS_META: Record<ApprovalStatus, StatusMeta> = {
  PENDING: { label: "Chờ duyệt", color: "amber" },
  APPROVED: { label: "Đã duyệt", color: "emerald" },
  REJECTED: { label: "Từ chối", color: "red" },
};

export function statusMeta<T extends string>(
  map: Record<string, StatusMeta>,
  value: T | null | undefined
): StatusMeta {
  const key = (value ?? "").toString().toUpperCase();
  return map[key] ?? { label: String(value ?? "—"), color: "gray" };
}

export const ASSET_STATUS_OPTIONS = Object.keys(AssetStatus) as AssetStatus[];
