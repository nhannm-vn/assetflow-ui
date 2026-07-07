import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { useUserApprovalRolesByUserQuery } from "@/hooks/useWorkflowConfig";
import { ShieldCheck } from "lucide-react";

interface UserApprovalRolesModalProps {
  userId: number | null;
  userName: string;
  onClose: () => void;
}

/** UserApprovalRoleController.GetByUserId — xem nhanh vai trò duyệt của 1
 * người dùng ngay từ trang Người dùng, không cần sang trang Phân quyền duyệt
 * rồi tự lọc. */
export function UserApprovalRolesModal({ userId, userName, onClose }: UserApprovalRolesModalProps) {
  const { data: roles = [], isLoading } = useUserApprovalRolesByUserQuery(userId);

  return (
    <Modal open={userId !== null} onClose={onClose} title={`Vai trò duyệt — ${userName}`}>
      {isLoading ? (
        <Spinner />
      ) : roles.length === 0 ? (
        <EmptyState
          title="Chưa có vai trò duyệt nào"
          description="Vào trang Phân quyền duyệt để gán vai trò cho người dùng này."
          icon={ShieldCheck}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {roles.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
            >
              <span className="text-sm font-medium text-slate-800">{r.approvalRoleName}</span>
              <Badge color="indigo">{r.departmentName || "Tất cả phòng ban"}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
