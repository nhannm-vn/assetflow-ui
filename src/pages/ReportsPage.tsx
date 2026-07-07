import { useState, type FormEvent } from "react";
import { FileBarChart, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TextField } from "@/components/ui/FormField";
import { PageHeader, Table, Thead, Tbody, Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { useAssignmentReportQuery } from "@/hooks/useAdmin";
import { ASSIGNMENT_STATUS_META, statusMeta } from "@/types/enums";
import { formatDate } from "@/lib/format";

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [enabled, setEnabled] = useState(false);

  const {
    data: rows,
    isLoading,
    refetch,
  } = useAssignmentReportQuery(fromDate || undefined, toDate || undefined, enabled);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (enabled) {
      refetch();
    } else {
      setEnabled(true);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Báo cáo"
        title="Báo cáo bàn giao tài sản"
        description="Thống kê bàn giao tài sản theo khoảng thời gian."
      />

      <Card className="mb-5">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <TextField
            label="Từ ngày"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-44"
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-44"
          />
          <Button type="submit" loading={isLoading}>
            <Search size={15} /> Xem báo cáo
          </Button>
        </form>
      </Card>

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : rows === undefined ? (
          <EmptyState title="Chọn khoảng thời gian để xem báo cáo" icon={FileBarChart} />
        ) : rows.length === 0 ? (
          <EmptyState title="Không có dữ liệu trong khoảng thời gian này" icon={FileBarChart} />
        ) : (
          <Table>
            <Thead>
              <th>Tài sản</th>
              <th>Người nhận</th>
              <th>Ngày nhận</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
            </Thead>
            <Tbody>
              {rows.map((a) => {
                const meta = statusMeta(ASSIGNMENT_STATUS_META, a.status);
                return (
                  <tr key={a.id}>
                    <td className="font-medium text-slate-800">{a.assetName}</td>
                    <td className="text-slate-500">{a.userName}</td>
                    <td className="text-slate-500">{formatDate(a.assignedDate)}</td>
                    <td className="text-slate-500">{formatDate(a.returnedDate)}</td>
                    <td>
                      <Badge color={meta.color}>{meta.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
