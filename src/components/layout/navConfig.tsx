import {
  LayoutDashboard,
  Boxes,
  Tags,
  MapPin,
  Truck,
  Building2,
  Users,
  ClipboardList,
  CheckSquare,
  Repeat,
  Workflow,
  ShieldCheck,
  GitBranch,
  UserCog,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Array<"ADMIN" | "USER">;
}

export interface NavSection {
  title?: string;
  roles?: Array<"ADMIN" | "USER">;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, roles: ["ADMIN"] },
      { to: "/assets", label: "Tài sản", icon: Boxes, roles: ["ADMIN", "USER"] },
      { to: "/requests", label: "Yêu cầu của tôi", icon: ClipboardList, roles: ["USER"] },
      { to: "/approvals", label: "Phê duyệt", icon: CheckSquare, roles: ["ADMIN", "USER"] },
      { to: "/my-assignments", label: "Tài sản đang mượn", icon: Repeat, roles: ["USER"] },
    ],
  },
  {
    title: "Vận hành",
    roles: ["ADMIN"],
    items: [
      { to: "/admin/requests", label: "Yêu cầu (tất cả)", icon: ClipboardList, roles: ["ADMIN"] },
      { to: "/admin/assignments", label: "Bàn giao tài sản", icon: Repeat, roles: ["ADMIN"] },
      { to: "/admin/reports", label: "Báo cáo", icon: FileBarChart, roles: ["ADMIN"] },
    ],
  },
  {
    title: "Danh mục",
    roles: ["ADMIN"],
    items: [
      { to: "/categories", label: "Loại tài sản", icon: Tags, roles: ["ADMIN"] },
      { to: "/locations", label: "Vị trí", icon: MapPin, roles: ["ADMIN"] },
      { to: "/suppliers", label: "Nhà cung cấp", icon: Truck, roles: ["ADMIN"] },
      { to: "/departments", label: "Phòng ban", icon: Building2, roles: ["ADMIN"] },
    ],
  },
  {
    title: "Quy trình duyệt",
    roles: ["ADMIN"],
    items: [
      { to: "/workflows", label: "Quy trình duyệt", icon: Workflow, roles: ["ADMIN"] },
      { to: "/approval-roles", label: "Vai trò duyệt (định nghĩa)", icon: ShieldCheck, roles: ["ADMIN"] },
      {
        to: "/department-workflows",
        label: "Gán quy trình cho phòng ban",
        icon: GitBranch,
        roles: ["ADMIN"],
      },
      { to: "/user-approval-roles", label: "Gán vai trò duyệt cho user", icon: UserCog, roles: ["ADMIN"] },
    ],
  },
  {
    title: "Quản trị",
    roles: ["ADMIN"],
    items: [{ to: "/users", label: "Người dùng", icon: Users, roles: ["ADMIN"] }],
  },
];
