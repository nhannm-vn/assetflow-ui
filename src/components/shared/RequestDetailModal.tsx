import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { useRequestDetailAdminQuery, useRequestHistoryQuery } from "@/hooks/useApprovals";
import { useAssetRequestByIdQuery } from "@/hooks/useAssetRequests";
import { ASSET_REQUEST_STATUS_META, APPROVAL_STATUS_META, statusMeta } from "@/types/enums";
import { formatDateTime } from "@/lib/format";

interface RequestDetailModalProps {
  requestId: number | null;
  onClose: () => void;
}

/**
 * Màn chi tiết 1 yêu cầu mượn tài sản cho admin — kết hợp dữ liệu từ 2
 * endpoint khác nhau vì mỗi endpoint có phần thông tin riêng:
 *  - ApprovalController.GetRequestDetailAdmin: assetName/requesterName đã
 *    join sẵn, dễ hiển thị.
 *  - AssetRequestController.GetById: bản ghi gốc, có workflowId (không có
 *    ở endpoint trên) — cần thiết để biết yêu cầu thuộc quy trình duyệt nào.
 */
export function RequestDetailModal({ requestId, onClose }: RequestDetailModalProps) {
  const { data: detail, isLoading: detailLoading } = useRequestDetailAdminQuery(requestId);
  const { data: raw, isLoading: rawLoading } = useAssetRequestByIdQuery(requestId);
  const { data: history = [], isLoading: historyLoading } = useRequestHistoryQuery(requestId, true);

  const loading = detailLoading || rawLoading;
  const meta = detail ? statusMeta(ASSET_REQUEST_STATUS_META, detail.status) : null;

  return (
    <Modal
      open={requestId !== null}
      onClose={onClose}
      title={`Chi tiết yêu cầu #${requestId ?? ""}`}
      size="lg"
    >
      {loading ? (
        <Spinner />
      ) : !detail ? (
        <EmptyState title="Không tìm thấy yêu cầu" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Tài sản</p>
              <p className="font-medium text-slate-800">{detail.assetName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Người yêu cầu</p>
              <p className="font-medium text-slate-800">{detail.requesterName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Trạng thái</p>
              {meta && <Badge color={meta.color}>{meta.label}</Badge>}
            </div>
            <div>
              <p className="text-xs text-slate-400">Bước hiện tại</p>
              <p className="font-medium text-slate-800">Bước {detail.currentStep}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Mã quy trình duyệt</p>
              <p className="font-mono font-medium text-slate-800">{raw ? `#${raw.workflowId}` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Ngày gửi</p>
              <p className="font-medium text-slate-800">{formatDateTime(detail.createdAt)}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Lịch sử duyệt</p>
            {historyLoading ? (
              <Spinner />
            ) : history.length === 0 ? (
              <EmptyState title="Chưa có lịch sử duyệt" />
            ) : (
              <ol className="flex flex-col gap-2">
                {history.map((h, idx) => {
                  const stepMeta = statusMeta(APPROVAL_STATUS_META, h.status);
                  return (
                    <li key={idx} className="rounded-lg border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">Bước {h.stepOrder}</span>
                        <Badge color={stepMeta.color}>{stepMeta.label}</Badge>
                      </div>
                      {h.comment && <p className="mt-1 text-sm text-slate-500">&ldquo;{h.comment}&rdquo;</p>}
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(h.createdAt)}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
