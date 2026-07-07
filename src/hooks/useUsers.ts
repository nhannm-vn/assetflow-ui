import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/api/users.api";
import { qk } from "@/lib/queryClient";
import type { ApiError, CreateUserRequest, UpdateUserRequest } from "@/types/dto";

export function useUsersQuery() {
  return useQuery({ queryKey: qk.users, queryFn: usersApi.getAll });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => usersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.users });
      toast.success("Tạo người dùng thành công");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequest }) => usersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.users });
      toast.success("Cập nhật người dùng thành công");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useRemoveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.users });
      toast.success("Đã xóa người dùng");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      usersApi.changePassword(id, newPassword),
    onSuccess: () => toast.success("Đã đổi mật khẩu"),
    onError: (err: ApiError) => toast.error(err.message),
  });
}

// UserController.AssignDepartment — endpoint riêng cho việc chuyển phòng ban
// nhanh, tách biệt khỏi form sửa thông tin chung (UpdateUserRequest).
export function useAssignUserDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, departmentId }: { id: number; departmentId: number }) =>
      usersApi.assignDepartment(id, departmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.users });
      toast.success("Đã chuyển phòng ban");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
