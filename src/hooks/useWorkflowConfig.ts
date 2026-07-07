import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvalStepsApi, departmentWorkflowsApi, userApprovalRolesApi } from "@/api/workflowConfig.api";
import { qk } from "@/lib/queryClient";
import type {
  ApiError,
  CreateApprovalStepRequest,
  CreateDepartmentWorkflowRequest,
  CreateUserApprovalRoleRequest,
  UpdateUserApprovalRoleRequest,
} from "@/types/dto";

// ---- Approval Steps (con của 1 workflow) ----
export function useApprovalStepsQuery(workflowId: number | null) {
  return useQuery({
    queryKey: qk.approvalSteps(workflowId ?? 0),
    queryFn: () => approvalStepsApi.getByWorkflowId(workflowId as number),
    enabled: workflowId !== null,
  });
}

export function useCreateApprovalStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApprovalStepRequest) => approvalStepsApi.create(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: qk.approvalSteps(variables.workflowId) });
      toast.success("Đã thêm bước duyệt");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useRemoveApprovalStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; workflowId: number }) => approvalStepsApi.remove(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: qk.approvalSteps(variables.workflowId) });
      toast.success("Đã xóa bước duyệt");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

// ---- Department <-> Workflow ----
export function useDepartmentWorkflowsQuery() {
  return useQuery({ queryKey: qk.departmentWorkflows, queryFn: departmentWorkflowsApi.getAll });
}

// Dùng khi cần lọc theo 1 phòng ban cụ thể (VD: bộ lọc trên trang gán quy trình)
export function useDepartmentWorkflowsByDepartmentQuery(departmentId: number | null) {
  return useQuery({
    queryKey: qk.departmentWorkflowsByDepartment(departmentId ?? 0),
    queryFn: () => departmentWorkflowsApi.getByDepartmentId(departmentId as number),
    enabled: departmentId !== null,
  });
}

// Dùng trong panel chi tiết quy trình (WorkflowsPage) để biết quy trình đang
// áp dụng cho những phòng ban nào.
export function useDepartmentWorkflowsByWorkflowQuery(workflowId: number | null) {
  return useQuery({
    queryKey: qk.departmentWorkflowsByWorkflow(workflowId ?? 0),
    queryFn: () => departmentWorkflowsApi.getByWorkflowId(workflowId as number),
    enabled: workflowId !== null,
  });
}

export function useCreateDepartmentWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentWorkflowRequest) => departmentWorkflowsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.departmentWorkflows });
      toast.success("Đã gán quy trình cho phòng ban");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useRemoveDepartmentWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentWorkflowsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.departmentWorkflows });
      toast.success("Đã gỡ gán");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

// ---- User <-> Approval Role ----
export function useUserApprovalRolesQuery() {
  return useQuery({ queryKey: qk.userApprovalRoles, queryFn: userApprovalRolesApi.getAll });
}

// Dùng cho action "Xem vai trò duyệt" trên trang Người dùng — lọc thẳng
// theo 1 user thay vì tải toàn bộ danh sách rồi filter phía client.
export function useUserApprovalRolesByUserQuery(userId: number | null) {
  return useQuery({
    queryKey: qk.userApprovalRolesByUser(userId ?? 0),
    queryFn: () => userApprovalRolesApi.getByUserId(userId as number),
    enabled: userId !== null,
  });
}

export function useCreateUserApprovalRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserApprovalRoleRequest) => userApprovalRolesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.userApprovalRoles });
      toast.success("Phân quyền duyệt thành công");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useUpdateUserApprovalRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserApprovalRoleRequest }) =>
      userApprovalRolesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.userApprovalRoles });
      toast.success("Cập nhật thành công");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useRemoveUserApprovalRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApprovalRolesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.userApprovalRoles });
      toast.success("Đã gỡ phân quyền");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
