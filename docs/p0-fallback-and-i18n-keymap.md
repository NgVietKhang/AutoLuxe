# P0.4 & P0.5 — Fallback Rules + i18n Key Map (Phase 1–6)

> **Mục đích:** Chuẩn hóa quy tắc hiển thị khi thiếu dữ liệu và cung cấp danh mục i18n key đầy đủ cho các phase mới, sẵn sàng để dev code trực tiếp.

---

## A. P0.4 — FALLBACK RULES CHO CAR DETAIL

### A.1 Nguyên tắc chung

| # | Quy tắc | Ghi chú |
|---|---------|---------|
| 1 | Trang detail **LUÔN mở được** nếu URL có `make` hoặc `model` hợp lệ | Không bao giờ redirect ra 404 khi còn thông tin tối thiểu |
| 2 | Thiếu field → hiển thị **text fallback thân thiện**, không để trống, không hiện key thô | Áp dụng cho cả spec lẫn description |
| 3 | Ảnh thiếu → dùng `PLACEHOLDER_IMAGE` global (unsplash generic supercar) | Thuộc tính `onerror` trên `<img>` cũng trỏ về placeholder |
| 4 | Nút CTA (Marketplace, Wishlist) vẫn render bình thường | Không disable do thiếu data; chỉ disable khi post unavailable |
| 5 | Text fallback phải **thân thiện**, ngụ ý "sẽ bổ sung sớm", không gợi ý lỗi hệ thống | User không bao giờ thấy `null`, `undefined`, `N/A` trần |

### A.2 Bảng fallback theo field

| Field | Điều kiện thiếu | Fallback hiển thị (VI) | Fallback hiển thị (EN) | i18n key |
|-------|-----------------|------------------------|------------------------|----------|
| **Title (h1)** | `!make && !model` | `Xe đang cập nhật` | `Car Updating` | `detail.fallback_title` |
| **Title (h1)** | có `make`, thiếu `model` | `{make}` (chỉ hiện make) | `{make}` | — (logic render) |
| **Title (h1)** | thiếu `make`, có `model` | `{model}` (chỉ hiện model) | `{model}` | — (logic render) |
| **Year** | `!year` hoặc `year === null` | `Đang cập nhật` / `N/A`* | `Updating` / `N/A`* | `common.updating` / `common.na` |
| **Horsepower** | `!horsepower` | `Đang cập nhật` / `N/A`* | `Updating` / `N/A`* | `common.updating` / `common.na` |
| **Top Speed** | `!topSpeed` | `Đang cập nhật` / `N/A`* | `Updating` / `N/A`* | `common.updating` / `common.na` |
| **0-100 km/h** | `!zeroToHundred` | `Đang cập nhật` / `N/A`* | `Updating` / `N/A`* | `common.updating` / `common.na` |
| **Engine** | `!engine` | `Đang cập nhật` / `N/A`* | `Updating` / `N/A`* | `common.updating` / `common.na` |
| **Drivetrain** | `!drivetrain` | `Đang cập nhật` / `N/A`* | `Updating` / `N/A`* | `common.updating` / `common.na` |
| **Description** | `!shortDescription && !longDescription` | `Thông tin mô tả đang được cập nhật.` / `N/A`* | `Description is being updated.` / `N/A`* | `detail.desc_updating` / `common.na` |

\* Sau khi `enrichCarDetail` hoàn tất (`car._enrichmentAttempted === true`) mà field vẫn trống → dùng `common.na` thay vì `common.updating`.
| **Hero Image** | `!heroImage` hoặc URL lỗi | `PLACEHOLDER_IMAGE` (unsplash) | Cùng giá trị | — (code logic) |
| **Gallery** | `gallery.length === 0` | `[heroImage]` hoặc `[PLACEHOLDER_IMAGE]` | Cùng giá trị | — (code logic) |
| **Breadcrumb** | thiếu `make` | `Catalog → Xe đang cập nhật` | `Catalog → Car Updating` | `detail.fallback_title` |
| **Page title** | thiếu cả make+model | `Chi Tiết Xe - AutoLuxe` | `Car Detail - AutoLuxe` | `detail.title` |

