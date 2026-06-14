# AutoLuxe — AI Training (Full Knowledge Base)

> File tổng hợp duy nhất để upload lên Chatbase / RAG / AI assistant.
> Tự động sinh: 2026-06-13T15:09:16.052Z
> Catalog: 260 xe | Marketplace: 30 tin mẫu

---

# PHẦN 1 — Persona, hướng dẫn website & FAQ

# AutoLuxe Chatbot Training Source (v1)

## 1) Bot Identity
- Tên bot: AutoLuxe Assistant.
- Vai trò: tư vấn viên online cho website siêu xe AutoLuxe.
- Ngôn ngữ ưu tiên: tiếng Việt.
- Nếu người dùng hỏi bằng tiếng Anh thì trả lời bằng tiếng Anh.
- Giọng điệu: chuyên nghiệp, premium, thân thiện, ngắn gọn, dễ hiểu.

## 2) Project Overview
AutoLuxe là website tĩnh về siêu xe, xây bằng HTML/CSS/JavaScript.

Mục tiêu chính:
1. Giới thiệu các thương hiệu và mẫu siêu xe nổi bật.
2. Cho phép xem catalog và trang chi tiết xe.
3. Có marketplace nội bộ để người dùng đăng tin mua bán xe.
4. Có đăng nhập/đăng ký bằng LocalStorage.
5. Có wishlist, đánh giá showroom, checkout mô phỏng và thông báo nội bộ.

Lưu ý kỹ thuật quan trọng:
- Đây là website demo frontend, không có backend server riêng.
- Dữ liệu tài khoản/tin rao/đơn hàng/... lưu bằng LocalStorage trên trình duyệt.
- Không có thanh toán thật.

## 3) Navigation Map (để bot hướng dẫn người dùng)
- Trang chủ: `/index.html`
- Catalog: `/pages/catalog.html`
- Chi tiết xe: `/pages/car-detail.html?id=<car-id>`
- Thương hiệu: `/pages/brands.html`
- Marketplace: `/pages/marketplace.html`
- Chi tiết tin rao: `/pages/market-detail.html?id=<post-id>`
- Đăng/Sửa tin: `/pages/post-editor.html`
- Đăng nhập/Đăng ký: `/pages/auth.html`
- Thanh toán mô phỏng: `/pages/checkout.html?postId=<post-id>`
- Wishlist: `/pages/wishlist.html`

## 4) Feature Knowledge

### 4.1 Authentication
- Người dùng có thể đăng ký và đăng nhập trên trang `auth.html`.
- Dữ liệu user/session lưu LocalStorage.
- Sau khi đăng nhập, header hiển thị lời chào + nút đăng xuất.

### 4.2 Catalog & Car Detail
- Catalog lấy dữ liệu hãng/model từ NHTSA VPIC API.
- Trang car detail hiển thị:
  - ảnh chính + gallery,
  - thông số kỹ thuật,
  - mô tả ngắn/dài,
  - xe liên quan cùng hãng.

### 4.3 Marketplace
- Marketplace cho phép:
  - xem danh sách tin rao,
  - tìm kiếm,
  - lọc theo hãng,
  - sắp xếp.
- Người dùng có thể tạo/sửa/xóa tin của mình.
- Trạng thái tin có thể thay đổi (ví dụ: available/pending khi có người đặt mua).

### 4.4 Market Detail + Reviews
- Trang `market-detail.html` hiển thị đầy đủ thông tin tin rao.
- Có phần “Đánh giá showroom” gồm:
  - điểm trung bình,
  - số lượt đánh giá,
  - danh sách bình luận,
  - sắp xếp theo mới nhất / điểm cao.
- Quy tắc đánh giá:
  - phải đăng nhập mới đánh giá được,
  - chủ tin không tự đánh giá tin của chính mình.

### 4.5 Checkout (mô phỏng)
- Từ trang chi tiết tin rao có nút “Mua ngay”.
- Điều hướng sang `checkout.html?postId=...`.
- Form gồm: họ tên, SĐT, email, địa chỉ, phương thức thanh toán, ghi chú.
- Sau khi submit hợp lệ:
  - tạo đơn hàng trong LocalStorage,
  - cập nhật trạng thái tin,
  - hiển thị trạng thái thành công.
- Đây là flow mô phỏng, không xử lý thanh toán thật.

### 4.6 Wishlist
- Người dùng có thể thêm/bỏ yêu thích xe/tin rao.
- Wishlist được tách theo từng user đăng nhập.
- Có trang riêng để xem và quản lý wishlist.

### 4.7 Notifications
- Hệ thống có thông báo nội bộ theo user (chuông + badge chưa đọc).
- Thông báo có thể phát sinh từ các sự kiện như:
  - đặt mua thành công,
  - đổi trạng thái tin,
  - một số sự kiện tương tác khác.

## 5) Domain Knowledge (Brands & Cars)

Thương hiệu nổi bật:
- Ferrari
- Lamborghini
- McLaren
- Porsche
- Bugatti
- Koenigsegg
- Aston Martin

Một số mẫu xe tiêu biểu trong dữ liệu local:
- Ferrari SF90 Stradale (986 hp, 0-100: 2.5s, top speed 340 km/h)
- Ferrari 296 GTB (830 hp, 0-100: 2.9s, top speed 330 km/h)
- Lamborghini Revuelto (1015 hp, 0-100: 2.5s, top speed 350 km/h)
- Lamborghini Huracán STO (640 hp, 0-100: 3.0s, top speed 310 km/h)
- McLaren 750S (750 hp, 0-100: 2.8s, top speed 332 km/h)
- McLaren Artura (680 hp, 0-100: 3.0s, top speed 330 km/h)
- Porsche 911 GT3 RS (525 hp, 0-100: 3.2s, top speed 296 km/h)
- Porsche 918 Spyder (887 hp, 0-100: 2.6s, top speed 345 km/h)
- Bugatti Chiron (1500 hp, 0-100: 2.4s, top speed 420 km/h)
- Koenigsegg Jesko (1600 hp, 0-100: 2.5s, top speed 531 km/h - lý thuyết)
- Aston Martin Valkyrie (1160 hp, 0-100: 2.5s, top speed 402 km/h)
- Bugatti Bolide (1850 hp, 0-100: 2.2s, top speed 500 km/h)

## 6) Response Policy For The Bot

Bot nên làm:
- Trả lời tập trung vào siêu xe, thương hiệu, thông số, và cách dùng website AutoLuxe.
- Khi hướng dẫn thao tác, nói theo từng bước rõ ràng.
- Khi người dùng hỏi mua xe, hướng dẫn vào đúng trang: marketplace -> market-detail -> checkout.
- Nếu thiếu dữ liệu cụ thể (ví dụ giá/xe đang còn hay không), nói rõ đó là dữ liệu động theo LocalStorage của phiên người dùng.

Bot không nên làm:
- Không cam kết giao dịch thật hoặc thời gian giao xe thực tế.
- Không bịa thông tin ngoài dữ liệu đã có.
- Không khẳng định chắc chắn tình trạng tồn kho toàn hệ thống.

Mẫu câu an toàn khi thiếu dữ liệu:
- “Mình chưa thấy đủ dữ liệu realtime để xác nhận chính xác. Bạn mở trực tiếp trang Marketplace để kiểm tra trạng thái mới nhất nhé.”
- “Flow thanh toán trên AutoLuxe hiện là mô phỏng, chưa phải cổng thanh toán thật.”

## 7) FAQ Training Pairs

Q: AutoLuxe là gì?
A: AutoLuxe là website khám phá siêu xe, kết hợp catalog thương hiệu và marketplace cộng đồng để đăng tin mua bán xe.

Q: Website này có backend không?
A: Không. Đây là website frontend tĩnh, dữ liệu người dùng được lưu bằng LocalStorage trên trình duyệt.

Q: Tôi muốn xem các hãng siêu xe ở đâu?
A: Bạn vào trang Thương hiệu tại `/pages/brands.html`.

Q: Tôi muốn xem danh sách xe thì vào đâu?
A: Bạn vào Catalog tại `/pages/catalog.html`.

Q: Tôi muốn xem chi tiết một mẫu xe cụ thể?
A: Vào `/pages/car-detail.html?id=<car-id>`, ví dụ `ferrari-sf90-stradale`.

Q: Làm sao để đăng tin bán xe?
A: Vào Marketplace (`/pages/marketplace.html`) rồi bấm “Đăng tin mới” để mở trang `/pages/post-editor.html`.

Q: Có thể sửa hoặc xóa tin đã đăng không?
A: Có. Người dùng có thể sửa/xóa các tin do chính mình tạo.

Q: Vì sao tôi không đánh giá showroom được?
A: Thường do 1 trong 2 lý do: bạn chưa đăng nhập, hoặc bạn là chủ tin rao nên không thể tự đánh giá tin của mình.

Q: Mua xe trên AutoLuxe như thế nào?
A: Vào Marketplace -> mở chi tiết tin (`market-detail`) -> bấm “Mua ngay” -> điền form checkout -> xác nhận đặt mua.

Q: AutoLuxe có thanh toán thật không?
A: Chưa. Đây là checkout mô phỏng để tạo đơn hàng nội bộ trong LocalStorage.

Q: Đơn hàng được lưu ở đâu?
A: Đơn hàng được lưu LocalStorage trên trình duyệt hiện tại.

Q: Có wishlist không?
A: Có. Bạn có thể thêm/bỏ yêu thích và xem danh sách tại `/pages/wishlist.html`.

Q: Wishlist có theo từng tài khoản không?
A: Có. Wishlist được tách theo user đang đăng nhập.

Q: Catalog lấy dữ liệu từ đâu?
A: Catalog dùng NHTSA VPIC API để lấy danh sách hãng/model xe.

Q: Tôi thấy giá/tình trạng xe khác nhau giữa máy này và máy kia?
A: Vì dữ liệu marketplace lưu LocalStorage theo từng trình duyệt, nên mỗi máy hoặc mỗi trình duyệt có thể khác nhau.

Q: Tôi muốn xe nhanh nhất trong danh sách thì xe nào nổi bật?
A: Koenigsegg Jesko và Bugatti Bolide là hai mẫu có thông số tốc độ rất cao trong dữ liệu local.

Q: Ferrari SF90 và Lamborghini Revuelto, xe nào mạnh hơn?
A: Theo dữ liệu local, Revuelto mạnh hơn về mã lực (1015 hp vs 986 hp), còn cả hai đều có tăng tốc 0-100 khoảng 2.5 giây.

Q: Bugatti Chiron có gì nổi bật?
A: Chiron nổi bật với động cơ W16 1500 mã lực, 0-100 khoảng 2.4 giây và tốc độ tối đa 420 km/h.

Q: Nếu tôi không nhớ đường dẫn trang thì sao?
A: Bạn có thể bắt đầu từ Trang chủ `/index.html` và dùng menu trên header để điều hướng nhanh.

Q: Tôi có cần đăng nhập để dùng toàn bộ tính năng không?
A: Để dùng các tính năng cá nhân như đăng tin, wishlist, đánh giá và một số thao tác marketplace, bạn nên đăng nhập.

## 8) Suggested Welcome Message (optional)
“Chào mừng bạn đến với AutoLuxe. Mình có thể giúp bạn khám phá siêu xe, so sánh thông số, và hướng dẫn các bước dùng marketplace/checkout trên website.”

---

## Phụ lục — Ghi chú nguồn dữ liệu

### Catalog
- **Thông số xe:** `assets/js/car-data.js` + `car-data-extended.js` + `car-data-specs-import.js`
- **Danh sách hãng/model (API):** NHTSA vPIC qua `assets/js/api.js`
- **Giá trong catalog (`priceUSD`):** MSRP tham khảo, **không** phải giá rao bán

### Marketplace
- **Tin mẫu:** `assets/js/seed.js` (30 tin seed)
- **Runtime:** LocalStorage key `autoluxe_market_posts`
- **Giá trong marketplace (`price`):** Giá người bán đăng, USD
- Tin user mới đăng cần admin duyệt (`moderation: pending_approval`)
- Tin chỉ hiển thị công khai khi `moderation=approved` và `status=available`

