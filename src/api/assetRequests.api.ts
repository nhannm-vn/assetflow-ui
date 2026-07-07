import { apiGet, apiPost, apiPut } from "@/lib/axios";
import type { AssetRequestResponse } from "@/types/dto";

// AssetRequestController.cs -> api/asset-requests
export const assetRequestsApi = {
  create: (assetId: number, workflowId: number) =>
    apiPost<AssetRequestResponse>("/api/asset-requests", { assetId, workflowId }),
  getMyRequests: () => apiGet<AssetRequestResponse[]>("/api/asset-requests/my-requests"),
  // Không dùng trong UI: ApprovalController.GetAllRequestsAdmin trả về cùng dữ
  // liệu nhưng đã join sẵn assetName/requesterName, phù hợp hiển thị hơn hẳn.
  // Vẫn giữ ở đây cho đầy đủ bề mặt API của AssetRequestController.
  getAllForAdmin: () => apiGet<AssetRequestResponse[]>("/api/asset-requests/admin/all"),
  getById: (id: number) => apiGet<AssetRequestResponse>(`/api/asset-requests/${id}`),
  cancel: (id: number) => apiPut<boolean>(`/api/asset-requests/${id}/cancel`),
};