### A.3 Text "đang cập nhật" — Copy chuẩn song ngữ

| Ngữ cảnh | VI | EN |
|-----------|----|----|
| Spec value ngắn (1 ô grid) | `Đang cập nhật` | `Updating` |
| Description block (paragraph) | `Thông tin mô tả đang được cập nhật.` | `Description is being updated.` |
| Trạng thái chung khi data chưa sẵn sàng | `Thông tin đang được cập nhật, vui lòng quay lại sau.` | `Information is being updated, please check back later.` |
| Title xe khi cả make+model rỗng | `Xe đang cập nhật` | `Car Updating` |
| Tooltip/meta badge | `Dữ liệu đang bổ sung` | `Data pending` |

### A.3.1 Nguồn enrichment ngoài (Catalog / Detail)

| Nguồn | Vai trò |
|-------|---------|
| `CAR_DATABASE` (`car-data.js`) | Spec kỹ thuật chính (HP, tốc độ, 0–100) — ưu tiên cao nhất |
| CarQuery API (JSONP) | Fallback HP, tốc độ tối đa, 0–100 km/h, engine, drivetrain (miễn phí, không key) |
| EPA FuelEconomy.gov | Fallback engine/drivetrain khi CarQuery/local thiếu (miễn phí, không key) |
| Imagin.studio | Ảnh hero fallback |

`CarDataAdapter.fetchDetailWithImage` gọi `enrichCarDetail` trước khi render detail.

### A.4 Luồng logic (pseudocode)

```
function renderDetailWithFallback(car):
  title = buildTitle(car.make, car.model)
  if (!title) title = _t('detail.fallback_title')

  for each spec in [power, topSpeed, accel, engine, drivetrain, year]:
    if (!car[spec]):
      displayValue = _t('common.updating')
    else:
      displayValue = formatSpec(car[spec])

  if (!car.shortDescription && !car.longDescription):
    descriptionHTML = _t('detail.desc_updating')

  heroSrc = car.heroImage || getPlaceholderImage()
  // <img onerror="this.src='PLACEHOLDER'">
```

### A.5 Validation rules cho CarDataAdapter.sanitizeDetail

Đã implement trong `car-data.js` — xác nhận tuân thủ:

| Check | Behavior |
|-------|----------|
| `rawDetail === null` | Trả `createFallbackDetail(query)` — object đầy đủ với giá trị rỗng/placeholder |
| Từng field falsy | Merge từ fallbackDetail, không ghi đè field đã có |
| `heroImage` falsy | Gán `PLACEHOLDER_IMAGE` |
| `gallery` rỗng hoặc không phải array | Gán `[heroImage]` |

---

## B. P0.5 — i18n KEY MAP CHO PHASE 1–6

### B.1 Namespace convention

| Namespace | Domain | Ví dụ |
|-----------|--------|-------|
| `checkout` | Checkout V2 (2 bước, card payment) | `checkout.step1_title` |
| `purchases` | My Purchases page + order lifecycle | `purchases.status_new` |
| `account` | Profile + Settings | `account.tab_profile` |
| `admin` | Admin moderation + order management | `admin.queue_title` |
| `catalog` | Catalog/detail/brands mở rộng | `catalog.listing_count` |
| `notif` | Notifications 2.0 templates | `notif.post_approved` |
| `currency` | Currency/format labels | `currency.vnd_label` |
| `common` | Shared across all | `common.confirm` |
| `val` | Validation messages | `val.card_invalid` |

### B.2 KEY MAP ĐẦY ĐỦ

---

#### PHASE 1 — Checkout V2 + My Purchases

##### Namespace: `checkout` (mở rộng)

