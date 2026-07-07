import { useState } from "react";
import { Repeat, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader, Table, Thead, Tbody, TableSkeleton, EmptyState } from "@/components/ui/DataDisplay";
import { useMyAssignmentsQuery, useReturnAsset } from "@/hooks/useAssignments";
import { ASSIGNMENT_STATUS_META, statusMeta } from "@/types/enums";
import { formatDate } from "@/lib/format";
import type { AssignmentResponse } from "@/types/dto";

export default function MyAssignmentsPage() {
  const { data: items = [], isLoading } = useMyAssignmentsQuery();
  const returnMutation = useReturnAsset();
  const [returnTarget, setReturnTarget] = useState<AssignmentResponse | null>(null);

  function handleReturn() {
    if (!returnTarget) return;
    returnMutation.mutate(returnTarget.assetId, { onSuccess: () => setReturnTarget(null) });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bàn giao"
        title="Tài sản đang mượn"
        description="Danh sách tài sản đã được bàn giao cho bạn."
      />

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Ngày nhận</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={4} cols={5} />
          </Table>
        ) : items.length === 0 ? (
          <EmptyState title="Bạn chưa mượn tài sản nào" icon={Repeat} />
        ) : (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Ngày nhận</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {items.map((a) => {
                const meta = statusMeta(ASSIGNMENT_STATUS_META, a.status);
                return (
                  <tr key={a.id}>
                    <td className="font-medium text-slate-800">{a.assetName}</td>
                    <td className="text-slate-500">{formatDate(a.assignedDate)}</td>
                    <td className="text-slate-500">{formatDate(a.returnedDate)}</td>
                    <td>
                      <Badge color={meta.color}>{meta.label}</Badge>
                    </td>
                    <td className="text-right">
                      {a.status === "ACTIVE" && (
                        <Button size="sm" variant="outline" onClick={() => setReturnTarget(a)}>
                          <Undo2 size={13} /> Trả tài sản
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        loading={returnMutation.isPending}
        danger={false}
        confirmText="Xác nhận trả"
        title="Trả tài sản?"
        description={`Xác nhận trả lại "${returnTarget?.assetName}" cho tổ chức.`}
      />
    </div>
  );
}
