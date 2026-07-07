import { useState } from "react";
import { ClipboardList, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader, Table, Thead, Tbody, TableSkeleton, EmptyState } from "@/components/ui/DataDisplay";
import { RequestDetailModal } from "@/components/shared/RequestDetailModal";
import { useAdminRequestsQuery } from "@/hooks/useApprovals";
import { ASSET_REQUEST_STATUS_META, statusMeta } from "@/types/enums";
import { formatDateTime } from "@/lib/format";

export default function AdminRequestsPage() {
  const { data: requests = [], isLoading } = useAdminRequestsQuery();
  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="Vận hành"
        title="Yêu cầu mượn tài sản"
        description="Toàn bộ yêu cầu mượn tài sản trong hệ thống."
      />

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <Table>
            <Thead>
              <th>#</th>
              <th>Tài sản</th>
              <th>Người yêu cầu</th>
              <th>Bước</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={5} cols={7} />
          </Table>
        ) : requests.length === 0 ? (
          <EmptyState title="Chưa có yêu cầu nào" icon={ClipboardList} />
        ) : (
          <Table>
            <Thead>
              <th>#</th>
              <th>Tài sản</th>
              <th>Người yêu cầu</th>
              <th>Bước</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {requests.map((r) => {
                const meta = statusMeta(ASSET_REQUEST_STATUS_META, r.status);
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-slate-400">{r.id}</td>
                    <td className="font-medium text-slate-800">{r.assetName}</td>
                    <td className="text-slate-500">{r.requesterName}</td>
                    <td className="text-slate-500">Bước {r.currentStep}</td>
                    <td>
                      <Badge color={meta.color}>{meta.label}</Badge>
                    </td>
                    <td className="text-slate-500">{formatDateTime(r.createdAt)}</td>
                    <td className="text-right">
                      <button
                        onClick={() => setDetailId(r.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                        title="Xem chi tiết"
                        type="button"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      <RequestDetailModal requestId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