| Key | VI | EN |
|-----|----|----|
| `checkout.step1_title` | `Bước 1: Thông tin người mua` | `Step 1: Buyer Information` |
| `checkout.step2_title` | `Bước 2: Thanh toán` | `Step 2: Payment` |
| `checkout.step_indicator` | `Bước {current}/{total}` | `Step {current}/{total}` |
| `checkout.next_step` | `Tiếp tục` | `Continue` |
| `checkout.prev_step` | `Quay lại` | `Go Back` |
| `checkout.card_number` | `Số thẻ` | `Card Number` |
| `checkout.card_holder` | `Tên chủ thẻ` | `Cardholder Name` |
| `checkout.card_expiry` | `Ngày hết hạn` | `Expiry Date` |
| `checkout.card_cvv` | `CVV` | `CVV` |
| `checkout.card_type` | `Loại thẻ` | `Card Type` |
| `checkout.card_type_visa` | `Visa` | `Visa` |
| `checkout.card_type_master` | `Mastercard` | `Mastercard` |
| `checkout.card_type_jcb` | `JCB` | `JCB` |
| `checkout.card_type_amex` | `American Express` | `American Express` |
| `checkout.processing_payment` | `Đang xử lý thanh toán...` | `Processing payment...` |
| `checkout.payment_success` | `Thanh toán thành công!` | `Payment successful!` |
| `checkout.payment_failed` | `Thanh toán thất bại. Vui lòng thử lại.` | `Payment failed. Please try again.` |
| `checkout.payment_retry` | `Thử lại thanh toán` | `Retry Payment` |
| `checkout.guest_warning` | `Bạn chưa đăng nhập. Đơn hàng sẽ chỉ lưu trên thiết bị này.` | `You are not logged in. Order will only be saved on this device.` |
| `checkout.guest_login_prompt` | `Đăng nhập để đồng bộ đơn hàng trên nhiều thiết bị.` | `Login to sync orders across devices.` |
| `checkout.order_summary` | `Tóm tắt đơn hàng` | `Order Summary` |
| `checkout.total_amount` | `Tổng thanh toán` | `Total Amount` |

##### Namespace: `purchases`

| Key | VI | EN |
|-----|----|----|
| `purchases.page_title` | `Đơn hàng của tôi - AutoLuxe` | `My Purchases - AutoLuxe` |
| `purchases.title` | `Đơn Hàng Của Tôi` | `My Purchases` |
| `purchases.subtitle` | `Quản lý và theo dõi các đơn mua xe của bạn.` | `Manage and track your car purchases.` |
| `purchases.empty_title` | `Chưa có đơn hàng` | `No orders yet` |
| `purchases.empty_desc` | `Bạn chưa mua xe nào. Hãy khám phá Marketplace!` | `You haven't purchased any cars yet. Explore the Marketplace!` |
| `purchases.filter_all` | `Tất cả` | `All` |
| `purchases.filter_active` | `Đang xử lý` | `Active` |
| `purchases.filter_delivered` | `Đã giao` | `Delivered` |
| `purchases.filter_cancelled` | `Đã hủy` | `Cancelled` |
| `purchases.status_new` | `Mới tạo` | `New` |
| `purchases.status_confirmed` | `Đã xác nhận` | `Confirmed` |
| `purchases.status_rejected` | `Bị từ chối` | `Rejected` |
| `purchases.status_shipping` | `Đang giao` | `Shipping` |
| `purchases.status_delivered` | `Đã giao` | `Delivered` |
| `purchases.status_cancelled` | `Đã hủy` | `Cancelled` |
| `purchases.cancel_btn` | `Hủy đơn` | `Cancel Order` |
| `purchases.cancel_confirm` | `Bạn có chắc muốn hủy đơn hàng này?` | `Are you sure you want to cancel this order?` |
| `purchases.cancel_success` | `Đơn hàng đã được hủy thành công.` | `Order cancelled successfully.` |
| `purchases.cancel_expired` | `Đã quá hạn hủy đơn ({days} ngày).` | `Cancellation period expired ({days} days).` |
| `purchases.cancel_countdown` | `Còn {days} ngày {hours} giờ để hủy` | `{days} days {hours} hours left to cancel` |
| `purchases.cancel_window_info` | `Bạn có thể hủy trong vòng 7 ngày kể từ ngày đặt.` | `You can cancel within 7 days of ordering.` |
| `purchases.delivered_auto` | `Đơn hàng đã tự động chuyển sang trạng thái "Đã giao".` | `Order automatically marked as "Delivered".` |
| `purchases.review_reminder` | `Hãy đánh giá trải nghiệm mua xe của bạn!` | `Please review your car buying experience!` |
| `purchases.order_id` | `Mã đơn` | `Order ID` |
| `purchases.order_date` | `Ngày đặt` | `Order Date` |
| `purchases.order_detail` | `Chi tiết đơn hàng` | `Order Details` |
| `purchases.payment_info` | `Thông tin thanh toán` | `Payment Info` |
| `purchases.card_ending` | `Thẻ kết thúc ****{last4}` | `Card ending ****{last4}` |

