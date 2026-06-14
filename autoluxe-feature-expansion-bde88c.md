# AutoLuxe Multi-Phase Expansion Plan

Kế hoạch này triển khai theo nhiều phase ưu tiên `checkout mới`, `account/settings`, và `admin moderation`, đồng thời hoàn thiện luồng catalog/detail/brands, notifications nâng cao, và i18n + quy đổi VNĐ toàn hệ thống.

## 1) Scope đã khóa với bạn
- Triển khai theo **nhiều phase**; mỗi lần nhờ AI code sẽ làm trọn **một phase**.
- Ưu tiên cao nhất: `admin moderation`, `account/settings`, `checkout mới`.
- Cho phép tạo trang mới thoải mái (ví dụ: `account.html`, `my-purchases.html`, `admin.html`).
- Catalog -> detail phải luôn mở được; nếu thiếu dữ liệu thì hiển thị tối thiểu + trạng thái “đang cập nhật”.
- Nguồn dữ liệu xe dùng **API adapter** để cắm provider có key sau này; nếu thiếu ảnh thì fallback ảnh mặc định.
- Brands -> Catalog phải tự chọn hãng + tự fetch; áp dụng cho cả brand page và brand strip trang chủ; card brand có ảnh cover lớn.
- Checkout mới dạng 2 bước, mô phỏng thẻ (Visa/Master/JCB/Amex), có mô phỏng success/fail, lưu localStorage.
- Mua không bắt buộc login; guest được cảnh báo dữ liệu local-only; có merge đơn guest vào user khi login.
- Trang đơn hàng tên `my-purchases`; hủy trong đúng 7 ngày; quá hạn thì chỉ cập nhật delivered khi vào trang này.
- Hủy mua sẽ trả xe về available; có countdown; có notification buyer/seller; khi delivered thì nhắc đánh giá.
- Account gộp profile + settings; profile có phone/address/avatar/password.
- Navbar: khi đã login thì ẩn theme/language khỏi header, thay bằng avatar + tên (click vào account); guest vẫn thấy theme/language trên navbar.
- Chỉ 1 admin; email cố định: `admin@autoluxe.local` (mặc định đề xuất trong triển khai: `Admin@123456`, có thể đổi sau).
- Post cũ migrate thành approved để không mất dữ liệu đang hiển thị.
- Post bị reject: ẩn public marketplace, nhưng vẫn hiện trong My Listings của user kèm lý do.
- Availability xe dựa trên exact `brand + model`; nếu không có xe bán thì disable nút và hiện thông báo rõ.
- Tiếng Việt: quy đổi thật với tỷ giá cố định `1 USD = 25,000 VND`; format `1.234.567 ₫`; tiếng Anh giữ USD.
- Toàn bộ tính năng mới phải hỗ trợ VI/EN đầy đủ.

## 2) Quy ước phân chia model (token-efficient)
- **GPT-5 Codex XHigh**: phần code nặng, thay đổi đa file, migration dữ liệu, state management, luồng nghiệp vụ phức tạp.
- **Claude Opus 4.6 Thinking Max**: phần chuẩn hóa UX copy, i18n key map, edge-case rules, acceptance checklist chi tiết theo phase.

> Nguyên tắc chạy: mỗi prompt code tương ứng một phase; không tách task lẻ.

## 3) Data model & migration blueprint (blocker chung)
### 3.1 LocalStorage keys giữ nguyên + mở rộng
- Giữ: `autoluxe_users`, `autoluxe_session`, `autoluxe_market_posts`, `autoluxe_orders`, `autoluxe_notifications`, `autoluxe_theme`, `autoluxe_locale`.
- Mở rộng đề xuất:
  - `autoluxe_market_posts`: thêm moderation + availability field tách bạch.
  - `autoluxe_orders`: thêm lifecycle field cho cancel window, shipping note, delivery reminder.
  - `autoluxe_profiles` (mới): profile chi tiết (phone/address/avatar).
  - `autoluxe_payment_drafts` (mới, optional): lưu tạm form bước 1/2 khi checkout nhiều bước.

