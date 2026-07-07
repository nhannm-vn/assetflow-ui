import type { AuthUser } from "@/types/dto";

// Access token thật để xác thực nằm trong HttpOnly cookie do BE set, JS
// không đọc được và cũng không cần đọc. Nhưng LoginResponse cũng trả kèm
// accessToken trong JSON (xem LoginResponse.cs) — ta chỉ dùng bản này để
// decode ra thông tin hiển thị (id, email, role), KHÔNG dùng để gọi API.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const NAME_ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const EMAIL_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

export function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const id = Number(payload[NAME_ID_CLAIM] ?? payload.nameid ?? payload.sub ?? NaN);
  const email = (payload[EMAIL_CLAIM] ?? payload.email ?? "") as string;

  // Backend lấy claim role trực tiếp từ Role.Name trong DB (xem JWTService.cs:
  // `new Claim(ClaimTypes.Role, user.Role.Name ?? "")`), KHÔNG cố định là chuỗi
  // "ADMIN"/"USER". Chuỗi thật có thể là "Admin", "admin", "Administrator"...
  // tuỳ dữ liệu seed. So khớp chính xác chuỗi ("ADMIN" === "Admin") sẽ luôn
  // sai và khiến tài khoản admin bị coi là nhân viên thường — vì vậy chỉ cần
  // chuỗi role có chứa "admin" (không phân biệt hoa/thường) là đủ.
  const rawRole = String(payload[ROLE_CLAIM] ?? payload.role ?? "");
  if (!rawRole) {
    console.warn(
      "[AssetHub] Không tìm thấy claim role trong access token. " +
        "Kiểm tra User.RoleId trong DB có trỏ đúng 1 bản ghi Role hợp lệ không."
    );
  }
  const role: AuthUser["role"] = /admin/i.test(rawRole) ? "ADMIN" : "USER";

  if (Number.isNaN(id)) return null;
  return { id, email, role };
}