---

#### PHASE 2 — Account / Profile / Settings

##### Namespace: `account`

| Key | VI | EN |
|-----|----|----|
| `account.page_title` | `Tài khoản - AutoLuxe` | `Account - AutoLuxe` |
| `account.title` | `Tài Khoản` | `Account` |
| `account.tab_profile` | `Hồ sơ` | `Profile` |
| `account.tab_settings` | `Cài đặt` | `Settings` |
| `account.tab_listings` | `Tin rao của tôi` | `My Listings` |
| `account.display_name` | `Tên hiển thị` | `Display Name` |
| `account.email` | `Email` | `Email` |
| `account.phone` | `Số điện thoại` | `Phone` |
| `account.phone_ph` | `0912 345 678` | `0912 345 678` |
| `account.address` | `Địa chỉ` | `Address` |
| `account.address_ph` | `Số nhà, đường, quận/huyện, tỉnh/TP` | `Street, District, City/Province` |
| `account.avatar` | `Ảnh đại diện` | `Avatar` |
| `account.avatar_upload` | `Tải ảnh lên` | `Upload Photo` |
| `account.avatar_change` | `Đổi ảnh` | `Change Photo` |
| `account.save_profile` | `Lưu hồ sơ` | `Save Profile` |
| `account.profile_saved` | `Đã lưu hồ sơ thành công!` | `Profile saved successfully!` |
| `account.profile_save_fail` | `Lưu hồ sơ thất bại. Vui lòng thử lại.` | `Failed to save profile. Please try again.` |
| `account.change_password` | `Đổi mật khẩu` | `Change Password` |
| `account.current_password` | `Mật khẩu hiện tại` | `Current Password` |
| `account.new_password` | `Mật khẩu mới` | `New Password` |
| `account.confirm_new_password` | `Xác nhận mật khẩu mới` | `Confirm New Password` |
| `account.password_changed` | `Đổi mật khẩu thành công!` | `Password changed successfully!` |
| `account.password_wrong_current` | `Mật khẩu hiện tại không đúng.` | `Current password is incorrect.` |
| `account.settings_theme` | `Giao diện` | `Theme` |
| `account.settings_language` | `Ngôn ngữ` | `Language` |
| `account.settings_saved` | `Đã lưu cài đặt.` | `Settings saved.` |
| `account.my_listings_empty` | `Bạn chưa đăng tin rao nào.` | `You haven't posted any listings yet.` |
| `account.listing_status` | `Trạng thái` | `Status` |
| `account.listing_pending` | `Chờ duyệt` | `Pending Review` |
| `account.listing_approved` | `Đang hiển thị` | `Active` |
| `account.listing_rejected` | `Bị từ chối` | `Rejected` |
| `account.listing_reject_reason` | `Lý do: {reason}` | `Reason: {reason}` |
| `account.header_greeting` | `Xin chào, {name}` | `Hello, {name}` |

---

#### PHASE 3 — Admin Moderation + Admin Orders

##### Namespace: `admin`