### Câu hỏi AI nên phân biệt
| Câu hỏi | Trả lời từ |
|---------|------------|
| "SF90 có bao nhiêu mã lực?" | Phần Catalog |
| "Có ai bán Huracán không?" | Phần Marketplace |
| "Giá SF90 bao nhiêu?" | Hỏi rõ: MSRP catalog hay giá tin rao? |

### Refresh file training
```bash
node tools/export-ai-training-data.js
```

---

# PHẦN 2 — Catalog: Thông số xe (CAR_DATABASE)

Dùng phần này khi người dùng hỏi về thông số kỹ thuật, so sánh xe, giá MSRP tham khảo.

### Ferrari SF90 Stradale (2024)
- **ID:** `ferrari-sf90-stradale`
- **Mã lực:** 986 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid
- **Dẫn động:** AWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,570 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Plug-in Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $625,000
- **Mô tả ngắn:** Hybrid supercar với 986 mã lực, tăng tốc 0-100km/h trong 2.5 giây.
- **URL:** /pages/car-detail.html?id=ferrari-sf90-stradale

### Ferrari 296 GTB (2024)
- **ID:** `ferrari-296-gtb`
- **Mã lực:** 830 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V6 Twin-Turbo Hybrid
- **Dẫn động:** RWD
- **Mô-men xoắn:** 740 Nm
- **Trọng lượng:** 1,470 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Plug-in Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $420,000
- **Mô tả ngắn:** V6 hybrid mới của Ferrari với 830 mã lực và thiết kế gợi nhớ huyền thoại Dino.
- **URL:** /pages/car-detail.html?id=ferrari-296-gtb

### Lamborghini Revuelto (2024)
- **ID:** `lamborghini-revuelto`
- **Mã lực:** 1015 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 Hybrid
- **Dẫn động:** AWD
- **Mô-men xoắn:** 725 Nm
- **Trọng lượng:** 1,772 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $600,000
- **Mô tả ngắn:** V12 hybrid mạnh mẽ nhất lịch sử Lamborghini với 1015 mã lực.
- **URL:** /pages/car-detail.html?id=lamborghini-revuelto

### Lamborghini Huracán STO (2023)
- **ID:** `lamborghini-huracan-sto`
- **Mã lực:** 640 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 310 km/h
- **Động cơ:** V10 5.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 565 Nm
- **Trọng lượng:** 1,339 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $330,000
- **Mô tả ngắn:** Phiên bản đường đua thuần túy của Huracán với khí động học từ Super Trofeo.
- **URL:** /pages/car-detail.html?id=lamborghini-huracan-sto

### McLaren 750S (2024)
- **ID:** `mclaren-750s`
- **Mã lực:** 750 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 332 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,389 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $375,000
- **Mô tả ngắn:** Siêu phẩm từ Woking với 750PS và trọng lượng siêu nhẹ.
- **URL:** /pages/car-detail.html?id=mclaren-750s

### McLaren Artura (2024)
- **ID:** `mclaren-artura`
- **Mã lực:** 680 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V6 Twin-Turbo Hybrid
- **Dẫn động:** RWD
- **Mô-men xoắn:** 720 Nm
- **Trọng lượng:** 1,395 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Plug-in Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $250,000
- **Mô tả ngắn:** Siêu xe hybrid thế hệ mới của McLaren với kiến trúc carbon hoàn toàn mới.
- **URL:** /pages/car-detail.html?id=mclaren-artura

### Porsche 911 GT3 RS (2024)
- **ID:** `porsche-911-gt3-rs`
- **Mã lực:** 525 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 296 km/h
- **Động cơ:** Flat-6 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 465 Nm
- **Trọng lượng:** 1,450 kg
- **Hộp số:** 7-speed PDK
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $310,000
- **Mô tả ngắn:** Chiếc 911 thuần chất đường đua nhất với khí động học chủ động.
- **URL:** /pages/car-detail.html?id=porsche-911-gt3-rs

### Porsche 918 Spyder (2015)
- **ID:** `porsche-918-spyder`
- **Mã lực:** 887 hp
- **0-100:** 2.6s
- **Tốc độ tối đa:** 345 km/h
- **Động cơ:** V8 4.6L Hybrid
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,280 Nm
- **Trọng lượng:** 1,675 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Plug-in Hybrid
- **Kiểu dáng:** Spyder
- **Giá MSRP tham khảo (catalog):** $850,000
- **Mô tả ngắn:** Hypercar hybrid huyền thoại của Porsche với công nghệ từ Le Mans.
- **URL:** /pages/car-detail.html?id=porsche-918-spyder

### Bugatti Chiron (2024)
- **ID:** `bugatti-chiron`
- **Mã lực:** 1500 hp
- **0-100:** 2.4s
- **Tốc độ tối đa:** 420 km/h
- **Động cơ:** W16 Quad-Turbo 8.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,600 Nm
- **Trọng lượng:** 1,995 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $3,200,000
- **Mô tả ngắn:** 1500 mã lực, tốc độ tối đa 420km/h — đỉnh cao kỹ thuật ô tô.
- **URL:** /pages/car-detail.html?id=bugatti-chiron

### Koenigsegg Jesko (2024)
- **ID:** `koenigsegg-jesko`
- **Mã lực:** 1600 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 531 km/h
- **Động cơ:** V8 Twin-Turbo 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1,500 Nm
- **Trọng lượng:** 1,420 kg
- **Hộp số:** 9-speed LST
- **Nhiên liệu:** Petrol / E85
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,850,000
- **Mô tả ngắn:** Megacar Thụy Điển với 1600 mã lực và tốc độ lý thuyết trên 500km/h.
- **URL:** /pages/car-detail.html?id=koenigsegg-jesko

### Aston Martin Valkyrie (2024)
- **ID:** `aston-martin-valkyrie`
- **Mã lực:** 1160 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 402 km/h
- **Động cơ:** V12 6.5L Hybrid
- **Dẫn động:** RWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 1,030 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $3,000,000
- **Mô tả ngắn:** Hypercar với động cơ V12 Cosworth và khí động học F1 thuần túy.
- **URL:** /pages/car-detail.html?id=aston-martin-valkyrie

### Bugatti Bolide (2024)
- **ID:** `bugatti-bolide`
- **Mã lực:** 1850 hp
- **0-100:** 2.2s
- **Tốc độ tối đa:** 500 km/h
- **Động cơ:** W16 Quad-Turbo 8.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,850 Nm
- **Trọng lượng:** 1,240 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Track Coupe
- **Giá MSRP tham khảo (catalog):** $4,000,000
- **Mô tả ngắn:** Track-only hypercar cực đoan nhất từ Bugatti với 1850 mã lực.
- **URL:** /pages/car-detail.html?id=bugatti-bolide

### Bugatti Tourbillon (2026)
- **ID:** `bugatti-tourbillon`
- **Mã lực:** 1775 hp
- **0-100:** 2.0s
- **Tốc độ tối đa:** 445 km/h
- **Động cơ:** V16 Hybrid 8.3L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,800 Nm
- **Trọng lượng:** 1,995 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $3,600,000
- **Mô tả ngắn:** Kế thừa Chiron với V16 hybrid tự nhiên và 1775 mã lực.
- **URL:** /pages/car-detail.html?id=bugatti-tourbillon

### Ferrari Purosangue (2024)
- **ID:** `ferrari-purosangue`
- **Mã lực:** 725 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 310 km/h
- **Động cơ:** V12 6.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 716 Nm
- **Trọng lượng:** 2,033 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV / Crossover
- **Giá MSRP tham khảo (catalog):** $400,000
- **Mô tả ngắn:** Ferrari bốn cửa đầu tiên với V12 hút khí tự nhiên và AWD.
- **URL:** /pages/car-detail.html?id=ferrari-purosangue

### Ferrari Daytona SP3 (2024)
- **ID:** `ferrari-daytona-sp3`
- **Mã lực:** 829 hp
- **0-100:** 2.85s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V12 6.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 697 Nm
- **Trọng lượng:** 1,485 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Targa / Spider
- **Giá MSRP tham khảo (catalog):** $2,200,000
- **Mô tả ngắn:** Icona Series với V12 829 mã lực và thiết kế lấy cảm hứng Daytona.
- **URL:** /pages/car-detail.html?id=ferrari-daytona-sp3

### Lamborghini Temerario (2025)
- **ID:** `lamborghini-temerario`
- **Mã lực:** 920 hp
- **0-100:** 2.7s
- **Tốc độ tối đa:** 343 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid
- **Dẫn động:** AWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,750 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $290,000
- **Mô tả ngắn:** Siêu xe hybrid V8 thay thế Huracán với 920 mã lực.
- **URL:** /pages/car-detail.html?id=lamborghini-temerario

### Porsche 911 GT3 (2024)
- **ID:** `porsche-911-gt3`
- **Mã lực:** 510 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 318 km/h
- **Động cơ:** Flat-6 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 470 Nm
- **Trọng lượng:** 1,418 kg
- **Hộp số:** 7-speed PDK / 6-speed Manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $200,000
- **Mô tả ngắn:** 911 GT3 bản tiêu chuẩn với flat-six 510 mã lực và khả năng track-day.
- **URL:** /pages/car-detail.html?id=porsche-911-gt3

### McLaren W1 (2025)
- **ID:** `mclaren-w1`
- **Mã lực:** 1258 hp
- **0-100:** 2.7s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1,100 Nm
- **Trọng lượng:** 1,399 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,100,000
- **Mô tả ngắn:** Hypercar kế thừa P1 với 1258 mã lực và công nghệ F1.
- **URL:** /pages/car-detail.html?id=mclaren-w1

### Lamborghini Venevo (2024)
- **ID:** `lamborghini-venevo`
- **Mã lực:** 1015 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 Hybrid
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,050 Nm
- **Trọng lượng:** 1,650 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $3,500,000
- **Mô tả ngắn:** V12 hybrid 1.015 mã lực — sức mạnh và thiết kế tương lai.
- **URL:** /pages/car-detail.html?id=lamborghini-venevo

### Lamborghini Ferzor (2024)
- **ID:** `lamborghini-ferzor`
- **Mã lực:** 920 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid
- **Dẫn động:** AWD
- **Mô-men xoắn:** 950 Nm
- **Trọng lượng:** 1,580 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,800,000
- **Mô tả ngắn:** Twin-turbo V8 hybrid 920 mã lực, tăng tốc và khí động học đỉnh cao.
- **URL:** /pages/car-detail.html?id=lamborghini-ferzor

### Toyota GR Supra (2024)
- **ID:** `toyota-gr-supra`
- **Mã lực:** 382 hp
- **0-100:** 3.9s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I6 Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 1,540 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $56,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-gr-supra

### Toyota GR86 (2024)
- **ID:** `toyota-gr86`
- **Mã lực:** 228 hp
- **0-100:** 6.3s
- **Tốc độ tối đa:** 226 km/h
- **Động cơ:** Flat-4 2.4L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 250 Nm
- **Trọng lượng:** 1,276 kg
- **Hộp số:** 6-speed MT/AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-gr86

### Toyota GR Corolla (2024)
- **ID:** `toyota-gr-corolla`
- **Mã lực:** 300 hp
- **0-100:** 5.5s
- **Tốc độ tối đa:** 230 km/h
- **Động cơ:** I3 Turbo 1.6L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 400 Nm
- **Trọng lượng:** 1,474 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $36,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-gr-corolla

### Toyota Camry (2024)
- **ID:** `toyota-camry`
- **Mã lực:** 301 hp
- **0-100:** 5.8s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** V6 3.5L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 362 Nm
- **Trọng lượng:** 1,570 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $26,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-camry

### Toyota Corolla (2024)
- **ID:** `toyota-corolla`
- **Mã lực:** 169 hp
- **0-100:** 8.5s
- **Tốc độ tối đa:** 190 km/h
- **Động cơ:** I4 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 205 Nm
- **Trọng lượng:** 1,380 kg
- **Hộp số:** CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $22,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-corolla

