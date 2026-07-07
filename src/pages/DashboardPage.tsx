import { Boxes, ClipboardList, Repeat, PackageCheck } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { PageHeader, Spinner } from "@/components/ui/DataDisplay";
import { useDashboardSummaryQuery } from "@/hooks/useAdmin";

// Khớp đúng ngữ nghĩa màu trạng thái dùng trong Badge (xem types/enums.ts)
const ASSET_COLORS = ["#10B981", "#6366F1", "#F59E0B", "#CBD5E1"]; // Sẵn sàng, Đang dùng, Bảo trì, Khác
const REQUEST_COLORS = ["#F59E0B", "#10B981", "#EF4444", "#CBD5E1"]; // Chờ duyệt, Đã duyệt, Từ chối, Đã hủy

interface ManifestItemProps {
  label: string;
  value: number;
  icon: typeof Boxes;
  accent?: "indigo" | "emerald";
}

function ManifestItem({ label, value, icon: Icon, accent }: ManifestItemProps) {
  const accentClass =
    accent === "indigo" ? "text-indigo-500" : accent === "emerald" ? "text-emerald-500" : "text-slate-400";
  return (
    <div className="flex flex-1 items-center gap-3.5 px-6 py-5 first:pl-0 last:pr-0">
      <Icon size={17} className={accentClass} strokeWidth={2.25} />
      <div>
        <p className="font-mono text-[26px] font-semibold leading-none tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-1.5 text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummaryQuery();

  if (isLoading) return <Spinner label="Đang tải tổng quan…" />;
  if (!summary) return null;

  const assetData = [
    { name: "Sẵn sàng", value: summary.availableAssets },
    { name: "Đang dùng", value: summary.inUseAssets },
    { name: "Bảo trì", value: summary.maintenanceAssets },
    {
      name: "Khác",
      value: Math.max(
        0,
        summary.totalAssets - summary.availableAssets - summary.inUseAssets - summary.maintenanceAssets
      ),
    },
  ].filter((d) => d.value > 0);

  const requestData = [
    { name: "Chờ duyệt", value: summary.pendingRequests },
    { name: "Đã duyệt", value: summary.approvedRequests },
    { name: "Từ chối", value: summary.rejectedRequests },
    { name: "Đã hủy", value: summary.cancelledRequests },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Tổng quan"
        title="Bảng điều khiển"
        description="Số liệu vận hành tài sản theo thời gian thực."
      />

      {/* Dải "manifest" — trình bày như 1 dòng sổ kiểm kê, không phải 4 thẻ rời rạc */}
      <Card padded={false} className="mb-5 flex flex-wrap divide-x divide-slate-100 px-6">
        <ManifestItem label="Tổng số tài sản" value={summary.totalAssets} icon={Boxes} />
        <ManifestItem
          label="Yêu cầu chờ duyệt"
          value={summary.pendingRequests}
          icon={ClipboardList}
          accent="indigo"
        />
        <ManifestItem
          label="Đang bàn giao"
          value={summary.activeAssignments}
          icon={Repeat}
          accent="emerald"
        />
        <ManifestItem label="Đã hoàn trả" value={summary.returnedAssignments} icon={PackageCheck} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-indigo-600">Tài sản</p>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Phân bổ theo trạng thái</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {assetData.map((_, i) => (
                    <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {assetData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: ASSET_COLORS[i % ASSET_COLORS.length] }}
                />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-indigo-600">Yêu cầu</p>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Yêu cầu mượn theo trạng thái</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "#F8FAFC" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {requestData.map((_, i) => (
                    <Cell key={i} fill={REQUEST_COLORS[i % REQUEST_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