| Key | VI | EN |
|-----|----|----|
| `admin.page_title` | `Quản trị - AutoLuxe` | `Admin - AutoLuxe` |
| `admin.title` | `Bảng Quản Trị` | `Admin Panel` |
| `admin.tab_posts` | `Duyệt tin rao` | `Post Moderation` |
| `admin.tab_orders` | `Quản lý đơn hàng` | `Order Management` |
| `admin.queue_title` | `Tin chờ duyệt` | `Pending Posts` |
| `admin.queue_empty` | `Không có tin rao nào chờ duyệt.` | `No posts pending review.` |
| `admin.approve_btn` | `Duyệt` | `Approve` |
| `admin.reject_btn` | `Từ chối` | `Reject` |
| `admin.reject_reason_label` | `Lý do từ chối *` | `Rejection Reason *` |
| `admin.reject_reason_ph` | `Nhập lý do...` | `Enter reason...` |
| `admin.reject_confirm` | `Xác nhận từ chối tin rao này?` | `Confirm rejection of this listing?` |
| `admin.approved_toast` | `Đã duyệt tin "{title}" thành công.` | `Listing "{title}" approved.` |
| `admin.rejected_toast` | `Đã từ chối tin "{title}".` | `Listing "{title}" rejected.` |
| `admin.order_list_title` | `Danh sách đơn hàng` | `Order List` |
| `admin.order_empty` | `Chưa có đơn hàng nào.` | `No orders yet.` |
| `admin.order_status_change` | `Đổi trạng thái` | `Change Status` |
| `admin.order_note_label` | `Ghi chú admin` | `Admin Note` |
| `admin.order_note_ph` | `Thêm ghi chú cho đơn hàng...` | `Add a note for this order...` |
| `admin.order_updated` | `Đã cập nhật đơn hàng {orderId}.` | `Order {orderId} updated.` |
| `admin.order_status_new` | `Mới` | `New` |
| `admin.order_status_confirmed` | `Đã xác nhận` | `Confirmed` |
| `admin.order_status_rejected` | `Từ chối` | `Rejected` |
| `admin.order_status_shipping` | `Đang giao` | `Shipping` |
| `admin.order_status_delivered` | `Đã giao` | `Delivered` |
| `admin.order_timeline` | `Lịch sử xử lý` | `Processing History` |
| `admin.no_permission` | `Bạn không có quyền truy cập trang quản trị.` | `You do not have permission to access admin panel.` |
| `admin.require_reason` | `Vui lòng nhập lý do từ chối.` | `Please enter a rejection reason.` |

---

#### PHASE 4 — Catalog / Detail / Brands & Market Linking

##### Namespace: `catalog` (mở rộng) + `detail` (mở rộng)

| Key | VI | EN |
|-----|----|----|
| `detail.fallback_title` | `Xe đang cập nhật` | `Car Updating` |
| `detail.fallback_info` | `Thông tin đang được cập nhật, vui lòng quay lại sau.` | `Information is being updated, please check back later.` |
| `detail.data_pending` | `Dữ liệu đang bổ sung` | `Data pending` |
| `catalog.listing_count` | `{count} xe đang bán` | `{count} for sale` |
| `catalog.listing_count_zero` | `Chưa có xe đang bán` | `No cars for sale` |
| `catalog.view_listings_btn` | `Xem xe đang bán` | `View Cars for Sale` |
| `catalog.no_listing_msg` | `Hiện chưa có xe {make} {model} nào đang bán trên Marketplace.` | `No {make} {model} currently for sale on Marketplace.` |
| `catalog.deep_link_loading` | `Đang tải xe của {make}...` | `Loading {make} cars...` |
| `brands.cover_fallback_alt` | `Ảnh đại diện {brand}` | `{brand} cover image` |

---

#### PHASE 5 — Notifications 2.0

##### Namespace: `notif` (mở rộng)

