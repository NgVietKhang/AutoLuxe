# Kế hoạch AutoLuxe Supercar Web

Kế hoạch này xây dựng một website tĩnh bằng HTML/CSS/JavaScript với trọng tâm giới thiệu siêu xe và module mua bán phụ dùng LocalStorage, đồng thời bám sát đầy đủ các tiêu chí chấm điểm.

## 1) Mục tiêu sản phẩm
- Làm một landing page ấn tượng, mang cảm giác premium/siêu xe.
- Cho phép người dùng khám phá hãng xe, mẫu xe, và xem chi tiết.
- Có đăng ký/đăng nhập bằng LocalStorage.
- Có khu vực mua bán phụ với CRUD đầy đủ cho tin rao.

## 2) Phạm vi trang (đề xuất 7 trang)
1. `index.html` - Landing page (hero, hãng nổi bật, mẫu xe hot, CTA).
2. `pages/catalog.html` - Danh sách xe theo hãng/mẫu (dữ liệu API).
3. `pages/car-detail.html` - Chi tiết một mẫu xe (thông số, gallery, mô tả).
4. `pages/brands.html` - Giới thiệu các hãng siêu xe (Ferrari, Lamborghini, McLaren...).
5. `pages/marketplace.html` - Danh sách tin rao mua bán phụ.
6. `pages/post-editor.html` - Tạo/Sửa tin rao.
7. `pages/auth.html` - Đăng nhập/Đăng ký (2 tab hoặc 2 form cùng trang).

## 3) Kiến trúc thư mục
```text
/
  index.html
  /pages
    catalog.html
    car-detail.html
    brands.html
    marketplace.html
    post-editor.html
    auth.html
  /assets
    /css
      reset.css
      variables.css
      layout.css
      components.css
      home.css
      catalog.css
      detail.css
      marketplace.css
      auth.css
    /js
      app.js
      api.js
      storage.js
      auth.js
      catalog.js
      detail.js
      marketplace.js
      seed.js
      ui.js
    /images
      (ảnh hero, logo hãng, ảnh nền)
```

## 4) Chiến lược dữ liệu
### API bên ngoài (đáp ứng tiêu chí API)
- Dùng NHTSA VPIC API (free, không cần API key):
  - `https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json`
  - `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/{make}?format=json`
- Áp dụng cho trang `catalog` và một phần `car-detail` (tên hãng, model).
- Ảnh xe dùng local assets để UI ổn định và đẹp hơn.

### LocalStorage keys
- `autoluxe_users`: danh sách tài khoản.
- `autoluxe_session`: user đang đăng nhập.
- `autoluxe_market_posts`: danh sách tin rao.
- `autoluxe_seed_version`: đánh dấu đã nạp dữ liệu mẫu.

### Seed dữ liệu tin rao
- Lần chạy đầu: tự động nạp 6-10 tin rao mẫu (siêu xe nổi bật).
- Từ lần sau: đọc từ LocalStorage.
- Tin người dùng tạo mới sẽ append vào `autoluxe_market_posts`.

## 5) Thiết kế UI/UX (định hướng “ngầu + siêu đẹp”)
- Visual direction: luxury motorsport (đen carbon, xám kim loại, nhấn đỏ).
- Typography: font heading mạnh mẽ + body dễ đọc.
- Hero section: ảnh lớn toàn màn hình, tagline mạnh, CTA rõ ràng.
- Dùng CSS Grid cho:
  - Lưới card xe ở landing/catalog.
  - Lưới tin rao marketplace.
  - Một số khối thông số/feature ở trang detail.
- Responsive breakpoints:
  - Mobile: `<768px`
  - Tablet: `768px-1023px`
  - Desktop: `>=1024px`

## 6) Mapping theo tiêu chí chấm điểm
| Tiêu chí | Cách đáp ứng cụ thể |
|---|---|
| Header - Body - Footer cho mỗi trang | Tạo layout chuẩn dùng lại cho toàn bộ 7 trang |
| Responsive (ít nhất trang chủ) | Mobile-first cho `index.html`, sau đó mở rộng toàn site |
| Dữ liệu API ngoài | Fetch dữ liệu hãng/model từ NHTSA và render lên UI |
| Tối ưu giao diện + CSS Grid | Grid card xe/tin rao + bố cục section chính bằng Grid |
| Login/Register + LocalStorage | Form auth, lưu user/session, kiểm tra trạng thái đăng nhập |
| CRUD đầy đủ | Tạo/Xem/Sửa/Xóa tin rao trong `marketplace` + `post-editor` |

