# Marketplace AutoLuxe — AI Training Source

> Sinh tự động: 2026-06-13T15:09:16.052Z
> 30 tin mẫu đang available trên Marketplace

---

## 1) Tổng quan Marketplace

AutoLuxe Marketplace là sàn mua bán siêu xe cộng đồng, chạy hoàn toàn trên frontend.
- Dữ liệu tin lưu **LocalStorage** (`autoluxe_market_posts`) — mỗi trình duyệt có thể khác nhau.
- Giá hiển thị bằng **USD**.
- Checkout là **mô phỏng**, không thanh toán thật.
- Tin user đăng mới cần **admin duyệt** trước khi hiện công khai.

### Trang liên quan
| Trang | URL | Mô tả |
|-------|-----|-------|
| Danh sách tin | `/pages/marketplace.html` | Tìm kiếm, lọc, sắp xếp tin rao |
| Chi tiết tin | `/pages/market-detail.html?id=<post-id>` | Ảnh, mô tả, mua ngay, đánh giá |
| Đăng/Sửa tin | `/pages/post-editor.html` | Tạo tin mới (cần đăng nhập) |
| Sửa tin | `/pages/post-editor.html?id=<post-id>` | Chỉ chủ tin |
| Checkout | `/pages/checkout.html?postId=<post-id>` | Đặt mua mô phỏng |
| Tài khoản | `/pages/account.html#listings` | Quản lý tin đã đăng |
| Admin duyệt | `/pages/admin.html` | Duyệt/từ chối tin chờ |
| Từ Catalog | `/pages/marketplace.html?brand=X&model=Y` | Lọc nhanh theo hãng/model |

---

## 2) Tính năng hiện tại (để bot hướng dẫn user)

### 2.1 Trang Marketplace (`marketplace.html`)
- **Tìm kiếm:** theo tiêu đề, hãng, model (ô `marketSearch`)
- **Lọc hãng:** Ferrari, Lamborghini, McLaren, Porsche, Bugatti, Aston Martin, Koenigsegg
- **Sắp xếp:** Mới nhất | Giá tăng | Giá giảm
- **Lọc giá:** Giá từ / Giá đến (USD)
- **Lưu tìm kiếm:** nút "Lưu tìm kiếm" — cần đăng nhập; lưu vào Account → Cảnh báo đã lưu
- **Đăng tin mới:** nút "+ Đăng tin mới" → `post-editor.html`
- Chỉ hiển thị tin `moderation=approved` (tin chờ duyệt không hiện ở đây)

### 2.2 Đăng tin (`post-editor.html`)
**Bắt buộc đăng nhập.** Trường bắt buộc (*):
- Tiêu đề, Hãng xe, Model, Năm SX (1990–năm hiện tại+1)
- Giá USD (>0), Số km (≥0), Mô tả chi tiết

Trường tùy chọn: Địa điểm, Nhiên liệu (Xăng/Dầu/Hybrid/Điện), Hộp số (Tự động/Số sàn/PDK/DCT)

**Ảnh:** tối đa 8 ảnh, mỗi ảnh ≤800KB; ảnh đầu tiên là ảnh cover; hỗ trợ kéo-thả.

**Sau khi đăng:** tin có `moderation: pending_approval` → chuyển Account, chờ admin.
**Sau khi sửa tin đã duyệt:** tin quay lại `pending_approval`, cần duyệt lại.

### 2.3 Chi tiết tin (`market-detail.html`)
- Gallery ảnh (nhiều ảnh nếu có)
- Thông số: hãng, model, năm, km, nhiên liệu, hộp số, khu vực, ngày đăng, lượt xem
- **Mua ngay** → checkout (nếu tin available, user không phải chủ tin)
- **Tư vấn / Liên hệ** → widget liên hệ hoặc mailto người bán
- **Yêu thích** → thêm tin vào wishlist (cần đăng nhập)
- **Đánh giá showroom:** 1–5 sao + bình luận (xem mục 2.5)