| Key | VI | EN |
|-----|----|----|
| `notif.post_approved` | `Tin rao được duyệt` | `Listing Approved` |
| `notif.post_approved_msg` | `Tin "{title}" đã được duyệt và đang hiển thị trên Marketplace.` | `Listing "{title}" has been approved and is now live.` |
| `notif.post_rejected` | `Tin rao bị từ chối` | `Listing Rejected` |
| `notif.post_rejected_msg` | `Tin "{title}" bị từ chối. Lý do: {reason}` | `Listing "{title}" was rejected. Reason: {reason}` |
| `notif.order_created` | `Đơn hàng mới` | `New Order` |
| `notif.order_created_msg` | `Đơn hàng {orderId} cho "{title}" đã được tạo.` | `Order {orderId} for "{title}" has been created.` |
| `notif.order_confirmed` | `Đơn hàng được xác nhận` | `Order Confirmed` |
| `notif.order_confirmed_msg` | `Đơn hàng {orderId} đã được xác nhận bởi người bán.` | `Order {orderId} has been confirmed by the seller.` |
| `notif.order_rejected_by_admin` | `Đơn hàng bị từ chối` | `Order Rejected` |
| `notif.order_rejected_msg` | `Đơn hàng {orderId} đã bị từ chối. Lý do: {reason}` | `Order {orderId} was rejected. Reason: {reason}` |
| `notif.order_shipping` | `Đơn hàng đang giao` | `Order Shipping` |
| `notif.order_shipping_msg` | `Đơn hàng {orderId} đang được vận chuyển.` | `Order {orderId} is being shipped.` |
| `notif.order_delivered` | `Đơn hàng đã giao` | `Order Delivered` |
| `notif.order_delivered_msg` | `Đơn hàng {orderId} đã giao thành công.` | `Order {orderId} has been delivered.` |
| `notif.order_cancelled` | `Đơn hàng đã hủy` | `Order Cancelled` |
| `notif.order_cancelled_msg` | `Đơn hàng {orderId} đã được hủy thành công.` | `Order {orderId} has been cancelled.` |
| `notif.cancel_by_buyer` | `Người mua đã hủy đơn` | `Buyer Cancelled Order` |
| `notif.cancel_by_buyer_msg` | `{buyer} đã hủy đơn hàng {orderId} cho "{title}".` | `{buyer} cancelled order {orderId} for "{title}".` |
| `notif.delivery_reminder` | `Nhắc đánh giá` | `Review Reminder` |
| `notif.delivery_reminder_msg` | `Đơn hàng {orderId} đã giao. Hãy đánh giá trải nghiệm mua xe!` | `Order {orderId} delivered. Please review your experience!` |

---

#### PHASE 6 — i18n / Currency / Date-Time

##### Namespace: `currency`

| Key | VI | EN |
|-----|----|----|
| `currency.vnd_label` | `VNĐ` | `VND` |
| `currency.usd_label` | `USD` | `USD` |
| `currency.converted_note` | `Quy đổi tham khảo (1 USD = 25.000 VNĐ)` | `Approximate conversion (1 USD = 25,000 VND)` |
| `currency.price_label` | `Giá` | `Price` |

##### Namespace: `common` (mở rộng)

| Key | VI | EN |
|-----|----|----|
| `common.confirm` | `Xác nhận` | `Confirm` |
| `common.success` | `Thành công` | `Success` |
| `common.error` | `Lỗi` | `Error` |
| `common.warning` | `Cảnh báo` | `Warning` |
| `common.info` | `Thông tin` | `Info` |
| `common.not_available` | `Không khả dụng` | `Not available` |
| `common.view_all` | `Xem tất cả` | `View All` |
| `common.load_more` | `Xem thêm` | `Load More` |
| `common.no_data` | `Không có dữ liệu` | `No data` |
| `common.date_format_hint` | `DD/MM/YYYY` | `MM/DD/YYYY` |

##### Namespace: `val` (mở rộng)

| Key | VI | EN |
|-----|----|----|
| `val.card_number_invalid` | `Số thẻ không hợp lệ.` | `Invalid card number.` |
| `val.card_expiry_invalid` | `Ngày hết hạn không hợp lệ.` | `Invalid expiry date.` |
| `val.card_cvv_invalid` | `CVV không hợp lệ.` | `Invalid CVV.` |
| `val.card_holder_required` | `Vui lòng nhập tên chủ thẻ.` | `Please enter cardholder name.` |
| `val.card_type_required` | `Vui lòng chọn loại thẻ.` | `Please select card type.` |
| `val.reject_reason_required` | `Vui lòng nhập lý do từ chối.` | `Please enter a rejection reason.` |
| `val.note_too_long` | `Ghi chú tối đa {max} ký tự.` | `Note maximum {max} characters.` |
| `val.phone_format` | `Định dạng: 0xxx xxx xxx hoặc +84xxx xxx xxx` | `Format: 0xxx xxx xxx or +84xxx xxx xxx` |