### Toyota RAV4 (2024)
- **ID:** `toyota-rav4`
- **Mã lực:** 203 hp
- **0-100:** 8.2s
- **Tốc độ tối đa:** 195 km/h
- **Động cơ:** I4 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 243 Nm
- **Trọng lượng:** 1,665 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-rav4

### Toyota Hilux (2024)
- **ID:** `toyota-hilux`
- **Mã lực:** 201 hp
- **0-100:** 10.0s
- **Tốc độ tối đa:** 175 km/h
- **Động cơ:** I4 Turbo 2.8L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 2,105 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Diesel
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $32,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-hilux

### Toyota Land Cruiser (2024)
- **ID:** `toyota-land-cruiser`
- **Mã lực:** 409 hp
- **0-100:** 6.7s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** V6 Turbo Hybrid 3.4L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 650 Nm
- **Trọng lượng:** 2,660 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $55,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=toyota-land-cruiser

### Honda Civic Type R (2024)
- **ID:** `honda-civic-type-r`
- **Mã lực:** 315 hp
- **0-100:** 5.4s
- **Tốc độ tối đa:** 275 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 420 Nm
- **Trọng lượng:** 1,429 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $45,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=honda-civic-type-r

### Honda NSX (2022)
- **ID:** `honda-nsx`
- **Mã lực:** 573 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 307 km/h
- **Động cơ:** V6 Twin-Turbo Hybrid 3.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 645 Nm
- **Trọng lượng:** 1,725 kg
- **Hộp số:** 9-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $157,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=honda-nsx

### Honda Accord (2024)
- **ID:** `honda-accord`
- **Mã lực:** 192 hp
- **0-100:** 7.2s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** I4 Turbo 1.5L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 260 Nm
- **Trọng lượng:** 1,470 kg
- **Hộp số:** CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=honda-accord

### Honda CR-V (2024)
- **ID:** `honda-crv`
- **Mã lực:** 190 hp
- **0-100:** 8.0s
- **Tốc độ tối đa:** 195 km/h
- **Động cơ:** I4 Turbo 1.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 243 Nm
- **Trọng lượng:** 1,620 kg
- **Hộp số:** CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $30,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=honda-crv

### Nissan GT-R (2024)
- **ID:** `nissan-gt-r`
- **Mã lực:** 565 hp
- **0-100:** 2.7s
- **Tốc độ tối đa:** 315 km/h
- **Động cơ:** V6 Twin-Turbo 3.8L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 633 Nm
- **Trọng lượng:** 1,785 kg
- **Hộp số:** 6-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $115,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=nissan-gt-r

### Nissan Z (2024)
- **ID:** `nissan-z`
- **Mã lực:** 400 hp
- **0-100:** 4.3s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 475 Nm
- **Trọng lượng:** 1,580 kg
- **Hộp số:** 6-speed MT/9-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=nissan-z

### Nissan Skyline (2019)
- **ID:** `nissan-skyline`
- **Mã lực:** 400 hp
- **0-100:** 5.0s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V6 Twin-Turbo 3.0L
- **Dẫn động:** RWD/AWD
- **Mô-men xoắn:** 475 Nm
- **Trọng lượng:** 1,720 kg
- **Hộp số:** 7-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $50,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=nissan-skyline

### Nissan Sentra (2024)
- **ID:** `nissan-sentra`
- **Mã lực:** 149 hp
- **0-100:** 9.0s
- **Tốc độ tối đa:** 190 km/h
- **Động cơ:** I4 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 198 Nm
- **Trọng lượng:** 1,360 kg
- **Hộp số:** CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $21,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=nissan-sentra

### Nissan X-Trail (2024)
- **ID:** `nissan-x-trail`
- **Mã lực:** 201 hp
- **0-100:** 8.0s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** I4 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 245 Nm
- **Trọng lượng:** 1,650 kg
- **Hộp số:** CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=nissan-x-trail

### Mazda MX-5 Miata (2024)
- **ID:** `mazda-mx-5`
- **Mã lực:** 181 hp
- **0-100:** 6.5s
- **Tốc độ tối đa:** 219 km/h
- **Động cơ:** I4 2.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 205 Nm
- **Trọng lượng:** 1,057 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Roadster
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mazda-mx-5

### Mazda RX-7 (2002)
- **ID:** `mazda-rx-7`
- **Mã lực:** 276 hp
- **0-100:** 5.2s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** Rotary Twin-Turbo 1.3L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 314 Nm
- **Trọng lượng:** 1,310 kg
- **Hộp số:** 5-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $35,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mazda-rx-7

### Mazda Mazda3 (2024)
- **ID:** `mazda-3`
- **Mã lực:** 191 hp
- **0-100:** 7.8s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** I4 2.5L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 252 Nm
- **Trọng lượng:** 1,380 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $24,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mazda-3

### Mazda CX-5 (2024)
- **ID:** `mazda-cx-5`
- **Mã lực:** 256 hp
- **0-100:** 7.5s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** I4 Turbo 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 434 Nm
- **Trọng lượng:** 1,720 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mazda-cx-5

### Mazda CX-60 (2024)
- **ID:** `mazda-cx-60`
- **Mã lực:** 323 hp
- **0-100:** 5.8s
- **Tốc độ tối đa:** 220 km/h
- **Động cơ:** I6 Turbo Hybrid 3.3L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 2,065 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Diesel / Hybrid
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mazda-cx-60

### Subaru WRX (2024)
- **ID:** `subaru-wrx`
- **Mã lực:** 271 hp
- **0-100:** 5.5s
- **Tốc độ tối đa:** 230 km/h
- **Động cơ:** Flat-4 Turbo 2.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 350 Nm
- **Trọng lượng:** 1,530 kg
- **Hộp số:** 6-speed MT/CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $32,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=subaru-wrx

### Subaru BRZ (2024)
- **ID:** `subaru-brz`
- **Mã lực:** 228 hp
- **0-100:** 6.3s
- **Tốc độ tối đa:** 226 km/h
- **Động cơ:** Flat-4 2.4L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 250 Nm
- **Trọng lượng:** 1,276 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=subaru-brz

### Subaru Outback (2024)
- **ID:** `subaru-outback`
- **Mã lực:** 260 hp
- **0-100:** 7.0s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** Flat-4 Turbo 2.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 375 Nm
- **Trọng lượng:** 1,735 kg
- **Hộp số:** CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Wagon
- **Giá MSRP tham khảo (catalog):** $30,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=subaru-outback

### Lexus LFA (2012)
- **ID:** `lexus-lfa`
- **Mã lực:** 552 hp
- **0-100:** 3.6s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V10 4.8L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 480 Nm
- **Trọng lượng:** 1,480 kg
- **Hộp số:** 6-speed ASG
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $375,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lexus-lfa

### Lexus RC F (2024)
- **ID:** `lexus-rc-f`
- **Mã lực:** 472 hp
- **0-100:** 4.2s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** V8 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 536 Nm
- **Trọng lượng:** 1,780 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $68,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lexus-rc-f

### Lexus IS 500 (2024)
- **ID:** `lexus-is-500`
- **Mã lực:** 472 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V8 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 536 Nm
- **Trọng lượng:** 1,720 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $60,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lexus-is-500

### Lexus LC 500 (2024)
- **ID:** `lexus-lc-500`
- **Mã lực:** 471 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** V8 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 540 Nm
- **Trọng lượng:** 1,980 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $95,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lexus-lc-500

### Lexus RX (2024)
- **ID:** `lexus-rx`
- **Mã lực:** 366 hp
- **0-100:** 6.2s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** I4 Turbo Hybrid 2.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 550 Nm
- **Trọng lượng:** 2,120 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $50,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lexus-rx

### BMW M3 (2024)
- **ID:** `bmw-m3`
- **Mã lực:** 473 hp
- **0-100:** 3.9s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 550 Nm
- **Trọng lượng:** 1,730 kg
- **Hộp số:** 6-speed MT/8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $76,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m3

### BMW M4 (2024)
- **ID:** `bmw-m4`
- **Mã lực:** 473 hp
- **0-100:** 3.9s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 550 Nm
- **Trọng lượng:** 1,750 kg
- **Hộp số:** 6-speed MT/8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $78,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m4

### BMW M5 (2024)
- **ID:** `bmw-m5`
- **Mã lực:** 617 hp
- **0-100:** 3.1s
- **Tốc độ tối đa:** 305 km/h
- **Động cơ:** V8 Twin-Turbo 4.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 750 Nm
- **Trọng lượng:** 1,970 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $110,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m5

### BMW M8 (2024)
- **ID:** `bmw-m8`
- **Mã lực:** 617 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 305 km/h
- **Động cơ:** V8 Twin-Turbo 4.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 750 Nm
- **Trọng lượng:** 1,950 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $135,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m8

### BMW M2 (2024)
- **ID:** `bmw-m2`
- **Mã lực:** 453 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 285 km/h
- **Động cơ:** I6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 550 Nm
- **Trọng lượng:** 1,720 kg
- **Hộp số:** 6-speed MT/8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $64,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m2

### BMW X5 M (2024)
- **ID:** `bmw-x5-m`
- **Mã lực:** 617 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V8 Twin-Turbo 4.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 750 Nm
- **Trọng lượng:** 2,390 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $122,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-x5-m

### BMW i8 (2020)
- **ID:** `bmw-i8`
- **Mã lực:** 369 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I3 Turbo Hybrid 1.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 570 Nm
- **Trọng lượng:** 1,560 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Petrol / Plug-in Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $148,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-i8

### BMW 330i (2024)
- **ID:** `bmw-330i`
- **Mã lực:** 255 hp
- **0-100:** 5.6s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 400 Nm
- **Trọng lượng:** 1,580 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $43,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-330i

### BMW X3 (2024)
- **ID:** `bmw-x3`
- **Mã lực:** 248 hp
- **0-100:** 6.4s
- **Tốc độ tối đa:** 235 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 350 Nm
- **Trọng lượng:** 1,785 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $46,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-x3

### Mercedes-Benz AMG GT (2024)
- **ID:** `mercedes-amg-gt`
- **Mã lực:** 577 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 315 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,785 kg
- **Hộp số:** 9-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $135,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-amg-gt

### Mercedes-Benz AMG C63 S (2024)
- **ID:** `mercedes-amg-c63`
- **Mã lực:** 503 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 280 km/h
- **Động cơ:** I4 Turbo Hybrid 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 680 Nm
- **Trọng lượng:** 1,890 kg
- **Hộp số:** 9-speed MCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $85,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-amg-c63

### Mercedes-Benz AMG G63 (2024)
- **ID:** `mercedes-amg-g63`
- **Mã lực:** 577 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 220 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 850 Nm
- **Trọng lượng:** 2,560 kg
- **Hộp số:** 9-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $180,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-amg-g63

### Mercedes-Benz AMG SL 63 (2024)
- **ID:** `mercedes-amg-sl`
- **Mã lực:** 577 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 315 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,950 kg
- **Hộp số:** 9-speed MCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Roadster
- **Giá MSRP tham khảo (catalog):** $180,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-amg-sl

### Mercedes-Benz S-Class (2024)
- **ID:** `mercedes-s-class`
- **Mã lực:** 496 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I6 Turbo Hybrid 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 700 Nm
- **Trọng lượng:** 2,035 kg
- **Hộp số:** 9-speed AT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $115,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-s-class

### Mercedes-Benz C-Class (2024)
- **ID:** `mercedes-c-class`
- **Mã lực:** 255 hp
- **0-100:** 5.9s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 400 Nm
- **Trọng lượng:** 1,625 kg
- **Hộp số:** 9-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $45,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-c-class

### Mercedes-Benz GLE (2024)
- **ID:** `mercedes-gle`
- **Mã lực:** 362 hp
- **0-100:** 5.3s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I6 Turbo 3.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 2,245 kg
- **Hộp số:** 9-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $65,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-gle

