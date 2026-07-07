import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { useAssignmentByIdQuery } from "@/hooks/useAssignments";
import { ASSIGNMENT_STATUS_META, statusMeta } from "@/types/enums";
import { formatDateTime } from "@/lib/format";

interface AssignmentDetailModalProps {
  assignmentId: number | null;
  onClose: () => void;
}

/** Dùng AssignmentController.GetById để lấy đúng bản ghi hiện tại thay vì
 * chỉ tin vào dữ liệu đã cache trong danh sách — hữu ích khi trạng thái vừa
 * được người khác cập nhật. */
export function AssignmentDetailModal({ assignmentId, onClose }: AssignmentDetailModalProps) {
  const { data, isLoading } = useAssignmentByIdQuery(assignmentId);
  const meta = data ? statusMeta(ASSIGNMENT_STATUS_META, data.status) : null;

  return (
    <Modal
      open={assignmentId !== null}
      onClose={onClose}
      title={`Chi tiết bàn giao #${assignmentId ?? ""}`}
      size="sm"
    >
      {isLoading ? (
        <Spinner />
      ) : !data ? (
        <EmptyState title="Không tìm thấy bản ghi" />
      ) : (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Tài sản</p>
            <p className="font-medium text-slate-800">{data.assetName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Người nhận</p>
            <p className="font-medium text-slate-800">{data.userName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Ngày nhận</p>
            <p className="font-medium text-slate-800">{formatDateTime(data.assignedDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Ngày trả</p>
            <p className="font-medium text-slate-800">{formatDateTime(data.returnedDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Trạng thái</p>
            {meta && <Badge color={meta.color}>{meta.label}</Badge>}
          </div>
        </div>
      )}
    </Modal>
  );
}
