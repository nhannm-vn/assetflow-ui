import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvalsApi } from "@/api/approvals.api";
import { qk } from "@/lib/queryClient";
import type { ApiError, PendingApprovalResponse } from "@/types/dto";

export function usePendingApprovalsQuery() {
  return useQuery<PendingApprovalResponse[], ApiError>({
    queryKey: qk.pendingApprovals,
    queryFn: approvalsApi.getPending,
    retry: false,
  });
}

export function useAdminRequestsQuery() {
  return useQuery({ queryKey: qk.adminRequests, queryFn: approvalsApi.getAllRequestsAdmin });
}

export function useRequestDetailAdminQuery(requestId: number | null) {
  return useQuery({
    queryKey: qk.requestDetailAdmin(requestId ?? 0),
    queryFn: () => approvalsApi.getRequestDetailAdmin(requestId as number),
    enabled: requestId !== null,
  });
}

export function useRequestHistoryQuery(requestId: number | null, admin = false) {
  return useQuery({
    queryKey: qk.requestHistory(requestId ?? 0),
    queryFn: () =>
      admin
        ? approvalsApi.getHistoryAdmin(requestId as number)
        : approvalsApi.getHistory(requestId as number),
    enabled: requestId !== null,
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number; comment?: string }) =>
      approvalsApi.approve(requestId, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pendingApprovals });
      qc.invalidateQueries({ queryKey: qk.adminRequests });
      toast.success("Đã duyệt yêu cầu");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number; comment?: string }) =>
      approvalsApi.reject(requestId, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pendingApprovals });
      qc.invalidateQueries({ queryKey: qk.adminRequests });
      toast.success("Đã từ chối yêu cầu");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
