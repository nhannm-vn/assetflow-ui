import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  Building2,
  ShieldCheck,
  Users as UsersIcon,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField, SelectField, PlainInput } from "@/components/ui/FormField";
import { PageHeader, Table, Thead, Tbody, TableSkeleton, EmptyState } from "@/components/ui/DataDisplay";
import { UserApprovalRolesModal } from "@/components/shared/UserApprovalRolesModal";
import {
  useChangePassword,
  useAssignUserDepartment,
  useCreateUser,
  useRemoveUser,
  useUpdateUser,
  useUsersQuery,
} from "@/hooks/useUsers";
import { departmentHooks } from "@/hooks/useCatalog";
import {
  createUserFormSchema,
  updateUserFormSchema,
  changePasswordFormSchema,
  assignDepartmentFormSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
  type ChangePasswordFormValues,
  type AssignDepartmentFormValues,
} from "@/schemas/user.schema";
import type { UserResponse } from "@/types/dto";

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsersQuery();
  const { data: departments = [] } = departmentHooks.useList();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const removeMutation = useRemoveUser();
  const changePasswordMutation = useChangePassword();
  const assignDepartmentMutation = useAssignUserDepartment();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [pwdTarget, setPwdTarget] = useState<UserResponse | null>(null);
  const [deptTarget, setDeptTarget] = useState<UserResponse | null>(null);
  const [rolesTarget, setRolesTarget] = useState<UserResponse | null>(null);

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      roleId: "2",
      departmentId: "",
    },
  });
  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: { fullName: "", email: "", phone: "", departmentId: "" },
  });
  const pwdForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { newPassword: "" },
  });
  const deptForm = useForm<AssignDepartmentFormValues>({
    resolver: zodResolver(assignDepartmentFormSchema),
    defaultValues: { departmentId: "" },
  });

  useEffect(() => {
    if (formOpen && editing) {
      updateForm.reset({
        fullName: editing.fullName ?? "",
        email: editing.email ?? "",
        phone: editing.phone ?? "",
        departmentId: editing.departmentId ? String(editing.departmentId) : "",
      });
    } else if (formOpen && !editing) {
      createForm.reset({
        username: "",
        password: "",
        fullName: "",
        email: "",
        phone: "",
        roleId: "2",
        departmentId: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, editing]);

  useEffect(() => {
    if (pwdTarget) pwdForm.reset({ newPassword: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pwdTarget]);

  useEffect(() => {
    if (deptTarget)
      deptForm.reset({ departmentId: deptTarget.departmentId ? String(deptTarget.departmentId) : "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptTarget]);

  function departmentName(id: number | null) {
    if (!id) return "—";
    return departments.find((d) => d.id === id)?.name ?? `#${id}`;
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(u: UserResponse) {
    setEditing(u);
    setFormOpen(true);
  }

  const onSubmitCreate = createForm.handleSubmit((values) => {
    createMutation.mutate(
      {
        username: values.username,
        password: values.password,
        fullName: values.fullName || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        roleId: Number(values.roleId),
        departmentId: values.departmentId ? Number(values.departmentId) : null,
      },
      { onSuccess: () => setFormOpen(false) }
    );
  });

  const onSubmitUpdate = updateForm.handleSubmit((values) => {
    if (!editing) return;
    updateMutation.mutate(
      {
        id: editing.id,
        payload: {
          fullName: values.fullName || undefined,
          email: values.email || undefined,
          phone: values.phone || undefined,
          departmentId: values.departmentId ? Number(values.departmentId) : null,
        },
      },
      { onSuccess: () => setFormOpen(false) }
    );
  });

  const onSubmitPassword = pwdForm.handleSubmit((values) => {
    if (!pwdTarget) return;
    changePasswordMutation.mutate(
      { id: pwdTarget.id, newPassword: values.newPassword },
      { onSuccess: () => setPwdTarget(null) }
    );
  });

  const onSubmitDepartment = deptForm.handleSubmit((values) => {
    if (!deptTarget) return;
    assignDepartmentMutation.mutate(
      { id: deptTarget.id, departmentId: Number(values.departmentId) },
      { onSuccess: () => setDeptTarget(null) }
    );
  });

  function handleDelete() {
    if (!deleteTarget) return;
    removeMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  const filtered = query
    ? users.filter((u) => JSON.stringify(u).toLowerCase().includes(query.toLowerCase()))
    : users;

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị"
        title="Người dùng"
        description="Quản lý tài khoản, phòng ban và mật khẩu nhân viên."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Thêm người dùng
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
              placeholder="Tìm theo tên, email…"
              className="h-9 pl-8"
            />
          </div>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} người dùng</span>
        </div>

        {isLoading ? (
          <Table>
            <Thead>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Phòng ban</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <TableSkeleton rows={5} cols={5} />
          </Table>
        ) : filtered.length === 0 ? (
          <EmptyState title="Chưa có người dùng" icon={UsersIcon} />
        ) : (
          <Table>
            <Thead>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Phòng ban</th>
              <th className="text-right">Thao tác</th>
            </Thead>
            <Tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="font-mono text-xs font-medium text-slate-700">{u.username}</td>
                  <td className="font-medium text-slate-800">{u.fullName || "—"}</td>
                  <td className="text-slate-500">{u.email || "—"}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Building2 size={13} /> {departmentName(u.departmentId)}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setRolesTarget(u)}
                        title="Xem vai trò duyệt"
                        type="button"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <ShieldCheck size={15} />
                      </button>
                      <button
                        onClick={() => setDeptTarget(u)}
                        title="Chuyển phòng ban"
                        type="button"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <Building2 size={15} />
                      </button>
                      <button
                        onClick={() => setPwdTarget(u)}
                        title="Đổi mật khẩu"
                        type="button"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        title="Sửa"
                        type="button"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        title="Xóa"
                        type="button"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
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
        title={editing ? "Sửa người dùng" : "Thêm người dùng"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={editing ? onSubmitUpdate : onSubmitCreate}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Lưu
            </Button>
          </>
        }
      >
        {editing ? (
          <form onSubmit={onSubmitUpdate} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Họ và tên" {...updateForm.register("fullName")} />
            <TextField
              label="Email"
              type="email"
              error={updateForm.formState.errors.email?.message}
              {...updateForm.register("email")}
            />
            <TextField label="Số điện thoại" {...updateForm.register("phone")} />
            <SelectField label="Phòng ban" {...updateForm.register("departmentId")}>
              <option value="">Chưa gán</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
          </form>
        ) : (
          <form onSubmit={onSubmitCreate} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField
              label="Tên đăng nhập"
              required
              error={createForm.formState.errors.username?.message}
              {...createForm.register("username")}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              required
              error={createForm.formState.errors.password?.message}
              {...createForm.register("password")}
            />
            <TextField label="Họ và tên" {...createForm.register("fullName")} />
            <TextField
              label="Email"
              type="email"
              error={createForm.formState.errors.email?.message}
              {...createForm.register("email")}
            />
            <TextField label="Số điện thoại" {...createForm.register("phone")} />
            <SelectField label="Phòng ban" {...createForm.register("departmentId")}>
              <option value="">Chưa gán</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Vai trò (Role ID)"
              type="number"
              required
              hint="ID vai trò theo dữ liệu seed của backend (VD: 1 = ADMIN, 2 = USER)"
              error={createForm.formState.errors.roleId?.message}
              {...createForm.register("roleId")}
            />
          </form>
        )}
      </Modal>

      <Modal
        open={!!pwdTarget}
        onClose={() => setPwdTarget(null)}
        title={`Đổi mật khẩu — ${pwdTarget?.username ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPwdTarget(null)}>
              Hủy
            </Button>
            <Button onClick={onSubmitPassword} loading={changePasswordMutation.isPending}>
              Đổi mật khẩu
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmitPassword}>
          <TextField
            label="Mật khẩu mới"
            type="password"
            required
            error={pwdForm.formState.errors.newPassword?.message}
            {...pwdForm.register("newPassword")}
          />
        </form>
      </Modal>

      <Modal
        open={!!deptTarget}
        onClose={() => setDeptTarget(null)}
        title={`Chuyển phòng ban — ${deptTarget?.username ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeptTarget(null)}>
              Hủy
            </Button>
            <Button onClick={onSubmitDepartment} loading={assignDepartmentMutation.isPending}>
              Xác nhận
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmitDepartment}>
          <SelectField
            label="Phòng ban"
            required
            error={deptForm.formState.errors.departmentId?.message}
            {...deptForm.register("departmentId")}
          >
            <option value="">Chọn phòng ban…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>
        </form>
      </Modal>

      <UserApprovalRolesModal
        userId={rolesTarget?.id ?? null}
        userName={rolesTarget?.fullName || rolesTarget?.username || ""}
        onClose={() => setRolesTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={removeMutation.isPending}
        title="Xóa người dùng?"
        description={`Tài khoản "${deleteTarget?.username}" sẽ bị xóa khỏi hệ thống.`}
      />
    </div>
  );
}
