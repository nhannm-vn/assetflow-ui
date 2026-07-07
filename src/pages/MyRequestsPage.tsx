import { useState } from "react";
import { ClipboardList, XCircle, History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AssetTag } from "@/components/ui/AssetTag";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  PageHeader,
  Table,
  Thead,
  Tbody,
  TableSkeleton,
  EmptyState,
  Spinner,
} from "@/components/ui/DataDisplay";
import { useCancelAssetRequest, useMyRequestsQuery } from "@/hooks/useAssetRequests";
import { useRequestHistoryQuery } from "@/hooks/useApprovals";
import { useAssetsQuery } from "@/hooks/useAssets";
import { ASSET_REQUEST_STATUS_META, APPROVAL_STATUS_META, statusMeta } from "@/types/enums";
import { formatDateTime } from "@/lib/format";
import type { AssetRequestResponse } from "@/types/dto";

export default function MyRequestsPage() {
  const { data: requests = [], isLoading } = useMyRequestsQuery();
  const { data: assetsPage } = useAssetsQuery({
    keyword: "",
    status: "",
    categoryId: "",
    locationId: "",
    page: 1,
    pageSize: 1000,
  });
  const assets = assetsPage?.data ?? [];
  const cancelMutation = useCancelAssetRequest();

  const [cancelTarget, setCancelTarget] = useState<AssetRequestResponse | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AssetRequestResponse | null>(null);
  const { data: history = [], isLoading: historyLoading } = useRequestHistoryQuery(
    historyTarget?.id ?? null,
    false
  );

  function handleCancel() {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget.id, { onSuccess: () => setCancelTarget(null) });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Yêu cầu"
        title="Yêu cầu của tôi"
        description="Theo dõi trạng thái các yêu cầu mượn tài sản bạn đã gửi."
      />

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Bước hiện tại</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={4} cols={5} />
          </Table>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Chưa có yêu cầu nào"
            description="Vào trang Tài sản để gửi yêu cầu mượn tài sản đầu tiên."
            icon={ClipboardList}
          />
        ) : (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Bước hiện tại</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {requests.map((r) => {
                const asset = assets.find((a) => a.id === r.assetId);
                const meta = statusMeta(ASSET_REQUEST_STATUS_META, r.status);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <AssetTag>{asset?.assetCode || `#${r.assetId}`}</AssetTag>
                        <span className="font-medium text-slate-800">{asset?.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">Bước {r.currentStep}</td>
                    <td>
                      <Badge color={meta.color}>{meta.label}</Badge>
                    </td>
                    <td className="text-slate-500">{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setHistoryTarget(r)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                          title="Lịch sử duyệt"
                          type="button"
                        >
                          <History size={15} />
                        </button>
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => setCancelTarget(r)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            title="Hủy yêu cầu"
                            type="button"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
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
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        title={`Lịch sử duyệt — Yêu cầu #${historyTarget?.id ?? ""}`}
      >
        {historyLoading ? (
          <Spinner />
        ) : history.length === 0 ? (
          <EmptyState title="Chưa có lịch sử duyệt" />
        ) : (
          <ol className="flex flex-col gap-2">
            {history.map((h, idx) => {
              const meta = statusMeta(APPROVAL_STATUS_META, h.status);
              return (
                <li key={idx} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">Bước {h.stepOrder}</span>
                    <Badge color={meta.color}>{meta.label}</Badge>
                  </div>
                  {h.comment && <p className="mt-1 text-sm text-slate-500">"{h.comment}"</p>}
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(h.createdAt)}</p>
                </li>
              );
            })}
          </ol>
        )}
      </Modal>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelMutation.isPending}
        title="Hủy yêu cầu?"
        description="Yêu cầu mượn tài sản này sẽ bị hủy và không thể khôi phục."
      />
    </div>
  );
}