## 7) Task chi tiết theo từng phase
### Phase 1 - Nền móng giao diện
**Mục tiêu:** Hoàn thành khung trang và hệ thống style dùng chung.
- [ ] P1-T1 Tạo cấu trúc thư mục `pages`, `assets/css`, `assets/js`, `assets/images`.
- [ ] P1-T2 Dựng HTML skeleton cho 7 trang theo scope.
- [ ] P1-T3 Gắn `header` + `footer` thống nhất trên mọi trang.
- [ ] P1-T4 Tạo navigation link qua lại đúng route giữa các trang.
- [ ] P1-T5 Thiết lập `reset.css`, `variables.css`, `layout.css`, `components.css`.
- [ ] P1-T6 Tạo component dùng lại: button, card, section title, input.
**Đầu ra bắt buộc:** Mở từng trang đều thấy layout đầy đủ và không vỡ cấu trúc.

### Phase 2 - Landing page & catalog
**Mục tiêu:** Hoàn thiện mặt tiền website và lấy dữ liệu API xe.
- [ ] P2-T1 Thiết kế hero landing (headline, subtitle, CTA, background premium).
- [ ] P2-T2 Tạo section featured supercars bằng CSS Grid.
- [ ] P2-T3 Tạo section brand strip/logos + link sang `brands.html`.
- [ ] P2-T4 Viết `api.js` để fetch danh sách hãng từ NHTSA.
- [ ] P2-T5 Render dữ liệu API tại `catalog.html` với loading/error/empty states.
- [ ] P2-T6 Thêm lọc theo hãng và tìm kiếm model cơ bản ở catalog.
**Đầu ra bắt buộc:** `catalog.html` hiển thị dữ liệu API thật và thao tác lọc hoạt động.

### Phase 3 - Car detail & brands
**Mục tiêu:** Tăng chiều sâu nội dung “giới thiệu xe”.
- [ ] P3-T1 Làm `brands.html` với profile ngắn cho từng hãng siêu xe.
- [ ] P3-T2 Chuẩn hóa dữ liệu xe mẫu local (ảnh, thông số, mô tả ngắn).
- [ ] P3-T3 Tạo luồng click card xe -> `car-detail.html?id=...`.
- [ ] P3-T4 Render thông tin chi tiết: ảnh chính, gallery, specs grid, mô tả.
- [ ] P3-T5 Thêm khối “xe liên quan”/“same brand” ở cuối trang detail.
- [ ] P3-T6 Bổ sung fallback khi thiếu ảnh hoặc thiếu dữ liệu model.
**Đầu ra bắt buộc:** Từ trang chủ/catalog có thể đi tới detail và xem đủ thông tin.

### Phase 4 - Authentication LocalStorage
**Mục tiêu:** Có hệ thống tài khoản local chạy ổn định.
- [ ] P4-T1 Dựng `auth.html` với tab đăng nhập/đăng ký hoặc 2 form rõ ràng.
- [ ] P4-T2 Viết `storage.js` helper (`get`, `set`, `update`) cho LocalStorage.
- [ ] P4-T3 Cài validate: bắt buộc nhập, email hợp lệ, mật khẩu tối thiểu.
- [ ] P4-T4 Đăng ký: lưu user mới vào `autoluxe_users`, chặn email trùng.
- [ ] P4-T5 Đăng nhập: kiểm tra thông tin, lưu session `autoluxe_session`.
- [ ] P4-T6 Cập nhật UI theo trạng thái login (hiện tên user/nút logout).
**Đầu ra bắt buộc:** Refresh trang vẫn giữ trạng thái đăng nhập hợp lệ.

### Phase 5 - Marketplace CRUD (phần phụ)
**Mục tiêu:** Hoàn thành module mua bán phụ với CRUD đầy đủ.
- [ ] P5-T1 Viết `seed.js` để nạp 6-10 tin mẫu vào `autoluxe_market_posts`.
- [ ] P5-T2 Hiển thị danh sách tin trong `marketplace.html` bằng CSS Grid.
- [ ] P5-T3 Tạo form đăng tin tại `post-editor.html` (Create).
- [ ] P5-T4 Gắn hành vi sửa tin (prefill form + Update).
- [ ] P5-T5 Gắn hành vi xóa tin với confirm (Delete).
- [ ] P5-T6 Chỉ cho sửa/xóa tin của user đang login; thêm lọc/tìm kiếm cơ bản.
**Đầu ra bắt buộc:** User tạo/sửa/xóa tin xong, reload vẫn còn dữ liệu đúng.

### Phase 6 - Hoàn thiện & kiểm thử
**Mục tiêu:** Đảm bảo UI đẹp, mượt và đạt đủ tiêu chí chấm.
- [x] P6-T1 Audit responsive trên 3 mốc: mobile/tablet/desktop.
- [x] P6-T2 Kiểm tra consistency `header`/`footer` toàn bộ trang.
- [x] P6-T3 Kiểm thử luồng end-to-end: auth -> đăng tin -> sửa/xóa -> logout.
- [x] P6-T4 Tối ưu trải nghiệm: hover/focus states, spacing, contrast.
- [x] P6-T5 Dọn code JS (tách module rõ, tránh lặp), đặt tên class thống nhất.
- [x] P6-T6 Chuẩn bị bản demo và checklist tự chấm trước khi nộp.
**Đầu ra bắt buộc:** Toàn bộ checklist mục 8 đều tick được.

