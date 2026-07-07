import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assetsApi } from "@/api/assets.api";
import { qk } from "@/lib/queryClient";
import type { AssetFilter, CreateAssetRequestDto, UpdateAssetRequestDto } from "@/types/dto";
import type { AssetStatus } from "@/types/enums";
import type { ApiError } from "@/types/dto";

export function useAssetsQuery(filters: AssetFilter) {
  return useQuery({
    queryKey: qk.assets(filters),
    queryFn: () => assetsApi.getAll(filters),
    placeholderData: (prev) => prev,
  });
}

// AssetsController.GetById — dùng cho màn xem chi tiết 1 tài sản (mở từ
// bảng danh sách), lấy đúng bản ghi mới nhất từ server.
export function useAssetByIdQuery(id: number | null) {
  return useQuery({
    queryKey: qk.asset(id ?? 0),
    queryFn: () => assetsApi.getById(id as number),
    enabled: id !== null,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssetRequestDto) => assetsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Tạo tài sản thành công");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAssetRequestDto }) =>
      assetsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Cập nhật tài sản thành công");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useRemoveAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => assetsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Đã xóa tài sản");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useChangeAssetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AssetStatus }) => assetsApi.changeStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