**Nút Mua ngay KHÔNG hiện khi:**
- Tin đang chờ duyệt hoặc bị từ chối
- Tin đã bán (`status=sold`)
- Tin đang chờ thanh toán (`status=pending`)
- User là chủ tin (không tự mua tin của mình)

### 2.4 Checkout mô phỏng (`checkout.html`)
Flow: Marketplace → Chi tiết tin → **Mua ngay** → điền form (họ tên, SĐT, email, địa chỉ, PT thanh toán, ghi chú) → xác nhận.
- Tạo đơn trong LocalStorage
- Cập nhật trạng thái tin thành `pending_payment`
- Gửi thông báo cho người bán
- **Không có thanh toán thật**

### 2.5 Đánh giá showroom
- Lưu tại LocalStorage key `autoluxe_reviews`
- **Phải đăng nhập** mới đánh giá được
- **Chủ tin không được** tự đánh giá tin của mình
- Điểm 1–5 sao + nội dung (tối đa 500 ký tự)
- Sắp xếp: Mới nhất | Điểm cao

### 2.6 Cảnh báo tìm kiếm đã lưu (`SavedSearchService`)
- Lưu bộ lọc: hãng, từ khóa model, giá min/max
- Xem tại Account → "Cảnh báo đã lưu"
- Khi có tin mới khớp bộ lọc → thông báo push nội bộ

### 2.7 Liên kết Catalog ↔ Marketplace
- Trên catalog, badge hiển thị số tin rao khả dụng theo hãng/model
- Link sang marketplace với `?brand=...&model=...`

---

## 3) Schema dữ liệu tin rao

```json
{
  "id": "post_abc123",
  "ownerEmail": "user@email.com",
  "ownerName": "Tên hiển thị",
  "title": "Tiêu đề tin",
  "brand": "Ferrari",
  "model": "488 GTB",
  "year": 2019,
  "price": 280000,
  "mileage": 12000,
  "fuel": "Xăng",
  "transmission": "Tự động",
  "location": "TP. Hồ Chí Minh",
  "image": "url ảnh cover",
  "images": [
    "url1",
    "url2"
  ],
  "description": "Mô tả chi tiết",
  "moderation": "approved",
  "moderationReason": "",
  "availability": "available",
  "status": "available",
  "viewCount": 0,
  "createdAt": "2025-04-10T08:00:00.000Z",
  "updatedAt": "2025-04-10T08:00:00.000Z"
}
```

### Trạng thái moderation
| Giá trị | Ý nghĩa |
|---------|---------|
| `approved` | Hiển thị công khai trên Marketplace |
| `pending_approval` | Chờ admin duyệt |
| `rejected` | Bị từ chối, không hiển thị |

### Trạng thái availability / status
| Giá trị | Ý nghĩa |
|---------|---------|
| `available` | Đang bán, có thể mua |
| `pending_payment` / `pending` | Có người đặt mua, chờ xử lý |
| `sold` | Đã bán |

### LocalStorage keys
| Key | Mô tả |
|-----|--------|
| `autoluxe_market_posts` | Tất cả tin rao |
| `autoluxe_seed_version` | Version seed data |
| `autoluxe_reviews` | Đánh giá showroom |
| `autoluxe_post_images_draft` | Draft ảnh khi đăng tin |

---

## 4) Thống kê tin mẫu hiện tại

| Chỉ số | Giá trị |
|--------|---------|
| Tổng tin seed | 30 |
| Giá trung bình | $1,288,500 |
| Rẻ nhất | Porsche 718 Spyder 2021 - Manual — $175,000 (`seed_031`) |
| Đắt nhất | Bugatti Centodieci 2022 — $9,000,000 (`seed_027`) |

