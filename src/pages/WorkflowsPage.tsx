import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Workflow as WorkflowIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField, TextAreaField, SelectField } from "@/components/ui/FormField";
import { PageHeader, Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { workflowHooks, approvalRoleHooks, departmentHooks } from "@/hooks/useCatalog";
import {
  useApprovalStepsQuery,
  useCreateApprovalStep,
  useRemoveApprovalStep,
  useDepartmentWorkflowsByWorkflowQuery,
} from "@/hooks/useWorkflowConfig";
import {
  workflowFormSchema,
  approvalStepFormSchema,
  type WorkflowFormValues,
  type ApprovalStepFormValues,
} from "@/schemas/catalog.schema";
import type { WorkflowResponse } from "@/types/dto";

export default function WorkflowsPage() {
  const { data: workflows = [], isLoading } = workflowHooks.useList();
  const { data: roles = [] } = approvalRoleHooks.useList();
  const createWorkflow = workflowHooks.useCreate();
  const updateWorkflow = workflowHooks.useUpdate();
  const removeWorkflow = workflowHooks.useRemove();

  const [selected, setSelected] = useState<WorkflowResponse | null>(null);
  const { data: steps = [], isLoading: stepsLoading } = useApprovalStepsQuery(selected?.id ?? null);
  const { data: departments = [] } = departmentHooks.useList();
  const { data: appliedDepartments = [] } = useDepartmentWorkflowsByWorkflowQuery(selected?.id ?? null);
  const createStep = useCreateApprovalStep();
  const removeStep = useRemoveApprovalStep();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowResponse | null>(null);

  const workflowForm = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (formOpen) {
      workflowForm.reset(
        editing
          ? { name: editing.name, description: editing.description ?? "" }
          : { name: "", description: "" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, editing]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(wf: WorkflowResponse, e: MouseEvent) {
    e.stopPropagation();
    setEditing(wf);
    setFormOpen(true);
  }

  const onSubmitWorkflow = workflowForm.handleSubmit((values) => {
    const payload = { name: values.name, description: values.description || undefined };
    if (editing) {
      updateWorkflow.mutate({ id: editing.id, payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createWorkflow.mutate(payload, {
        onSuccess: (created) => {
          setFormOpen(false);
          // Chuyển thẳng sang panel cấu hình bước duyệt của quy trình vừa tạo,
          // để "tạo quy trình" là một luồng liền mạch chứ không phải 2 bước rời rạc.
          setSelected(created);
        },
      });
    }
  });

  function handleDeleteWorkflow() {
    if (!deleteTarget) return;
    removeWorkflow.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (selected?.id === deleteTarget.id) setSelected(null);
        setDeleteTarget(null);
      },
    });
  }

  const stepForm = useForm<ApprovalStepFormValues>({
    resolver: zodResolver(approvalStepFormSchema),
    defaultValues: { stepOrder: "", approvalRoleId: "" },
  });

  const onSubmitStep = stepForm.handleSubmit((values) => {
    if (!selected) return;
    createStep.mutate(
      {
        workflowId: selected.id,
        stepOrder: values.stepOrder ? Number(values.stepOrder) : steps.length + 1,
        approvalRoleId: Number(values.approvalRoleId),
      },
      { onSuccess: () => stepForm.reset({ stepOrder: "", approvalRoleId: "" }) }
    );
  });

  function roleName(id: number) {
    return roles.find((r) => r.id === id)?.name ?? `#${id}`;
  }

  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div>
      <PageHeader
        eyebrow="Quy trình duyệt"
        title="Quy trình phê duyệt"
        description="Định nghĩa quy trình và các bước duyệt tuần tự theo vai trò."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Tạo quy trình
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card padded={false} className="overflow-hidden lg:col-span-2">
          {isLoading ? (
            <Spinner />
          ) : workflows.length === 0 ? (
            <EmptyState
              title="Chưa có quy trình nào"
              description="Tạo quy trình đầu tiên để bắt đầu cấu hình các bước duyệt."
              icon={WorkflowIcon}
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus size={14} /> Tạo quy trình
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => setSelected(wf)}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors",
                    selected?.id === wf.id ? "bg-indigo-50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{wf.name}</p>
                    <p className="truncate text-xs text-slate-400">{wf.description || "Không có mô tả"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      onClick={(e) => openEdit(wf, e)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil size={14} />
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(wf);
                      }}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-3">
          {!selected ? (
            <EmptyState
              title="Chọn một quy trình"
              description="Chọn quy trình bên trái để xem và cấu hình các bước duyệt."
              icon={ArrowRight}
            />
          ) : (
            <div>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-indigo-600">
                Chi tiết quy trình
              </p>
              <h3 className="mb-1 text-lg font-semibold text-slate-900">{selected.name}</h3>

              <div className="mb-5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400">Đang áp dụng cho:</span>
                {appliedDepartments.length === 0 ? (
                  <span className="text-xs text-slate-400">chưa có phòng ban nào</span>
                ) : (
                  appliedDepartments.map((dw) => {
                    const dep = departments.find((d) => d.id === dw.departmentId);
                    return (
                      <span
                        key={dw.id}
                        className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        {dep?.name ?? `#${dw.departmentId}`}
                      </span>
                    );
                  })
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Các bước duyệt
              </p>

              {stepsLoading ? (
                <Spinner />
              ) : sortedSteps.length === 0 ? (
                <EmptyState title="Chưa có bước duyệt" description="Thêm bước đầu tiên bên dưới." />
              ) : (
                <ol className="mb-5 flex flex-col gap-2">
                  {sortedSteps.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 font-mono text-xs font-bold text-white">
                          {s.stepOrder}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {roleName(s.approvalRoleId)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeStep.mutate({ id: s.id, workflowId: selected.id })}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              {roles.length === 0 && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                  <span>Chưa có vai trò duyệt nào — cần tạo trước khi thêm bước.</span>
                  <Link to="/approval-roles" className="font-semibold underline underline-offset-2">
                    Tạo vai trò duyệt
                  </Link>
                </div>
              )}

              <form
                onSubmit={onSubmitStep}
                className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3.5"
              >
                <TextField
                  label="Thứ tự bước"
                  type="number"
                  min={1}
                  placeholder={String(steps.length + 1)}
                  className="w-28"
                  {...stepForm.register("stepOrder")}
                />
                <SelectField
                  label="Vai trò duyệt"
                  required
                  disabled={roles.length === 0}
                  className="w-48"
                  error={stepForm.formState.errors.approvalRoleId?.message}
                  {...stepForm.register("approvalRoleId")}
                >
                  <option value="">Chọn vai trò…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (cấp {r.level})
                    </option>
                  ))}
                </SelectField>
                <Button type="submit" loading={createStep.isPending} disabled={roles.length === 0}>
                  <Plus size={15} /> Thêm bước
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Sửa quy trình" : "Tạo quy trình"}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={onSubmitWorkflow} loading={createWorkflow.isPending || updateWorkflow.isPending}>
              Lưu
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmitWorkflow} className="flex flex-col gap-3.5">
          <TextField
            label="Tên quy trình"
            required
            error={workflowForm.formState.errors.name?.message}
            {...workflowForm.register("name")}
          />
          <TextAreaField label="Mô tả" {...workflowForm.register("description")} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteWorkflow}
        loading={removeWorkflow.isPending}
        title="Xóa quy trình?"
        description={`Quy trình "${deleteTarget?.name}" và toàn bộ bước duyệt liên quan sẽ bị ảnh hưởng.`}
      />
    </div>
  );
}