### Phase 7 - Marketplace Detail + Đánh giá showroom
**Mục tiêu:** Khi bấm vào một tin xe để xem chi tiết, hiển thị thông tin đầy đủ hơn ở phần dưới kèm bình luận/đánh giá.
- [x] P7-T1 Tạo `pages/market-detail.html` nhận `?id=...` từ danh sách marketplace.
- [x] P7-T2 Thêm nút `Xem xe` trên card tại `marketplace.html` để điều hướng sang trang detail tin rao.
- [x] P7-T3 Render chi tiết tin: ảnh lớn, thông số, mô tả đầy đủ, thông tin người bán/showroom.
- [x] P7-T4 Tạo section `Đánh giá showroom` ở bên dưới phần chi tiết xe (rating trung bình + số lượt đánh giá).
- [x] P7-T5 Thêm form bình luận/đánh giá (1-5 sao + nội dung) và lưu dữ liệu vào LocalStorage.
- [x] P7-T6 Ràng buộc quyền: cần đăng nhập mới được đánh giá; chủ tin không tự đánh giá tin của mình.
- [x] P7-T7 Bổ sung lọc/sắp xếp bình luận cơ bản (mới nhất, điểm cao) + fallback khi chưa có đánh giá.
**Đầu ra bắt buộc:** User bấm `Xem xe` sẽ thấy trang chi tiết tin rao đầy đủ và phần bình luận/đánh giá ở bên dưới hoạt động.

### Phase 8 - Checkout mô phỏng + Form thanh toán
**Mục tiêu:** Có luồng mua xe giả lập từ tin rao với form thanh toán và lưu đơn hàng LocalStorage.
- [x] P8-T1 Thêm CTA `Mua ngay` trong `market-detail.html`.
- [x] P8-T2 Tạo `pages/checkout.html` để nhập thông tin mua xe.
- [x] P8-T3 Dựng form thanh toán gồm: họ tên, SĐT, email, địa chỉ nhận xe/chứng từ, phương thức thanh toán mô phỏng, ghi chú.
- [x] P8-T4 Validate form: bắt buộc nhập, email/SĐT hợp lệ, không cho submit dữ liệu rỗng.
- [x] P8-T5 Tạo object đơn hàng (`orderId`, `postId`, `buyer`, `priceSnapshot`, `status`, `createdAt`) và lưu LocalStorage.
- [x] P8-T6 Hiển thị trạng thái đặt mua thành công/thất bại rõ ràng; điều hướng lại trang phù hợp.
- [x] P8-T7 Cập nhật trạng thái tin (`available`/`pending`) để hạn chế mua trùng ngay sau khi tạo đơn.
**Đầu ra bắt buộc:** User đi qua luồng `Mua ngay -> Form thanh toán -> Đặt mua`, và đơn được lưu trong LocalStorage.

### Phase 9 - Wishlist cá nhân hóa
**Mục tiêu:** Cho phép user lưu nhanh các xe/tin đang quan tâm.
- [x] P9-T1 Thêm nút `Yêu thích/Bỏ yêu thích` trên `catalog`, `car-detail`, `market-detail`.
- [x] P9-T2 Lưu wishlist theo user đăng nhập (tách riêng dữ liệu từng tài khoản).
- [x] P9-T3 Tạo `pages/wishlist.html` hiển thị danh sách đã lưu.
- [x] P9-T4 Thêm lọc trong wishlist theo loại item (xe catalog / tin marketplace) và theo hãng.
- [x] P9-T5 Xử lý chống trùng item + fallback khi tin/xe gốc đã bị xóa.
- [x] P9-T6 Cho phép xóa từng item hoặc xóa toàn bộ wishlist.
**Đầu ra bắt buộc:** Mỗi user có wishlist riêng, reload trang vẫn giữ dữ liệu đúng.

### Phase 10 - Notification center
**Mục tiêu:** Hiển thị thông báo nội bộ để tăng tương tác và phản hồi trạng thái thao tác.
- [x] P10-T1 Tạo cấu trúc thông báo và helper LocalStorage cho thông báo.
- [x] P10-T2 Thêm icon chuông + badge số chưa đọc ở `header`.
- [x] P10-T3 Tạo panel/dropdown thông báo: xem danh sách, đánh dấu đã đọc, xóa thông báo.
- [x] P10-T4 Sinh thông báo từ các sự kiện chính: đặt mua thành công, nhận bình luận mới, đổi trạng thái tin.
- [x] P10-T5 Chuẩn hóa toast trạng thái thành công/thất bại để đồng bộ UX.
**Đầu ra bắt buộc:** User thấy số thông báo chưa đọc và quản lý thông báo trực tiếp trên header.