### Số tin theo hãng
| Hãng | Số tin |
|------|--------|
| Aston Martin | 3 |
| Bugatti | 3 |
| Ferrari | 5 |
| Koenigsegg | 3 |
| Lamborghini | 6 |
| McLaren | 5 |
| Porsche | 5 |

### Số tin theo khu vực
| Khu vực | Số tin |
|---------|--------|
| TP. Hồ Chí Minh | 14 |
| Hà Nội | 10 |
| Đà Nẵng | 6 |

### Bảng tóm tắt nhanh (giá tăng dần)
| Xe | Giá | ODO | Khu vực | ID |
|----|-----|-----|---------|-----|
| Porsche 718 Spyder | $175,000 | 10,500 km | Đà Nẵng | `seed_031` |
| McLaren 570S | $185,000 | 18,500 km | TP. Hồ Chí Minh | `seed_032` |
| Porsche 718 Cayman GT4 RS | $245,000 | 3,500 km | Đà Nẵng | `seed_019` |
| McLaren 600LT | $265,000 | 9,200 km | TP. Hồ Chí Minh | `seed_018` |
| Ferrari 488 GTB | $280,000 | 12,000 km | TP. Hồ Chí Minh | `seed_001` |
| Aston Martin DBX707 | $285,000 | 7,200 km | TP. Hồ Chí Minh | `seed_022` |
| Porsche 911 Turbo S | $295,000 | 7,800 km | Hà Nội | `seed_012` |
| McLaren 675LT | $295,000 | 5,400 km | Hà Nội | `seed_025` |
| McLaren 720S | $310,000 | 8,500 km | Đà Nẵng | `seed_003` |
| Aston Martin DBS Superleggera | $310,000 | 11,000 km | Đà Nẵng | `seed_015` |
| Aston Martin V12 Vantage | $340,000 | 3,900 km | Hà Nội | `seed_029` |
| Lamborghini Huracán EVO | $350,000 | 5,000 km | Hà Nội | `seed_002` |
| Lamborghini Urus Performante | $380,000 | 6,000 km | Hà Nội | `seed_008` |
| McLaren 750S | $385,000 | 1,500 km | TP. Hồ Chí Minh | `seed_011` |
| Ferrari 296 GTB | $395,000 | 4,200 km | Hà Nội | `seed_009` |
| Lamborghini Huracán STO | $410,000 | 4,800 km | Đà Nẵng | `seed_024` |
| Porsche 911 GT3 RS | $420,000 | 2,000 km | TP. Hồ Chí Minh | `seed_004` |
| Porsche 911 GT2 RS | $450,000 | 6,100 km | TP. Hồ Chí Minh | `seed_026` |
| Ferrari 296 Speciale | $480,000 | 0 km | Hà Nội | `seed_023` |
| Ferrari 12Cilindri | $520,000 | 1,200 km | TP. Hồ Chí Minh | `seed_016` |
| Lamborghini Aventador SVJ | $620,000 | 6,500 km | Hà Nội | `seed_017` |
| Lamborghini Countach LPI 800-4 | $720,000 | 2,800 km | TP. Hồ Chí Minh | `seed_030` |
| Ferrari SF90 Stradale | $750,000 | 3,000 km | TP. Hồ Chí Minh | `seed_007` |
| Lamborghini Revuelto | $890,000 | 800 km | TP. Hồ Chí Minh | `seed_010` |
| Koenigsegg Gemera | $2,200,000 | 2,200 km | Đà Nẵng | `seed_028` |
| Koenigsegg Regera | $3,600,000 | 1,800 km | TP. Hồ Chí Minh | `seed_021` |
| Bugatti Chiron Pur Sport | $4,100,000 | 2,100 km | Hà Nội | `seed_020` |
| Koenigsegg Jesko | $4,200,000 | 600 km | Hà Nội | `seed_014` |
| Bugatti Divo | $5,800,000 | 900 km | TP. Hồ Chí Minh | `seed_013` |
| Bugatti Centodieci | $9,000,000 | 400 km | TP. Hồ Chí Minh | `seed_027` |