### 3.2 Chuẩn trạng thái mới
- Listing moderation: `pending_approval | approved | rejected`.
- Listing availability: `available | pending_payment | sold`.
- Order status: `new | confirmed | rejected | shipping | delivered | cancelled`.

### 3.3 Migration rules
- Post cũ không có moderation field -> set `approved`.
- Post cũ availability đang dùng field cũ -> map sang `available/pending_payment/sold`.
- Không xóa dữ liệu cũ; chỉ enrich schema theo version.

---

## 4) Phase roadmap chi tiết (theo ưu tiên)

## Phase 0 - Foundation & Adapter Layer (bắt buộc trước phase lớn)
**Mục tiêu:** chuẩn hóa schema và tạo nền adapter để tránh sửa chắp vá ở các phase sau.

### Subtasks
- [GPT-5] P0.1 Tạo migration helper có versioning cho `market_posts`, `orders`, `profiles`.
- [GPT-5] P0.2 Tách util normalize `brand/model` dùng chung (exact matching, trim/case-safe).
- [GPT-5] P0.3 Thiết kế `car-data adapter` (interface fetch detail + fetch image + fallback policy).
- [Claude] P0.4 Chốt rule fallback dữ liệu detail tối thiểu + text “đang cập nhật” cho VI/EN.
- [Claude] P0.5 Lập danh mục key i18n mới cho các phase 1-6 để tránh thiếu text runtime.

### Acceptance
- Migration chạy không làm mất dữ liệu hiện có.
- Adapter có thể thay provider mà không đổi luồng UI chính.

---

## Phase 1 - Checkout V2 + My Purchases (Priority #1)
**Mục tiêu:** hoàn thiện luồng mua mô phỏng 2 bước + quản lý vòng đời đơn hàng sau mua.

### Subtasks
- [GPT-5] P1.1 Refactor `checkout` thành 2 bước: Buyer info -> Card payment.
- [GPT-5] P1.2 Hỗ trợ card type demo đa loại (Visa/Master/JCB/Amex) + validate tương ứng.
- [GPT-5] P1.3 Mô phỏng payment gateway (success/fail ngẫu nhiên có retry).
- [GPT-5] P1.4 Lưu order snapshot đầy đủ (buyer, card payload demo, listing snapshot, timestamps, status timeline).
- [GPT-5] P1.5 Guest checkout: lưu theo `guestId`; cảnh báo local-only persistence; không bắt buộc login.
- [GPT-5] P1.6 Khi user login: merge đơn guest vào user hiện tại (không tạo trùng).
- [GPT-5] P1.7 Tạo trang `my-purchases.html` + bộ lọc trạng thái + detail từng đơn.
- [GPT-5] P1.8 Implement cancel window đúng 7 ngày (countdown realtime khi render).
- [GPT-5] P1.9 Hủy thành công -> listing về `available`; đồng bộ trạng thái order + notification.
- [GPT-5] P1.10 Khi vào `my-purchases`, auto cập nhật đơn quá hạn thành `delivered` + gửi nhắc đánh giá.
- [Claude] P1.11 Chốt text/UX cho các trạng thái pending/success/fail/cancel/delivered song ngữ.

### Acceptance
- Luồng `Mua xe -> 2 bước -> tạo đơn` chạy cho cả guest và logged-in.
- `my-purchases` hiển thị đúng countdown, điều kiện hủy, và trạng thái delivered cập nhật khi mở trang.

---

## Phase 2 - Account/Profile/Settings (Priority #2)
**Mục tiêu:** nâng cấp account từ logout-only thành trung tâm quản lý user đầy đủ.

### Subtasks
- [GPT-5] P2.1 Tạo `account.html` (tab Profile + Settings) và route điều hướng từ header.
- [GPT-5] P2.2 Header logged-in hiển thị `avatar + displayName` và dropdown account.
- [GPT-5] P2.3 Profile form: display name, phone, address, avatar upload (base64/local).
- [GPT-5] P2.4 Nếu upload avatar phức tạp, đảm bảo tối thiểu có nút upload + binding UI stub như bạn yêu cầu.
- [GPT-5] P2.5 Password change yêu cầu `current password` trước khi set password mới.
- [GPT-5] P2.6 Settings tab chứa theme/language cho user đăng nhập (thay vì navbar).
- [GPT-5] P2.7 Guest vẫn giữ theme/language controls trên navbar; logged-in thì ẩn khỏi navbar.
- [Claude] P2.8 Chốt copy/validation/i18n cho profile, password, settings.