### Mercedes-Benz EQS (2024)
- **ID:** `mercedes-eqs`
- **Mã lực:** 516 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 855 Nm
- **Trọng lượng:** 2,480 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $105,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-eqs

### Mercedes-Benz AMG A45 S (2024)
- **ID:** `mercedes-a45`
- **Mã lực:** 421 hp
- **0-100:** 3.9s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 1,655 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $65,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-a45

### Mercedes-Benz AMG CLA 45 S (2024)
- **ID:** `mercedes-cla45`
- **Mã lực:** 421 hp
- **0-100:** 4.0s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 1,695 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $62,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-cla45

### Audi R8 (2024)
- **ID:** `audi-r8`
- **Mã lực:** 562 hp
- **0-100:** 3.1s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V10 5.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 550 Nm
- **Trọng lượng:** 1,595 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $158,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-r8

### Audi RS6 Avant (2024)
- **ID:** `audi-rs6`
- **Mã lực:** 621 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 305 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 2,195 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Wagon
- **Giá MSRP tham khảo (catalog):** $125,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-rs6

### Audi RS3 (2024)
- **ID:** `audi-rs3`
- **Mã lực:** 401 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 290 km/h
- **Động cơ:** I5 Turbo 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 500 Nm
- **Trọng lượng:** 1,620 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $62,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-rs3

### Audi TT RS (2023)
- **ID:** `audi-tt-rs`
- **Mã lực:** 394 hp
- **0-100:** 3.7s
- **Tốc độ tối đa:** 280 km/h
- **Động cơ:** I5 Turbo 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 480 Nm
- **Trọng lượng:** 1,450 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $68,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-tt-rs

### Audi SQ8 (2024)
- **ID:** `audi-sq8`
- **Mã lực:** 500 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 770 Nm
- **Trọng lượng:** 2,315 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $95,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-sq8

### Audi Q5 (2024)
- **ID:** `audi-q5`
- **Mã lực:** 261 hp
- **0-100:** 6.3s
- **Tốc độ tối đa:** 237 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 370 Nm
- **Trọng lượng:** 1,890 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $45,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-q5

### Audi A4 (2024)
- **ID:** `audi-a4`
- **Mã lực:** 261 hp
- **0-100:** 5.5s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 370 Nm
- **Trọng lượng:** 1,640 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-a4

### Volkswagen Golf R (2024)
- **ID:** `vw-golf-r`
- **Mã lực:** 315 hp
- **0-100:** 4.7s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 420 Nm
- **Trọng lượng:** 1,565 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $46,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=vw-golf-r

### Volkswagen Golf GTI (2024)
- **ID:** `vw-gti`
- **Mã lực:** 241 hp
- **0-100:** 5.6s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 370 Nm
- **Trọng lượng:** 1,465 kg
- **Hộp số:** 6-speed MT/7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $33,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=vw-gti

### Volkswagen Passat (2024)
- **ID:** `vw-passat`
- **Mã lực:** 174 hp
- **0-100:** 8.2s
- **Tốc độ tối đa:** 225 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 350 Nm
- **Trọng lượng:** 1,560 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=vw-passat

### Volkswagen Tiguan (2024)
- **ID:** `vw-tiguan`
- **Mã lực:** 184 hp
- **0-100:** 8.5s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 300 Nm
- **Trọng lượng:** 1,745 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=vw-tiguan

### Ford Mustang GT (2024)
- **ID:** `ford-mustang-gt`
- **Mã lực:** 486 hp
- **0-100:** 4.2s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V8 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 567 Nm
- **Trọng lượng:** 1,770 kg
- **Hộp số:** 6-speed MT/10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $43,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ford-mustang-gt

### Ford Mustang Dark Horse (2024)
- **ID:** `ford-mustang-dark-horse`
- **Mã lực:** 500 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 267 km/h
- **Động cơ:** V8 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 567 Nm
- **Trọng lượng:** 1,785 kg
- **Hộp số:** 6-speed MT/10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $60,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ford-mustang-dark-horse

### Ford Focus RS (2018)
- **ID:** `ford-focus-rs`
- **Mã lực:** 350 hp
- **0-100:** 4.7s
- **Tốc độ tối đa:** 266 km/h
- **Động cơ:** I4 Turbo 2.3L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 470 Nm
- **Trọng lượng:** 1,599 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $36,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ford-focus-rs

### Ford F-150 (2024)
- **ID:** `ford-f-150`
- **Mã lực:** 450 hp
- **0-100:** 5.5s
- **Tốc độ tối đa:** 180 km/h
- **Động cơ:** V6 Turbo Hybrid 3.5L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 691 Nm
- **Trọng lượng:** 2,495 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $45,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ford-f-150

### Ford Bronco (2024)
- **ID:** `ford-bronco`
- **Mã lực:** 330 hp
- **0-100:** 6.3s
- **Tốc độ tối đa:** 160 km/h
- **Động cơ:** V6 Turbo 2.7L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 556 Nm
- **Trọng lượng:** 2,290 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ford-bronco

### Ford Explorer (2024)
- **ID:** `ford-explorer`
- **Mã lực:** 400 hp
- **0-100:** 5.3s
- **Tốc độ tối đa:** 220 km/h
- **Động cơ:** V6 Turbo 3.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 563 Nm
- **Trọng lượng:** 2,125 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $38,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ford-explorer

### Chevrolet Corvette Z06 (2024)
- **ID:** `chevy-corvette-z06`
- **Mã lực:** 670 hp
- **0-100:** 2.6s
- **Tốc độ tối đa:** 315 km/h
- **Động cơ:** V8 5.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 623 Nm
- **Trọng lượng:** 1,570 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $110,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=chevy-corvette-z06

### Chevrolet Corvette Stingray (2024)
- **ID:** `chevy-corvette-stingray`
- **Mã lực:** 495 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 312 km/h
- **Động cơ:** V8 6.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 637 Nm
- **Trọng lượng:** 1,535 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $68,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=chevy-corvette-stingray

### Chevrolet Camaro ZL1 (2024)
- **ID:** `chevy-camaro-zl1`
- **Mã lực:** 650 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 318 km/h
- **Động cơ:** V8 Supercharged 6.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 881 Nm
- **Trọng lượng:** 1,760 kg
- **Hộp số:** 6-speed MT/10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $75,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=chevy-camaro-zl1

### Chevrolet Silverado 1500 (2024)
- **ID:** `chevy-silverado`
- **Mã lực:** 420 hp
- **0-100:** 6.2s
- **Tốc độ tối đa:** 180 km/h
- **Động cơ:** I4 Turbo 2.7L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 624 Nm
- **Trọng lượng:** 2,270 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $38,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=chevy-silverado

### Chevrolet Equinox (2024)
- **ID:** `chevy-equinox`
- **Mã lực:** 175 hp
- **0-100:** 9.0s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** I4 Turbo 1.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 275 Nm
- **Trọng lượng:** 1,615 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $27,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=chevy-equinox

### Dodge Challenger SRT Hellcat (2023)
- **ID:** `dodge-challenger-hellcat`
- **Mã lực:** 717 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** V8 Supercharged 6.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 881 Nm
- **Trọng lượng:** 1,970 kg
- **Hộp số:** 6-speed MT/8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $78,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=dodge-challenger-hellcat

### Dodge Charger SRT Hellcat (2023)
- **ID:** `dodge-charger-hellcat`
- **Mã lực:** 717 hp
- **0-100:** 3.6s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** V8 Supercharged 6.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 881 Nm
- **Trọng lượng:** 2,075 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $82,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=dodge-charger-hellcat

### Dodge Viper ACR (2017)
- **ID:** `dodge-viper`
- **Mã lực:** 645 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 285 km/h
- **Động cơ:** V10 8.4L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 814 Nm
- **Trọng lượng:** 1,530 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $120,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=dodge-viper

### Dodge Ram 1500 TRX (2024)
- **ID:** `dodge-ram-1500`
- **Mã lực:** 702 hp
- **0-100:** 4.5s
- **Tốc độ tối đa:** 190 km/h
- **Động cơ:** V8 Supercharged 6.2L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 881 Nm
- **Trọng lượng:** 2,950 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $85,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=dodge-ram-1500

### Hyundai Ioniq 5 N (2024)
- **ID:** `hyundai-ioniq-5-n`
- **Mã lực:** 641 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 260 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 770 Nm
- **Trọng lượng:** 2,220 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $67,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=hyundai-ioniq-5-n

### Hyundai Elantra N (2024)
- **ID:** `hyundai-elantra-n`
- **Mã lực:** 276 hp
- **0-100:** 5.3s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 392 Nm
- **Trọng lượng:** 1,520 kg
- **Hộp số:** 6-speed MT/8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $34,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=hyundai-elantra-n

### Hyundai Tucson (2024)
- **ID:** `hyundai-tucson`
- **Mã lực:** 187 hp
- **0-100:** 8.8s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** I4 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 241 Nm
- **Trọng lượng:** 1,635 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=hyundai-tucson

### Hyundai Santa Fe (2024)
- **ID:** `hyundai-santa-fe`
- **Mã lực:** 277 hp
- **0-100:** 7.0s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** I4 Turbo 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 422 Nm
- **Trọng lượng:** 1,860 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $35,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=hyundai-santa-fe

### Kia Stinger GT (2023)
- **ID:** `kia-stinger-gt`
- **Mã lực:** 368 hp
- **0-100:** 4.7s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** V6 Twin-Turbo 3.3L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 510 Nm
- **Trọng lượng:** 1,800 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $43,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=kia-stinger-gt

### Kia EV6 GT (2024)
- **ID:** `kia-ev6-gt`
- **Mã lực:** 576 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 260 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 740 Nm
- **Trọng lượng:** 2,165 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $62,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=kia-ev6-gt

### Kia Sportage (2024)
- **ID:** `kia-sportage`
- **Mã lực:** 187 hp
- **0-100:** 8.5s
- **Tốc độ tối đa:** 195 km/h
- **Động cơ:** I4 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 241 Nm
- **Trọng lượng:** 1,590 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=kia-sportage

### Kia Sorento (2024)
- **ID:** `kia-sorento`
- **Mã lực:** 281 hp
- **0-100:** 6.9s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** I4 Turbo 2.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 422 Nm
- **Trọng lượng:** 1,835 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $33,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=kia-sorento

### Genesis G80 (2024)
- **ID:** `genesis-g80`
- **Mã lực:** 375 hp
- **0-100:** 5.0s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V6 Twin-Turbo 3.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 530 Nm
- **Trọng lượng:** 1,965 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $55,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=genesis-g80

### Genesis GV80 (2024)
- **ID:** `genesis-gv80`
- **Mã lực:** 375 hp
- **0-100:** 5.5s
- **Tốc độ tối đa:** 230 km/h
- **Động cơ:** V6 Twin-Turbo 3.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 530 Nm
- **Trọng lượng:** 2,215 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $58,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=genesis-gv80

### Genesis G70 (2024)
- **ID:** `genesis-g70`
- **Mã lực:** 365 hp
- **0-100:** 4.5s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** V6 Twin-Turbo 3.3L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 510 Nm
- **Trọng lượng:** 1,745 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=genesis-g70

### Volvo XC90 (2024)
- **ID:** `volvo-xc90`
- **Mã lực:** 455 hp
- **0-100:** 5.4s
- **Tốc độ tối đa:** 230 km/h
- **Động cơ:** I4 Turbo Hybrid 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 709 Nm
- **Trọng lượng:** 2,350 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $70,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=volvo-xc90

### Volvo S60 Recharge (2024)
- **ID:** `volvo-s60`
- **Mã lực:** 455 hp
- **0-100:** 4.3s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo Hybrid 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 709 Nm
- **Trọng lượng:** 2,050 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol / Plug-in Hybrid
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $55,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=volvo-s60

### Tesla Model S Plaid (2024)
- **ID:** `tesla-model-s-plaid`
- **Mã lực:** 1020 hp
- **0-100:** 1.99s
- **Tốc độ tối đa:** 322 km/h
- **Động cơ:** Tri Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,050 Nm
- **Trọng lượng:** 2,069 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $130,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=tesla-model-s-plaid