---

## 5) FAQ Marketplace (training pairs)

**Q: Làm sao tìm xe Ferrari trên Marketplace?**
A: Vào `/pages/marketplace.html`, chọn hãng Ferrari ở bộ lọc hoặc gõ "Ferrari" vào ô tìm kiếm.

**Q: Xe rẻ nhất trên Marketplace hiện tại là gì?**
A: Theo tin mẫu: Porsche 718 Spyder 2021 - Manual giá $175,000 — xem tại /pages/market-detail.html?id=seed_031

**Q: Xe đắt nhất trên Marketplace?**
A: Theo tin mẫu: Bugatti Centodieci 2022 giá $9,000,000 — /pages/market-detail.html?id=seed_027

**Q: Có bao nhiêu tin Lamborghini đang bán?**
A: Trong dữ liệu mẫu có 6 tin Lamborghini. Trên trình duyệt thực tế số lượng có thể khác do LocalStorage.

**Q: Tôi đăng tin xong sao không thấy trên Marketplace?**
A: Tin mới cần admin duyệt (`pending_approval`). Kiểm tra tại Account → Tin đã đăng. Sau khi được duyệt mới hiện công khai.

**Q: Sửa tin đã duyệt có mất tin không?**
A: Tin tạm ẩn khỏi Marketplace và chuyển lại chờ duyệt cho đến khi admin approve lại.

**Q: Làm sao lưu tìm kiếm để nhận thông báo?**
A: Đăng nhập → Marketplace → đặt bộ lọc (hãng, giá...) → bấm "Lưu tìm kiếm". Xem lại tại Account.

**Q: Tôi có thể mua tin của chính mình không?**
A: Không. Chủ tin không thấy nút Mua ngay trên tin của mình.

**Q: Đánh giá showroom khác gì đánh giá sản phẩm?**
A: Đây là đánh giá uy tín người bán/showroom trên từng tin rao, không phải review kỹ thuật xe catalog.

**Q: Giá trên Marketplace khác giá Catalog?**
A: Có. Catalog là giá MSRP tham khảo; Marketplace là giá người bán đăng (có thể cao/thấp hơn tùy tình trạng xe).

**Q: Từ trang chi tiết xe catalog sang marketplace thế nào?**
A: Trên catalog có badge/link "X tin đang bán" hoặc mở `/pages/marketplace.html?brand=Hãng&model=Model`.

**Q: Marketplace có hỗ trợ tiếng Anh không?**
A: Có. Website hỗ trợ i18n vi/en qua header; bot trả lời theo ngôn ngữ user.

**Q: Tôi muốn liên hệ người bán trước khi mua?**
A: Trên trang chi tiết tin, bấm nút Tư vấn/Liên hệ (contact widget hoặc email người bán).

---

## 6) Policy cho bot khi trả lời Marketplace

Bot **nên:**
- Hướng dẫn đúng URL và từng bước thao tác
- Trích dẫn giá/ODO/khu vực từ tin cụ thể khi có trong dữ liệu
- Nhắc checkout là mô phỏng khi user hỏi mua
- Nói rõ dữ liệu realtime có thể khác nếu user đã đăng tin trên máy khác

Bot **không nên:**
- Cam kết giao xe, giữ chỗ, hoặc thanh toán thật
- Khẳng định chắc chắn tin còn available nếu không chắc trạng thái LocalStorage
- Nhầm giá catalog (MSRP) với giá marketplace

---

## 7) Chi tiết từng tin rao (dữ liệu đầy đủ)

### Ferrari 488 GTB 2019 - Full Option
- **ID:** `seed_001`
- **Hãng / Model:** Ferrari 488 GTB (2019)
- **Giá rao bán:** $280,000
- **ODO:** 12,000 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** SupercarLover
- **Trạng thái:** available
- **Mô tả:** Xe đẹp, đi ít, full option. Bảo dưỡng chính hãng đầy đủ. Nội thất da bò đỏ nguyên bản. Giao xe toàn quốc.
- **URL:** /pages/market-detail.html?id=seed_001

