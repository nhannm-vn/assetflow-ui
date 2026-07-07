import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

interface CrudApi<TResponse, TCreate, TUpdate> {
  getAll: () => Promise<TResponse[]>;
  getById: (id: number) => Promise<TResponse>;
  create: (payload: TCreate) => Promise<TResponse>;
  update: (id: number, payload: TUpdate) => Promise<TResponse>;
  remove: (id: number) => Promise<boolean>;
}

/** Sinh bộ hook useList/useById/useCreate/useUpdate/useRemove cho các
 * resource danh mục đơn giản (categories, locations, suppliers, departments,
 * workflows, approval roles) — tránh lặp lại boilerplate useQuery/useMutation. */
export function createCrudHooks<TResponse, TCreate, TUpdate = TCreate>(
  queryKey: QueryKey,
  api: CrudApi<TResponse, TCreate, TUpdate>,
  entityLabel: string
) {
  function useList() {
    return useQuery({ queryKey, queryFn: api.getAll });
  }

  // Lấy đúng bản ghi mới nhất từ server khi mở form sửa, thay vì chỉ tin vào
  // dữ liệu đã cache trong danh sách (có thể vừa được người khác cập nhật).
  function useById(id: number | null) {
    return useQuery({
      queryKey: [...queryKey, id ?? 0],
      queryFn: () => api.getById(id as number),
      enabled: id !== null,
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: api.create,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey });
        toast.success(`Tạo ${entityLabel} thành công`);
      },
      onError: (err: { message?: string }) => toast.error(err.message ?? "Thao tác thất bại"),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: TUpdate }) => api.update(id, payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey });
        toast.success(`Cập nhật ${entityLabel} thành công`);
      },
      onError: (err: { message?: string }) => toast.error(err.message ?? "Thao tác thất bại"),
    });
  }

  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => api.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey });
        toast.success(`Đã xóa ${entityLabel}`);
      },
      onError: (err: { message?: string }) => toast.error(err.message ?? "Xóa thất bại"),
    });
  }

  return { useList, useById, useCreate, useUpdate, useRemove };
}
