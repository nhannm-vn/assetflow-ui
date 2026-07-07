import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField, TextAreaField, PlainInput } from "@/components/ui/FormField";
import { Table, Thead, Tbody, TableSkeleton, EmptyState, PageHeader } from "@/components/ui/DataDisplay";
import type { ApiError } from "@/types/dto";

export interface CrudFieldConfig<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
  placeholder?: string;
}

export interface CrudColumnConfig<TResponse> {
  key: string;
  label: string;
  render?: (item: TResponse) => ReactNode;
}

interface EntityHooks<TResponse, TPayload, TId = number> {
  useList: () => UseQueryResult<TResponse[], ApiError>;
  useById: (id: TId | null) => UseQueryResult<TResponse, ApiError>;
  useCreate: () => UseMutationResult<TResponse, ApiError, TPayload>;
  useUpdate: () => UseMutationResult<TResponse, ApiError, { id: TId; payload: TPayload }>;
  useRemove: () => UseMutationResult<boolean, ApiError, TId>;
}

interface EntityCrudPageProps<
  TResponse extends { id: number; name?: string },
  TFormValues extends FieldValues,
  TPayload,
> {
  eyebrow?: string;
  title: string;
  description?: string;
  emptyLabel: string;
  schema: ZodType<TFormValues>;
  fields: CrudFieldConfig<TFormValues>[];
  columns: CrudColumnConfig<TResponse>[];
  hooks: EntityHooks<TResponse, TPayload>;
  defaultValues: TFormValues;
  toFormValues: (item: TResponse) => TFormValues;
  /** Chuyển giá trị form (chuỗi, khớp input HTML) sang payload thật gửi lên API
   * (đúng kiểu số/nullable như DTO backend yêu cầu). */
  toPayload: (values: TFormValues) => TPayload;
}

export function EntityCrudPage<
  TResponse extends { id: number; name?: string },
  TFormValues extends FieldValues,
  TPayload,
>({
  eyebrow,
  title,
  description,
  emptyLabel,
  schema,
  fields,
  columns,
  hooks,
  defaultValues,
  toFormValues,
  toPayload,
}: EntityCrudPageProps<TResponse, TFormValues, TPayload>) {
  const { data: items = [], isLoading } = hooks.useList();
  const createMutation = hooks.useCreate();
  const updateMutation = hooks.useUpdate();
  const removeMutation = hooks.useRemove();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TResponse | null>(null);

  // Khi mở form sửa, lấy đúng bản ghi mới nhất từ server thay vì chỉ tin
  // vào dòng đã cache trong danh sách.
  const { data: freshEditing } = hooks.useById(editing?.id ?? null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TFormValues>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (formOpen) reset(editing ? toFormValues(freshEditing ?? editing) : defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, editing, freshEditing]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: TResponse) {
    setEditing(item);
    setFormOpen(true);
  }

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values);
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  });

  function handleDelete() {
    if (!deleteTarget) return;
    removeMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  const filtered = useMemo(
    () =>
      query ? items.filter((it) => JSON.stringify(it).toLowerCase().includes(query.toLowerCase())) : items,
    [items, query]
  );

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Thêm mới
          </Button>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <PlainInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm…"
              className="h-9 pl-8"
            />
          </div>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} kết quả</span>
        </div>

        {isLoading ? (
          <Table>
            <Thead>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={5} cols={columns.length + 1} />
          </Table>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`Chưa có ${emptyLabel} nào`}
            description="Bắt đầu bằng cách thêm mục đầu tiên."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} /> Thêm {emptyLabel}
              </Button>
            }
          />
        ) : (
          <Table>
            <Thead>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.render ? c.render(item) : String((item as Record<string, unknown>)[c.key] ?? "—")}
                    </td>
                  ))}
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                        title="Sửa"
                        type="button"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Xóa"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Sửa ${emptyLabel}` : `Thêm ${emptyLabel}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={onSubmit} loading={saving}>
              Lưu
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          {fields.map((f) => {
            const message = (errors[f.name]?.message as string | undefined) ?? undefined;
            return f.type === "textarea" ? (
              <TextAreaField
                key={f.name}
                label={f.label}
                required={f.required}
                placeholder={f.placeholder}
                error={message}
                {...register(f.name)}
              />
            ) : (
              <TextField
                key={f.name}
                label={f.label}
                required={f.required}
                placeholder={f.placeholder}
                type={f.type === "number" ? "number" : "text"}
                error={message}
                {...register(f.name)}
              />
            );
          })}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={removeMutation.isPending}
        title={`Xóa ${emptyLabel}?`}
        description={`Hành động này không thể hoàn tác. "${deleteTarget?.name ?? ""}" sẽ bị xóa khỏi hệ thống.`}
      />
    </div>
  );
}
