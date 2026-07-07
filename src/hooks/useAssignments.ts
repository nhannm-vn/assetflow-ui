import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assignmentsApi } from "@/api/assignments.api";
import { qk } from "@/lib/queryClient";
import type { ApiError } from "@/types/dto";

export function useMyAssignmentsQuery() {
  return useQuery({ queryKey: qk.myAssignments, queryFn: assignmentsApi.getMyAssets });
}

export function useAdminAssignmentsQuery() {
  return useQuery({ queryKey: qk.adminAssignments, queryFn: assignmentsApi.getAll });
}

// AssignmentController.GetById — dùng để lấy bản ghi bàn giao mới nhất khi
// admin mở xem chi tiết 1 dòng, thay vì chỉ tin vào dữ liệu đã cache trong
// danh sách (có thể vừa được cập nhật ở nơi khác).
export function useAssignmentByIdQuery(id: number | null) {
  return useQuery({
    queryKey: qk.assignment(id ?? 0),
    queryFn: () => assignmentsApi.getById(id as number),
    enabled: id !== null,
  });
}

export function useReturnAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: number) => assignmentsApi.returnAsset(assetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myAssignments });
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Đã trả tài sản");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