### Tesla Model 3 Performance (2024)
- **ID:** `tesla-model-3-performance`
- **Mã lực:** 510 hp
- **0-100:** 3.1s
- **Tốc độ tối đa:** 262 km/h
- **Động cơ:** Dual Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 660 Nm
- **Trọng lượng:** 1,850 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $54,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=tesla-model-3-performance

### Tesla Model X Plaid (2024)
- **ID:** `tesla-model-x-plaid`
- **Mã lực:** 1020 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 262 km/h
- **Động cơ:** Tri Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,050 Nm
- **Trọng lượng:** 2,455 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $120,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=tesla-model-x-plaid

### Tesla Model Y (2024)
- **ID:** `tesla-model-y`
- **Mã lực:** 456 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** Dual Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 510 Nm
- **Trọng lượng:** 2,000 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $48,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=tesla-model-y

### Tesla Cybertruck (2024)
- **ID:** `tesla-cybertruck`
- **Mã lực:** 600 hp
- **0-100:** 6.5s
- **Tốc độ tối đa:** 180 km/h
- **Động cơ:** Dual Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,100 Nm
- **Trọng lượng:** 3,000 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $80,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=tesla-cybertruck

### Rivian R1T (2024)
- **ID:** `rivian-r1t`
- **Mã lực:** 835 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** Quad Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,120 Nm
- **Trọng lượng:** 3,130 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $75,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=rivian-r1t

### Lucid Air Dream Edition (2024)
- **ID:** `lucid-air-dream`
- **Mã lực:** 1111 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 270 km/h
- **Động cơ:** Dual Motor
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,000 Nm
- **Trọng lượng:** 2,350 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $170,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lucid-air-dream

### Jaguar F-Type R (2024)
- **ID:** `jaguar-f-type-r`
- **Mã lực:** 575 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 300 km/h
- **Động cơ:** V8 Supercharged 5.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 700 Nm
- **Trọng lượng:** 1,865 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $110,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=jaguar-f-type-r

### Jaguar XE SV Project 8 (2019)
- **ID:** `jaguar-xe-sv`
- **Mã lực:** 592 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 322 km/h
- **Động cơ:** V8 Supercharged 5.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 700 Nm
- **Trọng lượng:** 1,745 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $190,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=jaguar-xe-sv

### Jaguar I-PACE (2024)
- **ID:** `jaguar-i-pace`
- **Mã lực:** 394 hp
- **0-100:** 4.5s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 696 Nm
- **Trọng lượng:** 2,208 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $72,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=jaguar-i-pace

### Land Rover Defender 110 (2024)
- **ID:** `land-rover-defender`
- **Mã lực:** 518 hp
- **0-100:** 4.9s
- **Tốc độ tối đa:** 240 km/h
- **Động cơ:** V8 Supercharged 5.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 625 Nm
- **Trọng lượng:** 2,485 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $105,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=land-rover-defender

### Land Rover Range Rover (2024)
- **ID:** `land-rover-range-rover`
- **Mã lực:** 523 hp
- **0-100:** 4.6s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V8 Twin-Turbo 4.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 750 Nm
- **Trọng lượng:** 2,485 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $120,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=land-rover-range-rover

### Land Rover Range Rover Velar (2024)
- **ID:** `land-rover-velar`
- **Mã lực:** 340 hp
- **0-100:** 6.2s
- **Tốc độ tối đa:** 230 km/h
- **Động cơ:** I6 Turbo 3.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 480 Nm
- **Trọng lượng:** 2,080 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $65,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=land-rover-velar

### Maserati MC20 (2024)
- **ID:** `maserati-mc20`
- **Mã lực:** 621 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 730 Nm
- **Trọng lượng:** 1,500 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $220,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=maserati-mc20

### Maserati Ghibli Trofeo (2023)
- **ID:** `maserati-ghibli`
- **Mã lực:** 580 hp
- **0-100:** 4.3s
- **Tốc độ tối đa:** 326 km/h
- **Động cơ:** V8 Twin-Turbo 3.8L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 730 Nm
- **Trọng lượng:** 1,950 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $160,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=maserati-ghibli

### Maserati Levante Trofeo (2023)
- **ID:** `maserati-levante`
- **Mã lực:** 580 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 302 km/h
- **Động cơ:** V8 Twin-Turbo 3.8L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 730 Nm
- **Trọng lượng:** 2,165 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $155,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=maserati-levante

### Lotus Emira (2024)
- **ID:** `lotus-emira`
- **Mã lực:** 400 hp
- **0-100:** 4.2s
- **Tốc độ tối đa:** 290 km/h
- **Động cơ:** V6 Supercharged 3.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 430 Nm
- **Trọng lượng:** 1,405 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $96,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lotus-emira

### Lotus Evija (2024)
- **ID:** `lotus-evija`
- **Mã lực:** 1973 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** Quad Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,700 Nm
- **Trọng lượng:** 1,680 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,300,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lotus-evija

### Lotus Elise (2021)
- **ID:** `lotus-elise`
- **Mã lực:** 240 hp
- **0-100:** 4.6s
- **Tốc độ tối đa:** 233 km/h
- **Động cơ:** I4 Supercharged 1.8L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 250 Nm
- **Trọng lượng:** 900 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Roadster
- **Giá MSRP tham khảo (catalog):** $55,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lotus-elise

### Pagani Huayra (2024)
- **ID:** `pagani-huayra`
- **Mã lực:** 730 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 370 km/h
- **Động cơ:** V12 Twin-Turbo 6.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1,000 Nm
- **Trọng lượng:** 1,350 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,800,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=pagani-huayra

### Pagani Zonda R (2009)
- **ID:** `pagani-zonda`
- **Mã lực:** 750 hp
- **0-100:** 2.7s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 6.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 710 Nm
- **Trọng lượng:** 1,070 kg
- **Hộp số:** 6-speed sequential
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Track Coupe
- **Giá MSRP tham khảo (catalog):** $1,800,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=pagani-zonda

### Bentley Continental GT (2024)
- **ID:** `bentley-continental-gt`
- **Mã lực:** 650 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 335 km/h
- **Động cơ:** W12 Twin-Turbo 6.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 2,244 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $230,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bentley-continental-gt

### Bentley Bentayga (2024)
- **ID:** `bentley-bentayga`
- **Mã lực:** 542 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 290 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 770 Nm
- **Trọng lượng:** 2,440 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $180,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bentley-bentayga

### Rolls-Royce Phantom (2024)
- **ID:** `rolls-royce-phantom`
- **Mã lực:** 563 hp
- **0-100:** 5.1s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V12 Twin-Turbo 6.75L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 2,610 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $460,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=rolls-royce-phantom

### Rolls-Royce Cullinan (2024)
- **ID:** `rolls-royce-cullinan`
- **Mã lực:** 563 hp
- **0-100:** 5.2s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V12 Twin-Turbo 6.75L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 850 Nm
- **Trọng lượng:** 2,660 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $350,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=rolls-royce-cullinan

### Rolls-Royce Ghost (2024)
- **ID:** `rolls-royce-ghost`
- **Mã lực:** 563 hp
- **0-100:** 4.8s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V12 Twin-Turbo 6.75L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 850 Nm
- **Trọng lượng:** 2,490 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $340,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=rolls-royce-ghost

### Alfa Romeo Giulia Quadrifoglio (2024)
- **ID:** `alfa-giulia-quadrifoglio`
- **Mã lực:** 505 hp
- **0-100:** 3.9s
- **Tốc độ tối đa:** 307 km/h
- **Động cơ:** V6 Twin-Turbo 2.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 650 Nm
- **Trọng lượng:** 1,580 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $83,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=alfa-giulia-quadrifoglio

### Alfa Romeo Stelvio Quadrifoglio (2024)
- **ID:** `alfa-stelvio-quadrifoglio`
- **Mã lực:** 505 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 283 km/h
- **Động cơ:** V6 Twin-Turbo 2.9L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 650 Nm
- **Trọng lượng:** 1,830 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $87,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=alfa-stelvio-quadrifoglio

### Alfa Romeo 4C (2020)
- **ID:** `alfa-4c`
- **Mã lực:** 237 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 258 km/h
- **Động cơ:** I4 Turbo 1.75L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 350 Nm
- **Trọng lượng:** 1,050 kg
- **Hộp số:** 6-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $68,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=alfa-4c

### Acura NSX (2022)
- **ID:** `acura-nsx`
- **Mã lực:** 573 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 307 km/h
- **Động cơ:** V6 Twin-Turbo Hybrid 3.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 645 Nm
- **Trọng lượng:** 1,725 kg
- **Hộp số:** 9-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $157,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=acura-nsx

### Acura Integra Type S (2024)
- **ID:** `acura-integra`
- **Mã lực:** 320 hp
- **0-100:** 5.2s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 420 Nm
- **Trọng lượng:** 1,480 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $46,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=acura-integra

### Infiniti Q60 Red Sport 400 (2022)
- **ID:** `infiniti-q60`
- **Mã lực:** 400 hp
- **0-100:** 5.0s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 475 Nm
- **Trọng lượng:** 1,740 kg
- **Hộp số:** 7-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $58,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=infiniti-q60

### Infiniti Q50 (2023)
- **ID:** `infiniti-q50`
- **Mã lực:** 300 hp
- **0-100:** 5.5s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** V6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 400 Nm
- **Trọng lượng:** 1,720 kg
- **Hộp số:** 7-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=infiniti-q50

### Porsche Cayenne Turbo GT (2024)
- **ID:** `porsche-cayenne-turbo`
- **Mã lực:** 650 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 300 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 850 Nm
- **Trọng lượng:** 2,220 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-cayenne-turbo

### Porsche Panamera GTS (2024)
- **ID:** `porsche-panamera-gts`
- **Mã lực:** 473 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 300 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 620 Nm
- **Trọng lượng:** 1,995 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $140,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-panamera-gts

### Porsche Taycan Turbo S (2024)
- **ID:** `porsche-taycan-turbo-s`
- **Mã lực:** 750 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 260 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,050 Nm
- **Trọng lượng:** 2,295 kg
- **Hộp số:** 2-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $186,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-taycan-turbo-s

### Porsche Macan GTS (2024)
- **ID:** `porsche-macan-gts`
- **Mã lực:** 434 hp
- **0-100:** 4.3s
- **Tốc độ tối đa:** 272 km/h
- **Động cơ:** V6 Twin-Turbo 2.9L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 550 Nm
- **Trọng lượng:** 1,950 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $86,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-macan-gts

### Ferrari 812 Superfast (2020)
- **ID:** `ferrari-812-superfast`
- **Mã lực:** 789 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V6 6.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 718 Nm
- **Trọng lượng:** 1,525 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $340,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-812-superfast

### Ferrari Roma (2024)
- **ID:** `ferrari-roma`
- **Mã lực:** 612 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** V8 Twin-Turbo 3.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 760 Nm
- **Trọng lượng:** 1,472 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $230,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-roma

### Ferrari F8 Tributo (2023)
- **ID:** `ferrari-f8-tributo`
- **Mã lực:** 710 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V8 Twin-Turbo 3.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 770 Nm
- **Trọng lượng:** 1,435 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $280,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-f8-tributo

### Ferrari Portofino M (2024)
- **ID:** `ferrari-portofino`
- **Mã lực:** 612 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** V8 Twin-Turbo 3.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 760 Nm
- **Trọng lượng:** 1,735 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $250,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-portofino

### Lamborghini Aventador SVJ (2021)
- **ID:** `lamborghini-aventador-svj`
- **Mã lực:** 759 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 6.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 720 Nm
- **Trọng lượng:** 1,525 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $520,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-aventador-svj

### Lamborghini Huracán EVO (2024)
- **ID:** `lamborghini-huracan-evo`
- **Mã lực:** 640 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V10 5.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 600 Nm
- **Trọng lượng:** 1,422 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $260,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-huracan-evo

### Lamborghini Urus (2024)
- **ID:** `lamborghini-urus`
- **Mã lực:** 657 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 306 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 850 Nm
- **Trọng lượng:** 2,200 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $230,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-urus

