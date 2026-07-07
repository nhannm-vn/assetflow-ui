import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquare, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TextAreaField } from "@/components/ui/FormField";
import { PageHeader, Table, Thead, Tbody, TableSkeleton, EmptyState } from "@/components/ui/DataDisplay";
import { useApproveRequest, usePendingApprovalsQuery, useRejectRequest } from "@/hooks/useApprovals";
import { approvalActionFormSchema, type ApprovalActionFormValues } from "@/schemas/approval.schema";
import { ASSET_REQUEST_STATUS_META, statusMeta } from "@/types/enums";
import { formatDateTime } from "@/lib/format";
import type { PendingApprovalResponse } from "@/types/dto";

type ActionState = { type: "approve" | "reject"; request: PendingApprovalResponse } | null;

export default function ApprovalsPage() {
  const { data: items = [], isLoading, error } = usePendingApprovalsQuery();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const [action, setAction] = useState<ActionState>(null);
  const { register, handleSubmit, reset } = useForm<ApprovalActionFormValues>({
    resolver: zodResolver(approvalActionFormSchema),
    defaultValues: { comment: "" },
  });

  const noRole = !!error && (error.status === 401 || error.status === 403);

  function openAction(type: "approve" | "reject", request: PendingApprovalResponse) {
    reset({ comment: "" });
    setAction({ type, request });
  }

  const onSubmit = handleSubmit((values) => {
    if (!action) return;
    const mutation = action.type === "approve" ? approveMutation : rejectMutation;
    mutation.mutate(
      { requestId: action.request.requestId, comment: values.comment || undefined },
      { onSuccess: () => setAction(null) }
    );
  });

  return (
    <div>
      <PageHeader
        eyebrow="Phê duyệt"
        title="Yêu cầu chờ bạn duyệt"
        description="Các yêu cầu mượn tài sản đang ở bước duyệt thuộc vai trò của bạn."
      />

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Người yêu cầu</th>
              <th>Bước</th>
              <th>Ngày gửi</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={4} cols={5} />
          </Table>
        ) : noRole ? (
          <EmptyState
            title="Bạn chưa được gán vai trò duyệt"
            description="Liên hệ quản trị viên để được phân quyền phê duyệt nếu đây là nhầm lẫn."
            icon={CheckSquare}
          />
        ) : items.length === 0 ? (
          <EmptyState title="Không có yêu cầu nào cần duyệt" icon={CheckSquare} />
        ) : (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Người yêu cầu</th>
              <th>Bước</th>
              <th>Ngày gửi</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {items.map((r) => {
                const meta = statusMeta(ASSET_REQUEST_STATUS_META, r.status);
                return (
                  <tr key={r.requestId}>
                    <td className="font-medium text-slate-800">{r.assetName}</td>
                    <td className="text-slate-500">{r.requesterName}</td>
                    <td>
                      <Badge color={meta.color}>Bước {r.currentStep}</Badge>
                    </td>
                    <td className="text-slate-500">{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="danger" onClick={() => openAction("reject", r)}>
                          <X size={14} /> Từ chối
                        </Button>
                        <Button size="sm" variant="accent" onClick={() => openAction("approve", r)}>
                          <Check size={14} /> Duyệt
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={action?.type === "approve" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"}
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)}>
              Hủy
            </Button>
            <Button
              variant={action?.type === "approve" ? "accent" : "danger"}
              onClick={onSubmit}
              loading={approveMutation.isPending || rejectMutation.isPending}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <p className="text-sm text-slate-600">
            Tài sản <span className="font-semibold">{action?.request.assetName}</span> — yêu cầu bởi{" "}
            <span className="font-semibold">{action?.request.requesterName}</span>
          </p>
          <TextAreaField
            label="Ghi chú (tuỳ chọn)"
            placeholder="Lý do hoặc ghi chú thêm…"
            {...register("comment")}
          />
        </form>
      </Modal>
    </div>
  );
}