### Lamborghini Huracán EVO RWD 2021
- **ID:** `seed_002`
- **Hãng / Model:** Lamborghini Huracán EVO (2021)
- **Giá rao bán:** $350,000
- **ODO:** 5,000 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** VietRacer
- **Trạng thái:** available
- **Mô tả:** Phiên bản EVO RWD, màu xanh Blu Aegeus cực hiếm. ODO 5000km. Xe nhập chính ngạch, đầy đủ giấy tờ.
- **URL:** /pages/market-detail.html?id=seed_002

### McLaren 720S Performance 2020
- **ID:** `seed_003`
- **Hãng / Model:** McLaren 720S (2020)
- **Giá rao bán:** $310,000
- **ODO:** 8,500 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Đà Nẵng
- **Người đăng:** SpeedKing
- **Trạng thái:** available
- **Mô tả:** Performance spec, carbon fiber package. Xe nhập chính ngạch, đầy đủ giấy tờ. Bảo dưỡng định kỳ tại hãng.
- **URL:** /pages/market-detail.html?id=seed_003

### Porsche 911 GT3 RS 2023
- **ID:** `seed_004`
- **Hãng / Model:** Porsche 911 GT3 RS (2023)
- **Giá rao bán:** $420,000
- **ODO:** 2,000 km
- **Nhiên liệu:** Xăng | **Hộp số:** PDK
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** TrackDay
- **Trạng thái:** available
- **Mô tả:** Chiếc 911 thuần chất đường đua. Gói Weissach, cánh gió sau cỡ lớn, phanh carbon ceramic. Chỉ 2000km.
- **URL:** /pages/market-detail.html?id=seed_004

### Ferrari SF90 Stradale 2023
- **ID:** `seed_007`
- **Hãng / Model:** Ferrari SF90 Stradale (2023)
- **Giá rao bán:** $750,000
- **ODO:** 3,000 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** SupercarLover
- **Trạng thái:** available
- **Mô tả:** Hybrid supercar 986 mã lực. Assetto Fiorano package. Màu Rosso Corsa huyền thoại. ODO chỉ 3000km.
- **URL:** /pages/market-detail.html?id=seed_007

### Lamborghini Urus Performante 2023
- **ID:** `seed_008`
- **Hãng / Model:** Lamborghini Urus Performante (2023)
- **Giá rao bán:** $380,000
- **ODO:** 6,000 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** VietRacer
- **Trạng thái:** available
- **Mô tả:** Super SUV mạnh nhất phân khúc. 666 mã lực, 0-100km/h trong 3.3 giây. Full carbon package.
- **URL:** /pages/market-detail.html?id=seed_008

### Ferrari 296 GTB 2022 - Assetto Fiorano
- **ID:** `seed_009`
- **Hãng / Model:** Ferrari 296 GTB (2022)
- **Giá rao bán:** $395,000
- **ODO:** 4,200 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** SupercarLover
- **Trạng thái:** available
- **Mô tả:** V6 hybrid 830 mã lực, gói Assetto Fiorano. Màu Giallo Modena, nội thất Alcantara đen. Lịch sử bảo dưỡng Ferrari đầy đủ.
- **URL:** /pages/market-detail.html?id=seed_009

### Lamborghini Revuelto 2024 - First Owner
- **ID:** `seed_010`
- **Hãng / Model:** Lamborghini Revuelto (2024)
- **Giá rao bán:** $890,000
- **ODO:** 800 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** VietRacer
- **Trạng thái:** available
- **Mô tả:** V12 hybrid 1015 mã lực, chủ đầu tiên. ODO dưới 1000km. Full ADAS, lift system, nội thất Unica bespoke.
- **URL:** /pages/market-detail.html?id=seed_010

