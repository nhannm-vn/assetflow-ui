import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { AssetTag } from "@/components/ui/AssetTag";
import { Spinner, EmptyState } from "@/components/ui/DataDisplay";
import { useAssetByIdQuery } from "@/hooks/useAssets";
import { categoryHooks, locationHooks, supplierHooks } from "@/hooks/useCatalog";
import { ASSET_STATUS_META, statusMeta } from "@/types/enums";
import { formatCurrency } from "@/lib/format";

interface AssetDetailModalProps {
  assetId: number | null;
  onClose: () => void;
}

/** AssetsController.GetById — xem chi tiết đầy đủ 1 tài sản (mã, loại, vị
 * trí, nhà cung cấp, giá trị, trạng thái), dùng chung cho cả ADMIN và USER. */
export function AssetDetailModal({ assetId, onClose }: AssetDetailModalProps) {
  const { data: asset, isLoading } = useAssetByIdQuery(assetId);
  const { data: categories = [] } = categoryHooks.useList();
  const { data: locations = [] } = locationHooks.useList();
  const { data: suppliers = [] } = supplierHooks.useList();

  const meta = asset ? statusMeta(ASSET_STATUS_META, asset.status) : null;

  return (
    <Modal open={assetId !== null} onClose={onClose} title="Chi tiết tài sản">
      {isLoading ? (
        <Spinner />
      ) : !asset ? (
        <EmptyState title="Không tìm thấy tài sản" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <AssetTag>{asset.assetCode}</AssetTag>
            {meta && <Badge color={meta.color}>{meta.label}</Badge>}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{asset.name}</h3>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Loại tài sản</p>
              <p className="font-medium text-slate-800">
                {categories.find((c) => c.id === asset.categoryId)?.name ?? `#${asset.categoryId}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Vị trí</p>
              <p className="font-medium text-slate-800">
                {locations.find((l) => l.id === asset.locationId)?.name ?? `#${asset.locationId}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Nhà cung cấp</p>
              <p className="font-medium text-slate-800">
                {asset.supplierId
                  ? (suppliers.find((s) => s.id === asset.supplierId)?.name ?? `#${asset.supplierId}`)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Giá trị</p>
              <p className="font-medium text-slate-800">{formatCurrency(asset.value)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