### Lamborghini Sián (2021)
- **ID:** `lamborghini-sian`
- **Mã lực:** 808 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 Hybrid 6.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 720 Nm
- **Trọng lượng:** 1,600 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $3,200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-sian

### McLaren 720S (2023)
- **ID:** `mclaren-720s`
- **Mã lực:** 710 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 341 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 770 Nm
- **Trọng lượng:** 1,283 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $310,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-720s

### McLaren P1 (2015)
- **ID:** `mclaren-p1`
- **Mã lực:** 903 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid 3.8L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 1,490 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,150,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-p1

### McLaren Senna (2019)
- **ID:** `mclaren-senna`
- **Mã lực:** 789 hp
- **0-100:** 2.7s
- **Tốc độ tối đa:** 335 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,198 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,000,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-senna

### McLaren GT (2024)
- **ID:** `mclaren-gt`
- **Mã lực:** 612 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 326 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 630 Nm
- **Trọng lượng:** 1,530 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $210,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-gt

### Aston Martin DB12 (2024)
- **ID:** `aston-martin-db12`
- **Mã lực:** 671 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,785 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $250,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-db12

### Aston Martin Vantage (2024)
- **ID:** `aston-martin-vantage`
- **Mã lực:** 656 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,705 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $165,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-vantage

### Aston Martin DBX707 (2024)
- **ID:** `aston-martin-dbx`
- **Mã lực:** 697 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 310 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 2,245 kg
- **Hộp số:** 9-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $245,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-dbx

### Aston Martin Valour (2024)
- **ID:** `aston-martin-valour`
- **Mã lực:** 705 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** V12 5.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 753 Nm
- **Trọng lượng:** 1,695 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,000,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-valour

### Cadillac CT5-V Blackwing (2024)
- **ID:** `cadillac-ct5-v-blackwing`
- **Mã lực:** 668 hp
- **0-100:** 3.6s
- **Tốc độ tối đa:** 322 km/h
- **Động cơ:** V6 Supercharged 6.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 893 Nm
- **Trọng lượng:** 1,840 kg
- **Hộp số:** 6-speed MT/10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $95,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=cadillac-ct5-v-blackwing

### Cadillac Escalade V (2024)
- **ID:** `cadillac-escalade-v`
- **Mã lực:** 682 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** V8 Supercharged 6.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 885 Nm
- **Trọng lượng:** 2,950 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $150,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=cadillac-escalade-v

### Cadillac Lyriq (2024)
- **ID:** `cadillac-lyriq`
- **Mã lực:** 500 hp
- **0-100:** 4.7s
- **Tốc độ tối đa:** 200 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 610 Nm
- **Trọng lượng:** 2,600 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $58,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=cadillac-lyriq

### GMC Hummer EV (2024)
- **ID:** `gmc-hummer-ev`
- **Mã lực:** 1000 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 170 km/h
- **Động cơ:** Triple Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1,550 Nm
- **Trọng lượng:** 4,100 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $110,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=gmc-hummer-ev

### GMC Sierra 1500 Denali (2024)
- **ID:** `gmc-sierra-denali`
- **Mã lực:** 420 hp
- **0-100:** 6.0s
- **Tốc độ tối đa:** 180 km/h
- **Động cơ:** V8 6.2L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 624 Nm
- **Trọng lượng:** 2,400 kg
- **Hộp số:** 10-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $65,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=gmc-sierra-denali

### Jeep Wrangler Rubicon 392 (2024)
- **ID:** `jeep-wrangler-rubicon`
- **Mã lực:** 470 hp
- **0-100:** 4.5s
- **Tốc độ tối đa:** 170 km/h
- **Động cơ:** V8 6.4L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 637 Nm
- **Trọng lượng:** 2,380 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $85,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=jeep-wrangler-rubicon

### Jeep Grand Cherokee Trackhawk (2023)
- **ID:** `jeep-grand-cherokee`
- **Mã lực:** 707 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 290 km/h
- **Động cơ:** V8 Supercharged 6.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 875 Nm
- **Trọng lượng:** 2,450 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $95,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=jeep-grand-cherokee

### Hummer H1 Alpha (2006)
- **ID:** `hummer-h1`
- **Mã lực:** 300 hp
- **0-100:** 13.5s
- **Tốc độ tối đa:** 134 km/h
- **Động cơ:** V8 Turbo Diesel 6.6L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 705 Nm
- **Trọng lượng:** 3,700 kg
- **Hộp số:** 5-speed AT
- **Nhiên liệu:** Diesel
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $140,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=hummer-h1

### Shelby GT500 (2022)
- **ID:** `shelby-gt500`
- **Mã lực:** 760 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 290 km/h
- **Động cơ:** V8 Supercharged 5.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 847 Nm
- **Trọng lượng:** 1,893 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $80,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=shelby-gt500

### Shelby Cobra 427 (1965)
- **ID:** `shelby-cobra`
- **Mã lực:** 485 hp
- **0-100:** 4.2s
- **Tốc độ tối đa:** 260 km/h
- **Động cơ:** V8 7.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 650 Nm
- **Trọng lượng:** 1,068 kg
- **Hộp số:** 4-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Roadster
- **Giá MSRP tham khảo (catalog):** $1,500,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=shelby-cobra

### MINI John Cooper Works (2024)
- **ID:** `mini-john-cooper-works`
- **Mã lực:** 228 hp
- **0-100:** 6.1s
- **Tốc độ tối đa:** 246 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 320 Nm
- **Trọng lượng:** 1,360 kg
- **Hộp số:** 6-speed MT/8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $35,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mini-john-cooper-works

### MINI Countryman JCW (2024)
- **ID:** `mini-countryman-jcw`
- **Mã lực:** 301 hp
- **0-100:** 5.1s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 400 Nm
- **Trọng lượng:** 1,720 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $46,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mini-countryman-jcw

### Mitsubishi Lancer Evolution X (2016)
- **ID:** `mitsubishi-lancer-evo-x`
- **Mã lực:** 291 hp
- **0-100:** 4.9s
- **Tốc độ tối đa:** 240 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 407 Nm
- **Trọng lượng:** 1,560 kg
- **Hộp số:** 5-speed MT/6-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $38,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mitsubishi-lancer-evo-x

### Mitsubishi Pajero (2021)
- **ID:** `mitsubishi-pajero`
- **Mã lực:** 181 hp
- **0-100:** 10.5s
- **Tốc độ tối đa:** 175 km/h
- **Động cơ:** V6 3.2L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 441 Nm
- **Trọng lượng:** 2,215 kg
- **Hộp số:** 5-speed AT
- **Nhiên liệu:** Diesel
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $42,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mitsubishi-pajero

### Peugeot 208 GTi (2023)
- **ID:** `peugeot-208-gti`
- **Mã lực:** 208 hp
- **0-100:** 6.5s
- **Tốc độ tối đa:** 230 km/h
- **Động cơ:** I4 Turbo 1.6L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 300 Nm
- **Trọng lượng:** 1,160 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $28,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=peugeot-208-gti

### Peugeot 508 PSE (2024)
- **ID:** `peugeot-508-pse`
- **Mã lực:** 360 hp
- **0-100:** 5.2s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo Hybrid 1.6L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 520 Nm
- **Trọng lượng:** 1,875 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $55,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=peugeot-508-pse

### Renault Clio RS (2023)
- **ID:** `renault-clio-rs`
- **Mã lực:** 200 hp
- **0-100:** 6.7s
- **Tốc độ tối đa:** 225 km/h
- **Động cơ:** I4 Turbo 1.3L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 280 Nm
- **Trọng lượng:** 1,270 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $26,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=renault-clio-rs

### Renault Megane RS (2023)
- **ID:** `renault-megane-rs`
- **Mã lực:** 300 hp
- **0-100:** 5.7s
- **Tốc độ tối đa:** 255 km/h
- **Động cơ:** I4 Turbo 1.8L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 420 Nm
- **Trọng lượng:** 1,450 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $40,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=renault-megane-rs

### Skoda Octavia RS (2024)
- **ID:** `skoda-octavia-rs`
- **Mã lực:** 245 hp
- **0-100:** 6.7s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 370 Nm
- **Trọng lượng:** 1,525 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Wagon
- **Giá MSRP tham khảo (catalog):** $35,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=skoda-octavia-rs

### SEAT Leon Cupra (2024)
- **ID:** `seat-leon-cupra`
- **Mã lực:** 300 hp
- **0-100:** 5.7s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 400 Nm
- **Trọng lượng:** 1,465 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $38,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=seat-leon-cupra

### Suzuki Swift Sport (2024)
- **ID:** `suzuki-swift-sport`
- **Mã lực:** 129 hp
- **0-100:** 8.0s
- **Tốc độ tối đa:** 210 km/h
- **Động cơ:** I4 1.4L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 235 Nm
- **Trọng lượng:** 1,025 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $22,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=suzuki-swift-sport

### Suzuki Jimny (2024)
- **ID:** `suzuki-jimny`
- **Mã lực:** 101 hp
- **0-100:** 12.0s
- **Tốc độ tối đa:** 145 km/h
- **Động cơ:** I4 1.5L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 130 Nm
- **Trọng lượng:** 1,090 kg
- **Hộp số:** 5-speed MT/4-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** SUV
- **Giá MSRP tham khảo (catalog):** $24,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=suzuki-jimny

### Lancia Delta HF Integrale (1994)
- **ID:** `lancia-delta-hf`
- **Mã lực:** 215 hp
- **0-100:** 5.7s
- **Tốc độ tối đa:** 220 km/h
- **Động cơ:** I4 Turbo 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 310 Nm
- **Trọng lượng:** 1,350 kg
- **Hộp số:** 5-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Hatchback
- **Giá MSRP tham khảo (catalog):** $45,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lancia-delta-hf

### Daihatsu Copen (2022)
- **ID:** `daihatsu-copen`
- **Mã lực:** 63 hp
- **0-100:** 11.5s
- **Tốc độ tối đa:** 140 km/h
- **Động cơ:** I3 Turbo 0.66L
- **Dẫn động:** FWD
- **Mô-men xoắn:** 92 Nm
- **Trọng lượng:** 850 kg
- **Hộp số:** 5-speed MT/CVT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Roadster
- **Giá MSRP tham khảo (catalog):** $18,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=daihatsu-copen

### Isuzu D-Max (2024)
- **ID:** `isuzu-d-max`
- **Mã lực:** 190 hp
- **0-100:** 10.5s
- **Tốc độ tối đa:** 175 km/h
- **Động cơ:** I4 Turbo Diesel 3.0L
- **Dẫn động:** 4WD
- **Mô-men xoắn:** 450 Nm
- **Trọng lượng:** 2,050 kg
- **Hộp số:** 6-speed AT
- **Nhiên liệu:** Diesel
- **Kiểu dáng:** Pickup
- **Giá MSRP tham khảo (catalog):** $30,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=isuzu-d-max

### Ferrari LaFerrari (2015)
- **ID:** `ferrari-laferrari`
- **Mã lực:** 950 hp
- **0-100:** 2.6s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 Hybrid 6.3L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 1,255 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,400,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-laferrari

### Ferrari Enzo (2003)
- **ID:** `ferrari-enzo`
- **Mã lực:** 660 hp
- **0-100:** 3.6s
- **Tốc độ tối đa:** 365 km/h
- **Động cơ:** V12 6.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 657 Nm
- **Trọng lượng:** 1,255 kg
- **Hộp số:** 6-speed Seq
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $650,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-enzo

### Ferrari F40 (1992)
- **ID:** `ferrari-f40`
- **Mã lực:** 478 hp
- **0-100:** 4.1s
- **Tốc độ tối đa:** 324 km/h
- **Động cơ:** V8 Twin-Turbo 2.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 577 Nm
- **Trọng lượng:** 1,100 kg
- **Hộp số:** 5-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $400,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-f40

