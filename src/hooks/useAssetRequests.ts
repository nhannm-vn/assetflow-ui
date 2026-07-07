import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assetRequestsApi } from "@/api/assetRequests.api";
import { qk } from "@/lib/queryClient";
import type { ApiError } from "@/types/dto";

export function useMyRequestsQuery() {
  return useQuery({ queryKey: qk.myRequests, queryFn: assetRequestsApi.getMyRequests });
}

// AssetRequestController.GetById trả bản ghi gốc (có workflowId) — dùng kết
// hợp với ApprovalController.GetRequestDetailAdmin (có assetName/requesterName
// join sẵn) để tạo màn chi tiết yêu cầu đầy đủ cho admin, xem RequestDetailModal.tsx.
export function useAssetRequestByIdQuery(id: number | null) {
  return useQuery({
    queryKey: qk.assetRequest(id ?? 0),
    queryFn: () => assetRequestsApi.getById(id as number),
    enabled: id !== null,
  });
}

export function useCreateAssetRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, workflowId }: { assetId: number; workflowId: number }) =>
      assetRequestsApi.create(assetId, workflowId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myRequests });
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Đã gửi yêu cầu mượn tài sản");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useCancelAssetRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => assetRequestsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myRequests });
      toast.success("Đã hủy yêu cầu");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