### Phase 11 - Dark mode toàn site
**Mục tiêu:** Bổ sung giao diện sáng/tối đồng bộ cho toàn bộ website.
- [ ] P11-T1 Chuẩn hóa hệ màu bằng CSS variables cho cả 2 mode.
- [ ] P11-T2 Thêm toggle theme trên header và lưu lựa chọn vào LocalStorage.
- [ ] P11-T3 Áp dụng theme ngay khi tải trang để tránh nháy màu.
- [ ] P11-T4 Kiểm tra contrast cho text/button/card ở cả light và dark.
- [ ] P11-T5 Rà soát toàn trang chính để tránh vỡ giao diện khi đổi mode.
**Đầu ra bắt buộc:** User đổi theme mượt, reload trang vẫn giữ mode đã chọn.

### Phase 12 - Đa ngôn ngữ (VI/EN)
**Mục tiêu:** Cho phép chuyển đổi ngôn ngữ tiếng Việt/tiếng Anh trên toàn bộ UI.
- [ ] P12-T1 Tạo dictionary VI/EN cho các text tĩnh và text trạng thái.
- [ ] P12-T2 Tạo module `i18n.js` để đổi text runtime và lưu locale vào LocalStorage.
- [ ] P12-T3 Thêm switch ngôn ngữ ở header và đồng bộ trên mọi trang.
- [ ] P12-T4 Dịch thông báo động trong JS (toast, validate, loading/error/empty states).
- [ ] P12-T5 Bổ sung fallback khi thiếu bản dịch để không vỡ giao diện.
- [ ] P12-T6 Kiểm thử chuyển ngôn ngữ trên các luồng chính: catalog, detail, marketplace, checkout, auth.
**Đầu ra bắt buộc:** User đổi VI/EN thành công, reload vẫn giữ ngôn ngữ đã chọn.

## 8) Checklist nghiệm thu nhanh
- [x] Mỗi trang đều có `header`, `body content`, `footer`.
- [x] Trang chủ responsive tốt trên mobile.
- [x] Có dữ liệu API render thật trên giao diện.
- [x] Có dùng CSS Grid ở các layout chính.
- [x] Đăng ký/đăng nhập hoạt động bằng LocalStorage.
- [x] CRUD tin rao chạy đầy đủ, ổn định.
- [x] Có sẵn dữ liệu tin rao mẫu khi mở web lần đầu.

## 9) Quy tắc giới hạn phạm vi (để tránh quá tải)
- Không dùng framework (React/Vue/Bootstrap JS).
- Không làm backend/server database.
- Không làm thanh toán thật; marketplace chỉ là mô phỏng CRUD local.
- Ưu tiên hoàn thiện trải nghiệm “giới thiệu siêu xe” trước, marketplace sau.

## 10) Dữ liệu LocalStorage mở rộng (cho phase mới)
- `autoluxe_orders`: danh sách đơn mua xe từ flow checkout mô phỏng.
- `autoluxe_wishlist`: danh sách xe/tin yêu thích theo từng user.
- `autoluxe_reviews`: bình luận/đánh giá showroom/người bán theo từng tin.
- `autoluxe_notifications`: danh sách thông báo hệ thống.
- `autoluxe_theme`: lưu chế độ giao diện (`light` | `dark`).
- `autoluxe_locale`: lưu ngôn ngữ hiện tại (`vi` | `en`).

## 11) Checklist nghiệm thu mở rộng
- [ ] Có trang `market-detail.html` với thông tin xe đầy đủ + bình luận/đánh giá ở bên dưới.
- [ ] Có luồng `Mua ngay -> checkout form -> tạo đơn` và lưu `autoluxe_orders`.
- [x] Có wishlist theo user và xem lại tại `wishlist.html`.
- [x] Có notification center với badge chưa đọc.
- [ ] Có dark mode đồng bộ toàn site.
- [ ] Có chuyển đổi ngôn ngữ VI/EN ổn định trên các trang chính.

## 12) Thứ tự triển khai khuyến nghị (phase mới)
1. Phase 7 (market detail + review) để hoàn thiện luồng xem xe.
2. Phase 8 (checkout + orders) để hoàn tất luồng mua mô phỏng.
3. Phase 9 (wishlist) để tăng cá nhân hóa.
4. Phase 10 (notifications) để tăng tương tác hệ thống.
5. Phase 11 (dark mode) để đồng bộ trải nghiệm thị giác.
6. Phase 12 (i18n) để hoàn thiện bản demo song ngữ.
