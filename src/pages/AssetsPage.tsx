import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Boxes,
  ChevronLeft,
  ChevronRight,
  SendHorizonal,
  RefreshCcw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AssetTag } from "@/components/ui/AssetTag";
import { Modal } from "@/components/ui/Modal";
import { AssetDetailModal } from "@/components/shared/AssetDetailModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField, SelectField, PlainInput, PlainSelect } from "@/components/ui/FormField";
import { PageHeader, Table, Thead, Tbody, TableSkeleton, EmptyState } from "@/components/ui/DataDisplay";
import {
  useAssetsQuery,
  useChangeAssetStatus,
  useCreateAsset,
  useRemoveAsset,
  useUpdateAsset,
} from "@/hooks/useAssets";
import { useCreateAssetRequest } from "@/hooks/useAssetRequests";
import { categoryHooks, locationHooks, supplierHooks } from "@/hooks/useCatalog";
import { useIsAdmin } from "@/store/authStore";
import {
  assetFormSchema,
  assetRequestFormSchema,
  type AssetFormValues,
  type AssetRequestFormValues,
} from "@/schemas/asset.schema";
import { ASSET_STATUS_META, ASSET_STATUS_OPTIONS, statusMeta } from "@/types/enums";
import type { AssetStatus } from "@/types/enums";
import { formatCurrency } from "@/lib/format";
import type { AssetFilter, AssetResponse } from "@/types/dto";

const emptyForm: AssetFormValues = {
  assetCode: "",
  name: "",
  categoryId: "",
  locationId: "",
  supplierId: "",
  value: "",
};