---

## C. CƠ CHẾ FALLBACK KEY (KHÔNG LỘ KEY THÔ)

### C.1 Fallback chain hiện tại (đã implement trong `i18n.js`)

```
1. dict[currentLocale][key]     → value tìm thấy? dùng luôn
2. dict['vi'][key]              → fallback sang tiếng Việt
3. dict['en'][key]              → fallback sang tiếng Anh
4. return key                   → ⚠️ LỘ KEY (cần fix)
```

### C.2 Cải tiến bắt buộc cho step 4

**Thay vì return key thô**, áp dụng logic:

```javascript
// BEFORE (hiện tại)
if (value === null) {
  console.warn('[I18n] Missing key: "' + key + '" ...');
  return key;  // ← LỘ KEY ra UI
}

// AFTER (cần sửa)
if (value === null) {
  console.warn('[I18n] Missing key: "' + key + '" ...');
  // Trả text thân thiện thay vì key thô
  var genericFallback = dict[currentLocale]
    ? dict[currentLocale]['common.updating']
    : 'Đang cập nhật';
  return genericFallback || 'Đang cập nhật';
}
```

**Lý do:** User không bao giờ thấy chuỗi dạng `checkout.step1_title` trên UI. Luôn trả về text đọc được.

### C.3 Dev convention khi thêm key mới

1. **Thêm key vào CẢ HAI `vi` và `en`** cùng lúc — không bao giờ chỉ thêm một ngôn ngữ.
2. Key format: `{namespace}.{context}_{qualifier}` — ví dụ: `purchases.status_new`.
3. Không dùng dấu cách hay ký tự đặc biệt trong key.
4. Params dùng `{paramName}` — luôn document param list.

---

## D. CHECKLIST TỰ QA NGÔN NGỮ + KEY COVERAGE

### D.1 Consistency thuật ngữ

| Khái niệm | VI (chuẩn) | EN (chuẩn) | ❌ Tránh dùng |
|------------|------------|------------|--------------|
| Đơn mua xe | `Đơn hàng` | `Order` | "Đơn đặt", "Purchase order" |
| Trạng thái | `Trạng thái` | `Status` | "Tình trạng", "State" |
| Hủy đơn | `Hủy đơn` | `Cancel Order` | "Xóa đơn", "Remove order" |
| Giao hàng | `Đã giao` | `Delivered` | "Đã nhận", "Completed" |
| Duyệt tin | `Duyệt` / `Đã duyệt` | `Approve` / `Approved` | "Chấp nhận", "Accept" |
| Từ chối tin | `Từ chối` / `Bị từ chối` | `Reject` / `Rejected` | "Không duyệt", "Declined" |
| Tin rao | `Tin rao` | `Listing` | "Bài đăng", "Post" (trong UI) |
| Chờ duyệt | `Chờ duyệt` | `Pending Review` | "Đang chờ", "Waiting" |
| Xe đang bán | `Xe đang bán` | `Cars for Sale` | "Xe khả dụng", "Available cars" |
| Người mua | `Người mua` | `Buyer` | "Khách hàng", "Customer" |
| Người bán | `Người bán` | `Seller` | "Chủ tin", "Owner" |
| Thanh toán | `Thanh toán` | `Payment` | "Trả tiền", "Pay" (trong label) |
| Quản trị | `Quản trị` | `Admin` | "Administrator" (quá dài cho UI) |
| Mã đơn | `Mã đơn` | `Order ID` | "Số đơn hàng", "Order number" |
| Hồ sơ | `Hồ sơ` | `Profile` | "Thông tin cá nhân" (quá dài) |
| Cài đặt | `Cài đặt` | `Settings` | "Thiết lập", "Preferences" |

