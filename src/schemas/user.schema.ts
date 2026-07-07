import { z } from "zod";

export const createUserFormSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  fullName: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Vui lòng nhập Role ID"),
  departmentId: z.string().optional(),
});
export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const updateUserFormSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
});
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

export const changePasswordFormSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const assignDepartmentFormSchema = z.object({
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
});
export type AssignDepartmentFormValues = z.infer<typeof assignDepartmentFormSchema>;