### McLaren 750S Coupe 2024
- **ID:** `seed_011`
- **Hãng / Model:** McLaren 750S (2024)
- **Giá rao bán:** $385,000
- **ODO:** 1,500 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** SpeedKing
- **Trạng thái:** available
- **Mô tả:** 750 mã lực, gói Performance. Màu Papaya Spark, phanh carbon ceramic, hệ thống treo PCC III. Xe mới 99%.
- **URL:** /pages/market-detail.html?id=seed_011

### Porsche 911 Turbo S 2022
- **ID:** `seed_012`
- **Hãng / Model:** Porsche 911 Turbo S (2022)
- **Giá rao bán:** $295,000
- **ODO:** 7,800 km
- **Nhiên liệu:** Xăng | **Hộp số:** PDK
- **Khu vực:** Hà Nội
- **Người đăng:** TrackDay
- **Trạng thái:** available
- **Mô tả:** 640 mã lực, Sport Chrono, gói Lightweight. Lốp Michelin PS4S mới, bảo dưỡng Porsche Center.
- **URL:** /pages/market-detail.html?id=seed_012

### Bugatti Divo 2021 - Limited Edition
- **ID:** `seed_013`
- **Hãng / Model:** Bugatti Divo (2021)
- **Giá rao bán:** $5,800,000
- **ODO:** 900 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** LuxuryCollector
- **Trạng thái:** available
- **Mô tả:** Chỉ 40 chiếc toàn cầu. W16 1500 mã lực, cấu hình track-focused. Xe collection trong phòng kín, ODO 900km.
- **URL:** /pages/market-detail.html?id=seed_013

### Koenigsegg Jesko Absolut 2023
- **ID:** `seed_014`
- **Hãng / Model:** Koenigsegg Jesko (2023)
- **Giá rao bán:** $4,200,000
- **ODO:** 600 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** NordicSpeed
- **Trạng thái:** available
- **Mô tả:** 1600 mã lực trên xăng E85. Phiên bản Absolut, carbon visible body. Hiếm, đầy đủ hồ sơ nhập khẩu.
- **URL:** /pages/market-detail.html?id=seed_014

### Aston Martin DBS Superleggera 2020
- **ID:** `seed_015`
- **Hãng / Model:** Aston Martin DBS Superleggera (2020)
- **Giá rao bán:** $310,000
- **ODO:** 11,000 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Đà Nẵng
- **Người đăng:** BondFan
- **Trạng thái:** available
- **Mô tả:** V12 725 mã lực, màu Onyx Black. Bang & Olufsen, ghế quilted, carbon exterior pack.
- **URL:** /pages/market-detail.html?id=seed_015

### Ferrari 12Cilindri 2024 - V12 Thuần
- **ID:** `seed_016`
- **Hãng / Model:** Ferrari 12Cilindri (2024)
- **Giá rao bán:** $520,000
- **ODO:** 1,200 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** SupercarLover
- **Trạng thái:** available
- **Mô tả:** V12 6.5L 830 mã lực, thế hệ mới sau 812. Màu Rosso Imola, nội thất carbon race seats.
- **URL:** /pages/market-detail.html?id=seed_016

### Lamborghini Aventador SVJ 2019
- **ID:** `seed_017`
- **Hãng / Model:** Lamborghini Aventador SVJ (2019)
- **Giá rao bán:** $620,000
- **ODO:** 6,500 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** VietRacer
- **Trạng thái:** available
- **Mô tả:** V12 770 mã lực, ALA 2.0 aerodynamics. Màu Verde Alceo, full carbon, Nürburgring record holder.
- **URL:** /pages/market-detail.html?id=seed_017

### McLaren 600LT Spider 2019
- **ID:** `seed_018`
- **Hãng / Model:** McLaren 600LT (2019)
- **Giá rao bán:** $265,000
- **ODO:** 9,200 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** SpeedKing
- **Trạng thái:** available
- **Mô tả:** Longtail 592 mã lực, mui trần. Top-exit exhaust, cửa butterfly, gói MSO carbon.
- **URL:** /pages/market-detail.html?id=seed_018

