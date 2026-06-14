# AutoLuxe Phase 7 QA Demo Readiness

Trang này đi kèm với `pages/qa.html` để bạn chạy kiểm thử nhanh trước demo.

## 1) Automated suite (trên QA Center)

Mở `pages/qa.html` và bấm `Run Phase 7 QA Suite`.

Bộ test sẽ tự động chạy các nhóm sau trong sandbox dữ liệu localStorage:

- **P7.1 Persona smoke**: guest, user, admin.
- **P7.2 E2E flow**: post listing -> admin approve -> buyer checkout -> cancel -> auto-delivered + review reminder.
- **P7.3 Regression**: wishlist, review data + seller notification, auth session lifecycle, notifications badge/panel.

Sau khi chạy xong, dữ liệu localStorage gốc sẽ được restore.

## 2) Manual QA checklist (trên QA Center)

`pages/qa.html` có 2 checklist:

- **P7.4 UX + i18n checklist** theo từng page chính.
- **P7.5 Final acceptance checklist** theo phase 0 -> 7.

Bạn có thể tick trực tiếp trên UI, progress được lưu local.

## 3) Demo gate khuyến nghị

Chỉ nên coi là demo-ready khi:

- Automation summary không còn `FAILED`.
- Checklist UX/i18n đã tick đủ các mục liên quan bản demo.
- Checklist final acceptance đã tick xong phase 0 -> 7.
- Wording/copy notes đã được xử lý hoặc có note chấp nhận tạm thời.