### Acceptance
- User đăng nhập có thể vào account, sửa profile, đổi password có xác thực mật khẩu cũ.
- Theme/language hành xử đúng theo trạng thái guest/logged-in.

---

## Phase 3 - Admin Moderation + Admin Orders (Priority #3)
**Mục tiêu:** thêm vai trò admin để duyệt tin rao và phản hồi đơn mua có ghi chú.

### Subtasks
- [GPT-5] P3.1 Seed/admin bootstrap role với email `admin@autoluxe.local` + password mặc định an toàn.
- [GPT-5] P3.2 Bổ sung role field vào session/user guard (`admin` vs `user`).
- [GPT-5] P3.3 Post editor submit mới -> vào `pending_approval` thay vì public ngay.
- [GPT-5] P3.4 Tạo `admin.html` (hoặc admin tabs trong account) cho queue duyệt post.
- [GPT-5] P3.5 Approve/reject listing; reject bắt buộc lý do.
- [GPT-5] P3.6 Listing rejected ẩn khỏi marketplace public nhưng hiện trong My Listings kèm reason.
- [GPT-5] P3.7 Admin order management: đổi trạng thái `new/confirmed/rejected/shipping/delivered` + note.
- [GPT-5] P3.8 User order history hiển thị phản hồi admin theo timeline.
- [Claude] P3.9 Chốt policy edge cases (admin đổi trạng thái sai thứ tự, reject sau confirm, v.v.) + text song ngữ.

### Acceptance
- User post mới không public trước khi admin duyệt.
- Admin xử lý đơn mua có note và user nhìn thấy lịch sử phản hồi đầy đủ.

---

## Phase 4 - Catalog/Detail/Brands & Market Linking
**Mục tiêu:** sửa triệt để trải nghiệm khám phá xe và nối liền catalog với marketplace.

### Subtasks
- [GPT-5] P4.1 Sửa detail lookup để luôn mở được từ `make/model` (không còn not-found cứng).
- [GPT-5] P4.2 Nếu thiếu dữ liệu đầy đủ -> render block thông tin tối thiểu + “đang cập nhật”.
- [GPT-5] P4.3 Brands -> Catalog deep-link `?make=...` auto-select + auto-fetch model list.
- [GPT-5] P4.4 Áp dụng deep-link tương tự cho brand strip ở `index`.
- [GPT-5] P4.5 Card brand thêm ảnh cover lớn/card (fallback ảnh mặc định).
- [GPT-5] P4.6 Trong car card + car detail: hiển thị số lượng listing đang bán (exact brand+model, only approved+available).
- [GPT-5] P4.7 Nút “xem xe đang bán” sang marketplace với prefill filter; nếu không có listing thì disable + thông báo.
- [Claude] P4.8 Chốt text trạng thái availability song ngữ và nội dung fallback.

### Acceptance
- Từ brands/home sang catalog auto lọc đúng hãng.
- Từ catalog/detail sang marketplace thấy đúng kết quả prefill hoặc disabled state rõ ràng.

---

## Phase 5 - Notifications 2.0 (gắn nghiệp vụ thật)
**Mục tiêu:** biến notification thành trung tâm phản hồi theo nghiệp vụ admin/user/order.

### Subtasks
- [GPT-5] P5.1 Chuẩn hóa notification payload theo event type + deep link target.
- [GPT-5] P5.2 Event coverage: post approved/rejected, order created, order status changed, cancel success, delivered, review reminder.
- [GPT-5] P5.3 Buyer/seller/admin nhận đúng đối tượng theo event.
- [GPT-5] P5.4 Notification click mở đúng trang + context (post/order/detail).
- [Claude] P5.5 Biên soạn message template VI/EN cho từng event type.

### Acceptance
- Mỗi hành động chính đều sinh thông báo đúng người, đúng ngữ cảnh, đúng ngôn ngữ.

---