### Porsche 718 Cayman GT4 RS 2023
- **ID:** `seed_019`
- **Hãng / Model:** Porsche 718 Cayman GT4 RS (2023)
- **Giá rao bán:** $245,000
- **ODO:** 3,500 km
- **Nhiên liệu:** Xăng | **Hộp số:** PDK
- **Khu vực:** Đà Nẵng
- **Người đăng:** TrackDay
- **Trạng thái:** available
- **Mô tả:** 500 mã lực flat-6, gói Weissach. Ram air intake, magnesium wheels. Xe track day, giữ gìn kỹ.
- **URL:** /pages/market-detail.html?id=seed_019

### Bugatti Chiron Pur Sport 2021
- **ID:** `seed_020`
- **Hãng / Model:** Bugatti Chiron Pur Sport (2021)
- **Giá rao bán:** $4,100,000
- **ODO:** 2,100 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** LuxuryCollector
- **Trạng thái:** available
- **Mô tả:** Phiên bản handling-focused, giới hạn 500 chiếc. Titanium exhaust, fixed wing, gói Handling.
- **URL:** /pages/market-detail.html?id=seed_020

### Koenigsegg Regera 2020
- **ID:** `seed_021`
- **Hãng / Model:** Koenigsegg Regera (2020)
- **Giá rao bán:** $3,600,000
- **ODO:** 1,800 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** NordicSpeed
- **Trạng thái:** available
- **Mô tả:** 1500 mã lực, KDD direct drive không hộp số truyền thống. Ghost package, full visible carbon.
- **URL:** /pages/market-detail.html?id=seed_021

### Aston Martin DBX707 2023
- **ID:** `seed_022`
- **Hãng / Model:** Aston Martin DBX707 (2023)
- **Giá rao bán:** $285,000
- **ODO:** 7,200 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** BondFan
- **Trạng thái:** available
- **Mô tả:** SUV 697 mã lực mạnh nhất Aston. Màu Q Satin Xenon Grey, 23 inch wheels, Bowers & Wilkins.
- **URL:** /pages/market-detail.html?id=seed_022

### Ferrari 296 Speciale 2025 - Pre-order Slot
- **ID:** `seed_023`
- **Hãng / Model:** Ferrari 296 Speciale (2025)
- **Giá rao bán:** $480,000
- **ODO:** 0 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** SupercarLover
- **Trạng thái:** available
- **Mô tả:** Slot giao xe Q4/2025. 819 mã lực, phiên bản track-oriented. Có thể chọn màu và nội thất Tailor Made.
- **URL:** /pages/market-detail.html?id=seed_023

### Lamborghini Huracán STO 2022
- **ID:** `seed_024`
- **Hãng / Model:** Lamborghini Huracán STO (2022)
- **Giá rao bán:** $410,000
- **ODO:** 4,800 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Đà Nẵng
- **Người đăng:** VietRacer
- **Trạng thái:** available
- **Mô tả:** Super Trofeo Omologata, 640 mã lực V10. Aerodynamic package lớn, ghế bucket carbon, roll cage nhẹ.
- **URL:** /pages/market-detail.html?id=seed_024

### McLaren 675LT 2017 - Low Mileage
- **ID:** `seed_025`
- **Hãng / Model:** McLaren 675LT (2017)
- **Giá rao bán:** $295,000
- **ODO:** 5,400 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** SpeedKing
- **Trạng thái:** available
- **Mô tả:** Longtail huyền thoại, 666 mã lực. Màu Chicane Grey, MSO exhaust, nội thất Alcantara orange.
- **URL:** /pages/market-detail.html?id=seed_025