### Ferrari 488 GTB (2019)
- **ID:** `ferrari-488-gtb`
- **Mã lực:** 661 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V8 Twin-Turbo 3.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 760 Nm
- **Trọng lượng:** 1,475 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $280,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-488-gtb

### Ferrari 458 Italia (2015)
- **ID:** `ferrari-458-italia`
- **Mã lực:** 570 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V8 4.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 540 Nm
- **Trọng lượng:** 1,485 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $240,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-458-italia

### Ferrari F12 Berlinetta (2017)
- **ID:** `ferrari-f12-berlinetta`
- **Mã lực:** 740 hp
- **0-100:** 3.1s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V12 6.3L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 690 Nm
- **Trọng lượng:** 1,525 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $320,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-f12-berlinetta

### Ferrari GTC4Lusso (2020)
- **ID:** `ferrari-gtc4lusso`
- **Mã lực:** 680 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 335 km/h
- **Động cơ:** V12 6.3L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 697 Nm
- **Trọng lượng:** 1,790 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Shooting Brake
- **Giá MSRP tham khảo (catalog):** $300,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-gtc4lusso

### Ferrari California T (2017)
- **ID:** `ferrari-california-t`
- **Mã lực:** 553 hp
- **0-100:** 3.6s
- **Tốc độ tối đa:** 316 km/h
- **Động cơ:** V8 Twin-Turbo 3.9L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 755 Nm
- **Trọng lượng:** 1,730 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-california-t

### Lamborghini Countach LPI 800-4 (2022)
- **ID:** `lamborghini-countach-lpi`
- **Mã lực:** 814 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 355 km/h
- **Động cơ:** V12 Hybrid 6.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 720 Nm
- **Trọng lượng:** 1,595 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,600,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-countach-lpi

### Lamborghini Murcielago (2001)
- **ID:** `lamborghini-murcielago`
- **Mã lực:** 580 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** 6.2L V12
- **Dẫn động:** AWD
- **Mô-men xoắn:** 650 Nm
- **Trọng lượng:** 1,650 kg
- **Hộp số:** 6-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $273,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-murcielago

### Lamborghini Gallardo (2014)
- **ID:** `lamborghini-gallardo`
- **Mã lực:** 562 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V10 5.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 540 Nm
- **Trọng lượng:** 1,430 kg
- **Hộp số:** 6-speed E-gear
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-gallardo

### Lamborghini Centenario (2017)
- **ID:** `lamborghini-centenario`
- **Mã lực:** 770 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V12 6.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 690 Nm
- **Trọng lượng:** 1,520 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,900,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-centenario

### Lamborghini Reventón (2009)
- **ID:** `lamborghini-reventon`
- **Mã lực:** 650 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** V12 6.5L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 660 Nm
- **Trọng lượng:** 1,665 kg
- **Hộp số:** 6-speed E-gear
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,300,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-reventon

### Lamborghini Huracán Performante (2018)
- **ID:** `lamborghini-huracan-performante`
- **Mã lực:** 640 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V10 5.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 600 Nm
- **Trọng lượng:** 1,382 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $280,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-huracan-performante

### Porsche Carrera GT (2005)
- **ID:** `porsche-carrera-gt`
- **Mã lực:** 612 hp
- **0-100:** 3.9s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V10 5.7L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 590 Nm
- **Trọng lượng:** 1,380 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $450,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-carrera-gt

### Porsche 911 Turbo S (2024)
- **ID:** `porsche-911-turbo-s`
- **Mã lực:** 650 hp
- **0-100:** 2.7s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** Flat-6 Twin-Turbo 3.7L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,640 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $230,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-911-turbo-s

### Porsche 911 GT2 RS (2018)
- **ID:** `porsche-911-gt2-rs`
- **Mã lực:** 700 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** Flat-6 Twin-Turbo 3.8L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 750 Nm
- **Trọng lượng:** 1,470 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $300,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-911-gt2-rs

### Porsche 718 Cayman GT4 RS (2024)
- **ID:** `porsche-cayman-gt4-rs`
- **Mã lực:** 500 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 315 km/h
- **Động cơ:** Flat-6 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 450 Nm
- **Trọng lượng:** 1,415 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $150,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-cayman-gt4-rs

### McLaren 570S (2019)
- **ID:** `mclaren-570s`
- **Mã lực:** 570 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 328 km/h
- **Động cơ:** V8 Twin-Turbo 3.8L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 600 Nm
- **Trọng lượng:** 1,313 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $195,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-570s

### McLaren 765LT (2021)
- **ID:** `mclaren-765lt`
- **Mã lực:** 765 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,229 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $380,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-765lt

### McLaren Speedtail (2020)
- **ID:** `mclaren-speedtail`
- **Mã lực:** 1050 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 403 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1150 Nm
- **Trọng lượng:** 1,430 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-speedtail

### McLaren Senna GTR (2019)
- **ID:** `mclaren-senna-gtr`
- **Mã lực:** 825 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 335 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 800 Nm
- **Trọng lượng:** 1,188 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,300,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-senna-gtr

### Bugatti Veyron (2015)
- **ID:** `bugatti-veyron`
- **Mã lực:** 1200 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 431 km/h
- **Động cơ:** W16 Quad-Turbo 8.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1500 Nm
- **Trọng lượng:** 1,888 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,700,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bugatti-veyron

### Bugatti Divo (2020)
- **ID:** `bugatti-divo`
- **Mã lực:** 1500 hp
- **0-100:** 2.4s
- **Tốc độ tối đa:** 380 km/h
- **Động cơ:** W16 Quad-Turbo 8.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1600 Nm
- **Trọng lượng:** 1,950 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $5,800,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bugatti-divo

### Bugatti Centodieci (2022)
- **ID:** `bugatti-centodieci`
- **Mã lực:** 1600 hp
- **0-100:** 2.4s
- **Tốc độ tối đa:** 380 km/h
- **Động cơ:** W16 Quad-Turbo 8.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1600 Nm
- **Trọng lượng:** 1,976 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $9,000,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bugatti-centodieci

### Koenigsegg Agera RS (2018)
- **ID:** `koenigsegg-agera-rs`
- **Mã lực:** 1360 hp
- **0-100:** 2.6s
- **Tốc độ tối đa:** 447 km/h
- **Động cơ:** V8 Twin-Turbo 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1371 Nm
- **Trọng lượng:** 1,395 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol / E85
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,500,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=koenigsegg-agera-rs

### Koenigsegg Gemera (2024)
- **ID:** `koenigsegg-gemera`
- **Mã lực:** 1700 hp
- **0-100:** 1.9s
- **Tốc độ tối đa:** 400 km/h
- **Động cơ:** I3 Twin-Turbo Hybrid 2.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 3500 Nm
- **Trọng lượng:** 1,850 kg
- **Hộp số:** KDD Direct Drive
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,700,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=koenigsegg-gemera

### Koenigsegg Regera (2016)
- **ID:** `koenigsegg-regera`
- **Mã lực:** 1500 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 410 km/h
- **Động cơ:** V8 Twin-Turbo Hybrid 5.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 2000 Nm
- **Trọng lượng:** 1,590 kg
- **Hộp số:** KDD Direct Drive
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,900,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=koenigsegg-regera

### Pagani Huayra (2020)
- **ID:** `pagani-huayra`
- **Mã lực:** 730 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 370 km/h
- **Động cơ:** V12 Twin-Turbo 6.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1000 Nm
- **Trọng lượng:** 1,350 kg
- **Hộp số:** 7-speed Seq
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $1,400,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=pagani-huayra

### Pagani Utopia (2023)
- **ID:** `pagani-utopia`
- **Mã lực:** 864 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 360 km/h
- **Động cơ:** V12 Twin-Turbo 6.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1100 Nm
- **Trọng lượng:** 1,280 kg
- **Hộp số:** 7-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=pagani-utopia

### Aston Martin DB11 (2023)
- **ID:** `aston-martin-db11`
- **Mã lực:** 630 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 322 km/h
- **Động cơ:** V8 Twin-Turbo 4.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 700 Nm
- **Trọng lượng:** 1,760 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $220,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-db11

### Aston Martin DBS Superleggera (2022)
- **ID:** `aston-martin-dbs`
- **Mã lực:** 715 hp
- **0-100:** 3.4s
- **Tốc độ tối đa:** 339 km/h
- **Động cơ:** V12 Twin-Turbo 5.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 900 Nm
- **Trọng lượng:** 1,693 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $325,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-dbs

### Aston Martin Valhalla (2024)
- **ID:** `aston-martin-valhalla`
- **Mã lực:** 937 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 350 km/h
- **Động cơ:** V6 Twin-Turbo Hybrid 3.0L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1000 Nm
- **Trọng lượng:** 1,550 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $800,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-valhalla

### Maserati MC20 (2024)
- **ID:** `maserati-mc20`
- **Mã lực:** 630 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** V6 Twin-Turbo 3.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 730 Nm
- **Trọng lượng:** 1,500 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $215,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=maserati-mc20

### Maserati MC12 (2005)
- **ID:** `maserati-mc12`
- **Mã lực:** 630 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** V12 6.0L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 652 Nm
- **Trọng lượng:** 1,335 kg
- **Hộp số:** 6-speed Seq
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $600,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=maserati-mc12

### Lotus Evija (2023)
- **ID:** `lotus-evija`
- **Mã lực:** 2000 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** Quad Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1700 Nm
- **Trọng lượng:** 1,680 kg
- **Hộp số:** 1-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,300,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lotus-evija

### Lotus Emira (2024)
- **ID:** `lotus-emira`
- **Mã lực:** 400 hp
- **0-100:** 4.2s
- **Tốc độ tối đa:** 290 km/h
- **Động cơ:** V6 Supercharged 3.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 420 Nm
- **Trọng lượng:** 1,405 kg
- **Hộp số:** 6-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $100,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lotus-emira

### Mercedes-Benz AMG ONE (2023)
- **ID:** `mercedes-amg-one`
- **Mã lực:** 1063 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 352 km/h
- **Động cơ:** V6 Turbo Hybrid 1.6L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1000+ Nm
- **Trọng lượng:** 1,695 kg
- **Hộp số:** 8-speed AMG
- **Nhiên liệu:** Petrol / Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,700,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-amg-one

### Mercedes-Benz SLR McLaren (2009)
- **ID:** `mercedes-slr-mclaren`
- **Mã lực:** 626 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 334 km/h
- **Động cơ:** V8 Supercharged 5.4L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 780 Nm
- **Trọng lượng:** 1,768 kg
- **Hộp số:** 5-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $500,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-slr-mclaren

### Mercedes-Benz SLS AMG (2015)
- **ID:** `mercedes-sls-amg`
- **Mã lực:** 591 hp
- **0-100:** 3.8s
- **Tốc độ tối đa:** 317 km/h
- **Động cơ:** V8 6.2L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 650 Nm
- **Trọng lượng:** 1,619 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $250,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mercedes-sls-amg

### BMW M8 Competition (2024)
- **ID:** `bmw-m8-competition`
- **Mã lực:** 625 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 306 km/h
- **Động cơ:** V8 Twin-Turbo 4.4L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 750 Nm
- **Trọng lượng:** 1,850 kg
- **Hộp số:** 8-speed AT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $130,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m8-competition

### BMW M1 (1981)
- **ID:** `bmw-m1`
- **Mã lực:** 277 hp
- **0-100:** 5.6s
- **Tốc độ tối đa:** 260 km/h
- **Động cơ:** I6 3.5L
- **Dẫn động:** RWD
- **Mô-men xoắn:** 330 Nm
- **Trọng lượng:** 1,300 kg
- **Hộp số:** 5-speed MT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $120,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bmw-m1

### Audi R8 V10 Performance (2023)
- **ID:** `audi-r8-v10`
- **Mã lực:** 620 hp
- **0-100:** 3.1s
- **Tốc độ tối đa:** 331 km/h
- **Động cơ:** V10 5.2L
- **Dẫn động:** AWD
- **Mô-men xoắn:** 580 Nm
- **Trọng lượng:** 1,595 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $160,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-r8-v10