## Phase 6 - i18n + Currency + Date/Time Localization
**Mục tiêu:** mọi tính năng mới hoạt động đầy đủ trên cả VI và EN, bao gồm format tiền/timestamp.

### Subtasks
- [GPT-5] P6.1 Centralize formatter tiền tệ theo locale và currency mode.
- [GPT-5] P6.2 Với `vi`: convert USD->VND bằng tỷ giá cố định `25000`, format `1.234.567 ₫`.
- [GPT-5] P6.3 Với `en`: giữ USD format chuẩn `en-US`.
- [GPT-5] P6.4 Localize ngày giờ/timestamp theo `vi-VN` và `en-US`.
- [GPT-5] P6.5 Rà soát toàn bộ text mới (checkout/account/admin/orders/notifications) qua i18n keys.
- [Claude] P6.6 Soát từ vựng nhất quán + fallback key nếu thiếu bản dịch.

### Acceptance
- Chuyển VI/EN không còn text cứng trong tính năng mới.
- Giá tiền và thời gian đổi đúng theo locale.

---

## Phase 7 - QA, Regression, and Demo Readiness
**Mục tiêu:** xác nhận ổn định trước khi chuyển sang coding phase tiếp theo hoặc bàn giao demo.

### Subtasks
- [GPT-5] P7.1 Smoke test theo persona: guest, user, admin.
- [GPT-5] P7.2 E2E flows: post listing -> admin approve -> buyer checkout -> my-purchases -> cancel/deliver -> review reminder.
- [GPT-5] P7.3 Regression luồng cũ: wishlist, market-detail reviews, auth session, notifications panel.
- [Claude] P7.4 UX/i18n QA checklist theo từng page + lỗi wording.
- [Claude] P7.5 Final acceptance checklist theo phase để chạy nghiệm thu nhanh.

### Acceptance
- Không vỡ luồng cũ; tất cả luồng mới đạt tiêu chí nghiệp vụ đã khóa.

---

## 5) Phân bổ theo lần gọi AI (đúng yêu cầu “full phase mỗi lần”)
1. **Run A:** Phase 0 + Phase 1 (nền + checkout/my-purchases).
2. **Run B:** Phase 2 (account/settings).
3. **Run C:** Phase 3 (admin moderation + admin orders).
4. **Run D:** Phase 4 + Phase 5 (catalog/brands/linking + notifications nghiệp vụ).
5. **Run E:** Phase 6 + Phase 7 (i18n/currency/date + QA).

> Nếu muốn ưu tiên tuyệt đối theo thứ tự bạn chọn, có thể đổi thành: `Run A: P2`, `Run B: P3`, `Run C: P1`, nhưng phương án trên giúp giảm refactor chồng chéo hơn.

## 6) Danh sách file dự kiến tác động lớn (để chuẩn bị)
- `assets/js/catalog.js`, `assets/js/detail.js`, `assets/js/car-data.js`, `assets/js/api.js`
- `pages/catalog.html`, `pages/car-detail.html`, `pages/brands.html`, `index.html`
- `assets/js/marketplace.js`, `assets/js/market-detail.js`, `assets/js/checkout.js`, `assets/js/auth.js`, `assets/js/notifications.js`, `assets/js/i18n.js`
- `pages/marketplace.html`, `pages/market-detail.html`, `pages/checkout.html`, `pages/auth.html`
- Trang mới dự kiến: `pages/account.html`, `pages/my-purchases.html`, `pages/admin.html` (hoặc biến thể route tương đương)
- CSS mới/bổ sung: account, admin, purchases, checkout-v2 states

## 7) Tiêu chí Done cuối cùng
- Không còn lỗi catalog -> detail `not found` trong các trường hợp dữ liệu thiếu thông tin.
- Admin moderation và order response vận hành đầy đủ, có notification và history cho user.
- Account/settings thay thế logout-only, có avatar + profile/password/settings đúng vai trò.
- Checkout 2 bước + my-purchases + cancel 7 ngày + delivered reminder hoạt động ổn định.
- Availability exact `brand+model` và prefill marketplace đúng hành vi disable/fallback.
- Toàn bộ tính năng mới đổi được VI/EN và format tiền/timestamp đúng locale.