### D.2 Key coverage checklist (Phase 1–6)

| Phase | Namespace(s) | Số key mới | Covered? |
|-------|-------------|-----------|----------|
| Phase 1 — Checkout V2 | `checkout`, `purchases`, `val` | ~47 | ✅ |
| Phase 2 — Account | `account`, `val` | ~30 | ✅ |
| Phase 3 — Admin | `admin`, `val` | ~24 | ✅ |
| Phase 4 — Catalog/Detail | `detail`, `catalog`, `brands` | ~9 | ✅ |
| Phase 5 — Notifications | `notif` | ~22 | ✅ |
| Phase 6 — Currency/DateTime | `currency`, `common` | ~14 | ✅ |

### D.3 Cross-check: States đã có key?

| State / Event | Key tồn tại? | Namespace |
|---------------|--------------|-----------|
| Order new | ✅ `purchases.status_new` | purchases |
| Order confirmed | ✅ `purchases.status_confirmed` | purchases |
| Order rejected | ✅ `purchases.status_rejected` | purchases |
| Order shipping | ✅ `purchases.status_shipping` | purchases |
| Order delivered | ✅ `purchases.status_delivered` | purchases |
| Order cancelled | ✅ `purchases.status_cancelled` | purchases |
| Post pending_approval | ✅ `account.listing_pending` | account |
| Post approved | ✅ `account.listing_approved` | account |
| Post rejected | ✅ `account.listing_rejected` | account |
| Payment processing | ✅ `checkout.processing_payment` | checkout |
| Payment success | ✅ `checkout.payment_success` | checkout |
| Payment failed | ✅ `checkout.payment_failed` | checkout |
| Cancel countdown | ✅ `purchases.cancel_countdown` | purchases |
| Cancel expired | ✅ `purchases.cancel_expired` | purchases |
| Guest warning | ✅ `checkout.guest_warning` | checkout |
| Delivery reminder | ✅ `notif.delivery_reminder_msg` | notif |
| Admin no permission | ✅ `admin.no_permission` | admin |
| Card validation errors | ✅ `val.card_*` | val |
| Detail data missing | ✅ `detail.fallback_title`, `common.updating` | detail/common |

### D.4 Trùng key check

- ❌ Không có key nào trùng tên cross-namespace (mỗi key có prefix namespace rõ ràng).
- ❌ Không có key nào conflict với key hiện tại trong `i18n.js` (đã cross-reference toàn bộ file 967 dòng).

### D.5 Fallback text QA

| Tình huống | Hiển thị ra UI | Thân thiện? |
|------------|---------------|-------------|
| Key chưa thêm, locale = vi | `Đang cập nhật` | ✅ |
| Key chưa thêm, locale = en | `Updating` | ✅ |
| Spec value = null | `Đang cập nhật` | ✅ (không gợi ý lỗi) |
| Description rỗng | `Thông tin mô tả đang được cập nhật.` | ✅ |
| Car title rỗng hoàn toàn | `Xe đang cập nhật` | ✅ |
| Ảnh lỗi 404 | Hiện ảnh placeholder (xe đen generic) | ✅ |
| Missing translation key | `Đang cập nhật` (thay vì key thô) | ✅ |

---

## E. TÓM TẮT HÀNH ĐỘNG CHO DEV

1. **Thêm 3 key mới** vào dict hiện tại (`detail.fallback_title`, `detail.fallback_info`, `detail.data_pending`) — xem bảng Phase 4 ở trên.
2. **Sửa fallback logic** trong `I18n.t()` — step 4 không return key thô nữa (xem section C.2).
3. **Khi code Phase 1–6**, copy key + value từ bảng trên vào `dict.vi` và `dict.en` theo đúng namespace.
4. **Validate** mỗi PR: chạy grep `_t('` trong JS mới → confirm mọi key đã có trong dict.
5. **Không dùng** text cứng bằng tiếng Việt hoặc Anh trong code JS/HTML mới — luôn qua `_t()`.

---

*Document version: P0.4-P0.5 v1.0 — Created for AutoLuxe Phase 0 Foundation*