export default function AssetsPage() {
  const isAdmin = useIsAdmin();

  const [filters, setFilters] = useState<AssetFilter>({
    keyword: "",
    status: "",
    categoryId: "",
    locationId: "",
    page: 1,
    pageSize: 10,
  });
  const { data, isLoading, refetch } = useAssetsQuery(filters);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const { data: categories = [] } = categoryHooks.useList();
  const { data: locations = [] } = locationHooks.useList();
  const { data: suppliers = [] } = supplierHooks.useList();

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const removeAsset = useRemoveAsset();
  const changeStatus = useChangeAssetStatus();
  const createRequest = useCreateAssetRequest();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AssetResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssetResponse | null>(null);
  const [requestTarget, setRequestTarget] = useState<AssetResponse | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetFormValues>({ resolver: zodResolver(assetFormSchema), defaultValues: emptyForm });

  const requestForm = useForm<AssetRequestFormValues>({
    resolver: zodResolver(assetRequestFormSchema),
    defaultValues: { workflowId: "" },
  });

  useEffect(() => {
    if (formOpen) {
      reset(
        editing
          ? {
              assetCode: editing.assetCode,
              name: editing.name,
              categoryId: String(editing.categoryId),
              locationId: String(editing.locationId),
              supplierId: editing.supplierId ? String(editing.supplierId) : "",
              value: editing.value != null ? String(editing.value) : "",
            }
          : emptyForm
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, editing]);

  useEffect(() => {
    if (requestTarget) requestForm.reset({ workflowId: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestTarget]);

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.name ?? `#${id}`;
  }
  function locationName(id: number) {
    return locations.find((l) => l.id === id)?.name ?? `#${id}`;
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(a: AssetResponse) {
    setEditing(a);
    setFormOpen(true);
  }

  const onSubmit = handleSubmit((values) => {
    const payload = {
      name: values.name,
      categoryId: Number(values.categoryId),
      locationId: Number(values.locationId),
      supplierId: values.supplierId ? Number(values.supplierId) : null,
      value: values.value ? Number(values.value) : null,
    };
    if (editing) {
      updateAsset.mutate({ id: editing.id, payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createAsset.mutate(
        { ...payload, assetCode: values.assetCode },
        { onSuccess: () => setFormOpen(false) }
      );
    }
  });

  function handleDelete() {
    if (!deleteTarget) return;
    removeAsset.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  const onSubmitRequest = requestForm.handleSubmit((values) => {
    if (!requestTarget) return;
    createRequest.mutate(
      { assetId: requestTarget.id, workflowId: Number(values.workflowId) },
      { onSuccess: () => setRequestTarget(null) }
    );
  });

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <div>
      <PageHeader
        eyebrow="Tài sản"
        title="Danh sách tài sản"
        description={isAdmin ? "Quản lý toàn bộ tài sản của tổ chức." : "Duyệt tài sản và gửi yêu cầu mượn."}
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus size={16} /> Thêm tài sản
            </Button>
          ) : (
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw size={15} /> Làm mới
            </Button>
          )
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <PlainInput
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value, page: 1 }))}
              placeholder="Tìm theo mã, tên tài sản…"
              className="h-9 pl-8"
            />
          </div>
          <PlainSelect
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as AssetStatus | "", page: 1 }))
            }
            className="h-9 w-auto"
          >
            <option value="">Tất cả trạng thái</option>
            {ASSET_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_META[s].label}
              </option>
            ))}
          </PlainSelect>
          {isAdmin && (
            <>
              <PlainSelect
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    categoryId: e.target.value ? Number(e.target.value) : "",
                    page: 1,
                  }))
                }
                className="h-9 w-auto"
              >
                <option value="">Tất cả loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </PlainSelect>
              <PlainSelect
                value={filters.locationId}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    locationId: e.target.value ? Number(e.target.value) : "",
                    page: 1,
                  }))
                }
                className="h-9 w-auto"
              >
                <option value="">Tất cả vị trí</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </PlainSelect>
            </>
          )}
          <span className="ml-auto text-xs text-slate-400">{total} tài sản</span>
        </div>

        {isLoading ? (
          <Table>
            <Thead>
              <th>Mã tài sản</th>
              <th>Tên tài sản</th>
              {isAdmin && <th>Loại</th>}
              {isAdmin && <th>Vị trí</th>}
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={6} cols={isAdmin ? 7 : 5} />
          </Table>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Không tìm thấy tài sản"
            icon={Boxes}
            description="Thử thay đổi bộ lọc hoặc thêm tài sản mới."
          />
        ) : (
          <Table>
            <Thead>
              <th>Mã tài sản</th>
              <th>Tên tài sản</th>
              {isAdmin && <th>Loại</th>}
              {isAdmin && <th>Vị trí</th>}
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {rows.map((a) => {
                const meta = statusMeta(ASSET_STATUS_META, a.status);
                return (
                  <tr key={a.id}>
                    <td>
                      <AssetTag>{a.assetCode}</AssetTag>
                    </td>
                    <td>
                      <button
                        onClick={() => setDetailId(a.id)}
                        type="button"
                        className="font-medium text-slate-800 hover:text-indigo-600 hover:underline"
                      >
                        {a.name}
                      </button>
                    </td>
                    {isAdmin && <td className="text-slate-500">{categoryName(a.categoryId)}</td>}
                    {isAdmin && <td className="text-slate-500">{locationName(a.locationId)}</td>}
                    <td className="text-slate-500">{formatCurrency(a.value)}</td>
                    <td>
                      {isAdmin ? (
                        <PlainSelect
                          value={a.status}
                          onChange={(e) =>
                            changeStatus.mutate({ id: a.id, status: e.target.value as AssetStatus })
                          }
                          className="h-8 w-40 text-xs"
                        >
                          {ASSET_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {ASSET_STATUS_META[s].label}
                            </option>
                          ))}
                        </PlainSelect>
                      ) : (
                        <Badge color={meta.color}>{meta.label}</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => openEdit(a)}
                              type="button"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(a)}
                              type="button"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="accent"
                            disabled={a.status !== "AVAILABLE"}
                            onClick={() => setRequestTarget(a)}
                          >
                            <SendHorizonal size={13} /> Mượn
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-400">
            Trang {filters.page} / {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Sửa tài sản" : "Thêm tài sản"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={onSubmit} loading={createAsset.isPending || updateAsset.isPending}>
              Lưu
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <TextField
            label="Mã tài sản"
            required
            disabled={!!editing}
            placeholder="VD: LAP-0012"
            error={errors.assetCode?.message}
            {...register("assetCode")}
          />
          <TextField label="Tên tài sản" required error={errors.name?.message} {...register("name")} />
          <SelectField
            label="Loại tài sản"
            required
            error={errors.categoryId?.message}
            {...register("categoryId")}
          >
            <option value="">Chọn loại…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Vị trí" required error={errors.locationId?.message} {...register("locationId")}>
            <option value="">Chọn vị trí…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Nhà cung cấp" {...register("supplierId")}>
            <option value="">Không có</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <TextField label="Giá trị (VNĐ)" type="number" placeholder="0" {...register("value")} />
        </form>
      </Modal>

      <Modal
        open={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        title={`Gửi yêu cầu mượn — ${requestTarget?.name ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRequestTarget(null)}>
              Hủy
            </Button>
            <Button onClick={onSubmitRequest} loading={createRequest.isPending}>
              Gửi yêu cầu
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmitRequest} className="flex flex-col gap-3.5">
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Tài sản <AssetTag className="mx-1">{requestTarget?.assetCode}</AssetTag> sẽ được gửi cho người phê
            duyệt phụ trách quy trình bạn chọn bên dưới.
          </div>
          <TextField
            label="Mã quy trình duyệt (Workflow ID)"
            type="number"
            required
            hint="Hỏi quản trị viên phòng ban để biết ID quy trình áp dụng cho bạn."
            error={requestForm.formState.errors.workflowId?.message}
            {...requestForm.register("workflowId")}
          />
        </form>
      </Modal>

      <AssetDetailModal assetId={detailId} onClose={() => setDetailId(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={removeAsset.isPending}
        title="Xóa tài sản?"
        description={`Tài sản "${deleteTarget?.name}" sẽ bị xóa khỏi hệ thống.`}
      />
    </div>
  );
}