### Audi RS e-tron GT (2024)
- **ID:** `audi-rs-e-tron-gt`
- **Mã lực:** 646 hp
- **0-100:** 3.3s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** Dual Electric Motors
- **Dẫn động:** AWD
- **Mô-men xoắn:** 830 Nm
- **Trọng lượng:** 2,350 kg
- **Hộp số:** 2-speed
- **Nhiên liệu:** Electric
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $145,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=audi-rs-e-tron-gt

### Ferrari 12Cilindri (2024)
- **ID:** `ferrari-12cilindri`
- **Mã lực:** 830 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 340 km/h
- **Động cơ:** 6.5L V12
- **Dẫn động:** RWD
- **Mô-men xoắn:** 678 Nm
- **Trọng lượng:** 1,560 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $430,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-12cilindri

### Ferrari 296 Speciale (2025)
- **ID:** `ferrari-296-speciale`
- **Mã lực:** 819 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** 3.0L Twin-Turbo V6 PHEV
- **Dẫn động:** RWD
- **Mô-men xoắn:** 740 Nm
- **Trọng lượng:** 1,470 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Hybrid
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $350,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-296-speciale

### Ferrari 296 Speciale A (2025)
- **ID:** `ferrari-296-speciale-a`
- **Mã lực:** 819 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** 3.0L Twin-Turbo V6 PHEV
- **Dẫn động:** RWD
- **Mô-men xoắn:** 740 Nm
- **Trọng lượng:** 1,540 kg
- **Hộp số:** 8-speed DCT
- **Nhiên liệu:** Hybrid
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $380,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-296-speciale-a

### Ferrari 3.2 Mondial (1985)
- **ID:** `ferrari-3-2-mondial`
- **Mã lực:** 270 hp
- **0-100:** 7.4s
- **Tốc độ tối đa:** 250 km/h
- **Động cơ:** 3.2L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 304 Nm
- **Trọng lượng:** 1,430 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $40,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-3-2-mondial

### Ferrari 308 Convertible (1977)
- **ID:** `ferrari-308-convertible`
- **Mã lực:** 255 hp
- **0-100:** 6.5s
- **Tốc độ tối đa:** 252 km/h
- **Động cơ:** 2.9L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 283 Nm
- **Trọng lượng:** 1,090 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $50,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-308-convertible

### Ferrari 308GTB (1975)
- **ID:** `ferrari-308gtb`
- **Mã lực:** 255 hp
- **0-100:** 6.5s
- **Tốc độ tối đa:** 252 km/h
- **Động cơ:** 2.9L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 283 Nm
- **Trọng lượng:** 1,090 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $55,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-308gtb

### Ferrari 308GTB Quattrovalvole (1982)
- **ID:** `ferrari-308gtb-quattrovalvole`
- **Mã lực:** 240 hp
- **0-100:** 6.1s
- **Tốc độ tối đa:** 255 km/h
- **Động cơ:** 2.9L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 260 Nm
- **Trọng lượng:** 1,275 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $60,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-308gtb-quattrovalvole

### Ferrari 308GTBi (1980)
- **ID:** `ferrari-308gtbi`
- **Mã lực:** 214 hp
- **0-100:** 7.3s
- **Tốc độ tối đa:** 240 km/h
- **Động cơ:** 2.9L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 243 Nm
- **Trọng lượng:** 1,286 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $50,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-308gtbi

### Ferrari 308GTS (1977)
- **ID:** `ferrari-308gts`
- **Mã lực:** 255 hp
- **0-100:** 6.5s
- **Tốc độ tối đa:** 252 km/h
- **Động cơ:** 2.9L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 283 Nm
- **Trọng lượng:** 1,090 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $50,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-308gts

### Ferrari 308GTS Quattrovalvole (1982)
- **ID:** `ferrari-308gts-quattrovalvole`
- **Mã lực:** 240 hp
- **0-100:** 6.1s
- **Tốc độ tối đa:** 255 km/h
- **Động cơ:** 2.9L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 260 Nm
- **Trọng lượng:** 1,275 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $60,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=ferrari-308gts-quattrovalvole

### Lamborghini Diablo (1990)
- **ID:** `lamborghini-diablo`
- **Mã lực:** 492 hp
- **0-100:** 4.5s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** 5.7L V12
- **Dẫn động:** RWD
- **Mô-men xoắn:** 580 Nm
- **Trọng lượng:** 1,576 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $239,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-diablo

### Lamborghini Huracan (2014)
- **ID:** `lamborghini-huracan`
- **Mã lực:** 610 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 325 km/h
- **Động cơ:** 5.2L V10
- **Dẫn động:** AWD
- **Mô-men xoắn:** 560 Nm
- **Trọng lượng:** 1,422 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $240,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=lamborghini-huracan

### McLaren 540C (2015)
- **ID:** `mclaren-540c`
- **Mã lực:** 533 hp
- **0-100:** 3.5s
- **Tốc độ tối đa:** 320 km/h
- **Động cơ:** 3.8L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 540 Nm
- **Trọng lượng:** 1,311 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $165,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-540c

### McLaren 600LT (2018)
- **ID:** `mclaren-600lt`
- **Mã lực:** 592 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 328 km/h
- **Động cơ:** 3.8L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 620 Nm
- **Trọng lượng:** 1,247 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $240,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-600lt

### McLaren 620R (2020)
- **ID:** `mclaren-620r`
- **Mã lực:** 612 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 322 km/h
- **Động cơ:** 3.8L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 620 Nm
- **Trọng lượng:** 1,282 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $299,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-620r

### McLaren 625C (2015)
- **ID:** `mclaren-625c`
- **Mã lực:** 616 hp
- **0-100:** 3.1s
- **Tốc độ tối đa:** 333 km/h
- **Động cơ:** 3.8L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 610 Nm
- **Trọng lượng:** 1,336 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $230,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-625c

### McLaren 650S (2014)
- **ID:** `mclaren-650s`
- **Mã lực:** 641 hp
- **0-100:** 3.0s
- **Tốc độ tối đa:** 333 km/h
- **Động cơ:** 3.8L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 678 Nm
- **Trọng lượng:** 1,330 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $265,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-650s

### McLaren 675LT (2015)
- **ID:** `mclaren-675lt`
- **Mã lực:** 666 hp
- **0-100:** 2.9s
- **Tốc độ tối đa:** 330 km/h
- **Động cơ:** 3.8L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 700 Nm
- **Trọng lượng:** 1,230 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $349,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=mclaren-675lt

### Porsche 718 Boxster (2016)
- **ID:** `porsche-718-boxster`
- **Mã lực:** 300 hp
- **0-100:** 5.1s
- **Tốc độ tối đa:** 275 km/h
- **Động cơ:** 2.0L Turbo Flat-4
- **Dẫn động:** RWD
- **Mô-men xoắn:** 380 Nm
- **Trọng lượng:** 1,335 kg
- **Hộp số:** 6-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $60,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-718-boxster

### Porsche 718 Spyder (2019)
- **ID:** `porsche-718-spyder`
- **Mã lực:** 420 hp
- **0-100:** 4.4s
- **Tốc độ tối đa:** 301 km/h
- **Động cơ:** 4.0L Flat-6
- **Dẫn động:** RWD
- **Mô-men xoắn:** 420 Nm
- **Trọng lượng:** 1,420 kg
- **Hộp số:** 6-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $98,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-718-spyder

### Porsche 924 (1976)
- **ID:** `porsche-924`
- **Mã lực:** 125 hp
- **0-100:** 9.6s
- **Tốc độ tối đa:** 204 km/h
- **Động cơ:** 2.0L Inline-4
- **Dẫn động:** RWD
- **Mô-men xoắn:** 165 Nm
- **Trọng lượng:** 1,080 kg
- **Hộp số:** 4-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $10,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=porsche-924

### Bugatti EB110 (1991)
- **ID:** `bugatti-eb110`
- **Mã lực:** 553 hp
- **0-100:** 3.2s
- **Tốc độ tối đa:** 342 km/h
- **Động cơ:** 3.5L Quad-Turbo V12
- **Dẫn động:** AWD
- **Mô-men xoắn:** 611 Nm
- **Trọng lượng:** 1,615 kg
- **Hộp số:** 6-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $350,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bugatti-eb110

### Bugatti Mistral (2024)
- **ID:** `bugatti-mistral`
- **Mã lực:** 1578 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 420 km/h
- **Động cơ:** 8.0L Quad-Turbo W16
- **Dẫn động:** AWD
- **Mô-men xoắn:** 1600 Nm
- **Trọng lượng:** 1,960 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Convertible
- **Giá MSRP tham khảo (catalog):** $5,000,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=bugatti-mistral

### Koenigsegg CC850 (2024)
- **ID:** `koenigsegg-cc850`
- **Mã lực:** 1385 hp
- **0-100:** 2.5s
- **Tốc độ tối đa:** 480 km/h
- **Động cơ:** 5.0L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1385 Nm
- **Trọng lượng:** 1,385 kg
- **Hộp số:** 9-speed Light Speed Auto/Manual
- **Nhiên liệu:** E85/Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $3,650,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=koenigsegg-cc850

### Koenigsegg One:1 (2014)
- **ID:** `koenigsegg-one-1`
- **Mã lực:** 1341 hp
- **0-100:** 2.8s
- **Tốc độ tối đa:** 440 km/h
- **Động cơ:** 5.0L Twin-Turbo V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 1371 Nm
- **Trọng lượng:** 1,360 kg
- **Hộp số:** 7-speed DCT
- **Nhiên liệu:** E85/Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $2,850,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=koenigsegg-one-1

### Aston Martin DB7 (1994)
- **ID:** `aston-martin-db7`
- **Mã lực:** 335 hp
- **0-100:** 5.8s
- **Tốc độ tối đa:** 266 km/h
- **Động cơ:** 3.2L Supercharged I6
- **Dẫn động:** RWD
- **Mô-men xoắn:** 490 Nm
- **Trọng lượng:** 1,725 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $140,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-db7

### Aston Martin DB9 (2004)
- **ID:** `aston-martin-db9`
- **Mã lực:** 450 hp
- **0-100:** 4.9s
- **Tốc độ tối đa:** 300 km/h
- **Động cơ:** 5.9L V12
- **Dẫn động:** RWD
- **Mô-men xoắn:** 570 Nm
- **Trọng lượng:** 1,710 kg
- **Hộp số:** 6-speed auto
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $155,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-db9

### Aston Martin Lagonda (1976)
- **ID:** `aston-martin-lagonda`
- **Mã lực:** 280 hp
- **0-100:** 8.8s
- **Tốc độ tối đa:** 240 km/h
- **Động cơ:** 5.3L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 409 Nm
- **Trọng lượng:** 2,023 kg
- **Hộp số:** 3-speed auto
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $150,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-lagonda

### Aston Martin Rapide (2010)
- **ID:** `aston-martin-rapide`
- **Mã lực:** 477 hp
- **0-100:** 5.2s
- **Tốc độ tối đa:** 296 km/h
- **Động cơ:** 5.9L V12
- **Dẫn động:** RWD
- **Mô-men xoắn:** 600 Nm
- **Trọng lượng:** 1,990 kg
- **Hộp số:** 6-speed auto
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Sedan
- **Giá MSRP tham khảo (catalog):** $200,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-rapide

### Aston Martin V8 (1969)
- **ID:** `aston-martin-v8`
- **Mã lực:** 315 hp
- **0-100:** 6.2s
- **Tốc độ tối đa:** 260 km/h
- **Động cơ:** 5.3L V8
- **Dẫn động:** RWD
- **Mô-men xoắn:** 488 Nm
- **Trọng lượng:** 1,800 kg
- **Hộp số:** 5-speed manual
- **Nhiên liệu:** Petrol
- **Kiểu dáng:** Coupe
- **Giá MSRP tham khảo (catalog):** $50,000
- **Mô tả ngắn:** Không có
- **URL:** /pages/car-detail.html?id=aston-martin-v8

---

# PHẦN 3 — Marketplace (tính năng + FAQ + tin rao)

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