### Porsche 911 GT2 RS 2019
- **ID:** `seed_026`
- **Hãng / Model:** Porsche 911 GT2 RS (2019)
- **Giá rao bán:** $450,000
- **ODO:** 6,100 km
- **Nhiên liệu:** Xăng | **Hộp số:** PDK
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** TrackDay
- **Trạng thái:** available
- **Mô tả:** 700 mã lực, gói Weissach hoàn chỉnh. Magnesium wheels, carbon hood, lap time Nürburgring verified.
- **URL:** /pages/market-detail.html?id=seed_026

### Bugatti Centodieci 2022
- **ID:** `seed_027`
- **Hãng / Model:** Bugatti Centodieci (2022)
- **Giá rao bán:** $9,000,000
- **ODO:** 400 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** LuxuryCollector
- **Trạng thái:** available
- **Mô tả:** Chỉ 10 chiếc, tribute EB110. W16 1600 mã lực. Xe đầu tư, bảo quản showroom.
- **URL:** /pages/market-detail.html?id=seed_027

### Koenigsegg Gemera 2024 - 4 chỗ
- **ID:** `seed_028`
- **Hãng / Model:** Koenigsegg Gemera (2024)
- **Giá rao bán:** $2,200,000
- **ODO:** 2,200 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** Đà Nẵng
- **Người đăng:** NordicSpeed
- **Trạng thái:** available
- **Mô tả:** Mega-GT 2300 mã lực, 4 ghế thực dụng. Tiny Friendly Giant engine + 3 motor. Hiếm tại VN.
- **URL:** /pages/market-detail.html?id=seed_028

### Aston Martin V12 Vantage 2023
- **ID:** `seed_029`
- **Hãng / Model:** Aston Martin V12 Vantage (2023)
- **Giá rao bán:** $340,000
- **ODO:** 3,900 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** Hà Nội
- **Người đăng:** BondFan
- **Trạng thái:** available
- **Mô tả:** V12 690 mã lực cuối cùng của dòng Vantage. Manual không có — bản tự động, carbon aero kit.
- **URL:** /pages/market-detail.html?id=seed_029

### Lamborghini Countach LPI 800-4 2022
- **ID:** `seed_030`
- **Hãng / Model:** Lamborghini Countach LPI 800-4 (2022)
- **Giá rao bán:** $720,000
- **ODO:** 2,800 km
- **Nhiên liệu:** Hybrid | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** VietRacer
- **Trạng thái:** available
- **Mô tả:** Tribute Countach, V12 hybrid 803 mã lực. Giới hạn 112 chiếc. Periscopio lines, scissor doors.
- **URL:** /pages/market-detail.html?id=seed_030

### Porsche 718 Spyder 2021 - Manual
- **ID:** `seed_031`
- **Hãng / Model:** Porsche 718 Spyder (2021)
- **Giá rao bán:** $175,000
- **ODO:** 10,500 km
- **Nhiên liệu:** Xăng | **Hộp số:** Số sàn
- **Khu vực:** Đà Nẵng
- **Người đăng:** TrackDay
- **Trạng thái:** available
- **Mô tả:** Flat-6 500 mã lực, hộp số sàn 6 cấp hiếm. Mui trần thuần, âm thanh GT4 đặc trưng.
- **URL:** /pages/market-detail.html?id=seed_031

### McLaren 570S 2018 - Daily Friendly
- **ID:** `seed_032`
- **Hãng / Model:** McLaren 570S (2018)
- **Giá rao bán:** $185,000
- **ODO:** 18,500 km
- **Nhiên liệu:** Xăng | **Hộp số:** Tự động
- **Khu vực:** TP. Hồ Chí Minh
- **Người đăng:** SpeedKing
- **Trạng thái:** available
- **Mô tả:** Entry supercar 562 mã lực, dễ sử dụng hàng ngày. Lift system, camera, bảo dưỡng đầy đủ.
- **URL:** /pages/market-detail.html?id=seed_032
