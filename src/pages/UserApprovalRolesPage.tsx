import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Pencil, UserCog } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectField } from "@/components/ui/FormField";
import { PageHeader, Table, Thead, Tbody, Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { departmentHooks, approvalRoleHooks } from "@/hooks/useCatalog";
import { useUsersQuery } from "@/hooks/useUsers";
import {
  useCreateUserApprovalRole,
  useRemoveUserApprovalRole,
  useUpdateUserApprovalRole,
  useUserApprovalRolesQuery,
} from "@/hooks/useWorkflowConfig";
import { userApprovalRoleFormSchema, type UserApprovalRoleFormValues } from "@/schemas/workflowConfig.schema";
import type { UserApprovalRoleResponse } from "@/types/dto";

export default function UserApprovalRolesPage() {
  const { data: items = [], isLoading } = useUserApprovalRolesQuery();
  const { data: users = [] } = useUsersQuery();
  const { data: roles = [] } = approvalRoleHooks.useList();
  const { data: departments = [] } = departmentHooks.useList();

  const createMutation = useCreateUserApprovalRole();
  const updateMutation = useUpdateUserApprovalRole();
  const removeMutation = useRemoveUserApprovalRole();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserApprovalRoleResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserApprovalRoleResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserApprovalRoleFormValues>({
    resolver: zodResolver(userApprovalRoleFormSchema),
    defaultValues: { userId: "", approvalRoleId: "", departmentId: "" },
  });

  useEffect(() => {
    if (formOpen) {
      reset(
        editing
          ? {
              userId: String(editing.userId),
              approvalRoleId: String(editing.approvalRoleId),
              departmentId: editing.departmentId ? String(editing.departmentId) : "",
            }
          : { userId: "", approvalRoleId: "", departmentId: "" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, editing]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(item: UserApprovalRoleResponse) {
    setEditing(item);
    setFormOpen(true);
  }

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          payload: {
            approvalRoleId: Number(values.approvalRoleId),
            departmentId: values.departmentId ? Number(values.departmentId) : null,
          },
        },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(
        {
          userId: Number(values.userId),
          approvalRoleId: Number(values.approvalRoleId),
          departmentId: values.departmentId ? Number(values.departmentId) : null,
        },
        { onSuccess: () => setFormOpen(false) }
      );
    }
  });

  function handleDelete() {
    if (!deleteTarget) return;
    removeMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quy trình duyệt"
        title="Phân quyền duyệt"
        description="Gán vai trò duyệt cho từng người dùng, có thể giới hạn theo phòng ban."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Phân quyền
          </Button>
        }
      />

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title="Chưa có phân quyền duyệt nào" icon={UserCog} />
        ) : (
          <Table>
            <Thead>
              <th>Người dùng</th>
              <th>Vai trò duyệt</th>
              <th>Phòng ban</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="font-medium text-slate-800">{it.userName}</td>
                  <td>{it.approvalRoleName}</td>
                  <td className="text-slate-500">{it.departmentName || "Tất cả"}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(it)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                        type="button"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(it)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
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
        title={editing ? "Sửa phân quyền" : "Phân quyền duyệt"}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={onSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              Lưu
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <SelectField
            label="Người dùng"
            required
            disabled={!!editing}
            error={errors.userId?.message}
            {...register("userId")}
          >
            <option value="">Chọn người dùng…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.username}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Vai trò duyệt"
            required
            error={errors.approvalRoleId?.message}
            {...register("approvalRoleId")}
          >
            <option value="">Chọn vai trò…</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Phòng ban (tuỳ chọn)"
            hint="Bỏ trống nếu áp dụng cho mọi phòng ban"
            {...register("departmentId")}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={removeMutation.isPending}
        title="Gỡ phân quyền?"
        description={`"${deleteTarget?.userName}" sẽ không còn vai trò duyệt "${deleteTarget?.approvalRoleName}".`}
      />
    </div>
  );
}
