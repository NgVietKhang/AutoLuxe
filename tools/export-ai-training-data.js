/**
 * Export full AI training bundle for AutoLuxe (Chatbase, RAG, fine-tune prep).
 *
 * Usage: node tools/export-ai-training-data.js
 *
 * Primary output (upload this file to your AI platform):
 *   docs/autoluxe-ai-training.md
 *
 * Also writes:
 *   docs/ai-training/catalog-cars.json
 *   docs/ai-training/marketplace-listings.json
 *   docs/ai-training/marketplace-ai-training.md  (marketplace-only, upload riêng)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'ai-training');
const FULL_MD_PATH = path.join(ROOT, 'docs', 'autoluxe-ai-training.md');

function loadCarDatabase() {
  const files = [
    'assets/js/car-data.js',
    'assets/js/car-data-extended.js',
    'assets/js/car-data-specs-import.js'
  ];

  const sandbox = {
    CAR_DATABASE: [],
    BrandModelNormalize: {
      normalizeToken: (v) => String(v || '').trim().toLowerCase(),
      normalizePair: (make, model) => ({
        make: String(make || '').trim().toLowerCase(),
        model: String(model || '').trim().toLowerCase()
      }),
      isExactMatch: (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()
    },
    CarImagePaths: {
      resolveImage: () => null
    }
  };

  for (const rel of files) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: rel });
  }

  return sandbox.CAR_DATABASE;
}

function loadMarketplaceSeed() {
  const code = fs.readFileSync(path.join(ROOT, 'assets/js/seed.js'), 'utf8');
  const sandbox = { Storage: { get: () => [], set: () => true }, Seed: null };
  vm.runInNewContext(code, sandbox, { filename: 'seed.js' });
  return sandbox.Seed && sandbox.Seed.SAMPLE_POSTS ? sandbox.Seed.SAMPLE_POSTS : [];
}

function loadPersonaSection() {
  const personaPath = path.join(ROOT, 'chatbase-training-source.md');
  if (fs.existsSync(personaPath)) {
    return fs.readFileSync(personaPath, 'utf8').trim();
  }
  return '# AutoLuxe Chatbot Training Source\n\n(Persona file not found.)';
}

function carToTrainingRecord(car) {
  return {
    type: 'catalog_car',
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    horsepower: car.horsepower,
    topSpeed: car.topSpeed,
    zeroToHundred: car.zeroToHundred,
    engine: car.engine,
    drivetrain: car.drivetrain,
    torque: car.torque,
    weight: car.weight,
    transmission: car.transmission,
    fuelType: car.fuelType,
    bodyType: car.bodyType,
    priceUSD: car.priceUSD,
    shortDescription: car.shortDescription || '',
    longDescription: car.longDescription || '',
    detailUrl: `/pages/car-detail.html?id=${car.id}`,
    aliases: car.aliases || []
  };
}

function postToTrainingRecord(post) {
  return {
    type: 'marketplace_listing',
    id: post.id,
    title: post.title,
    brand: post.brand,
    model: post.model,
    year: post.year,
    priceUSD: post.price,
    mileageKm: post.mileage,
    fuel: post.fuel,
    transmission: post.transmission,
    location: post.location,
    description: post.description,
    ownerName: post.ownerName,
    status: post.status || post.availability || 'available',
    moderation: post.moderation || 'approved',
    detailUrl: `/pages/market-detail.html?id=${post.id}`,
    createdAt: post.createdAt
  };
}

function carToMarkdown(car) {
  const lines = [
    `### ${car.make} ${car.model} (${car.year || 'N/A'})`,
    `- **ID:** \`${car.id}\``,
    `- **Mã lực:** ${car.horsepower || 'N/A'} hp`,
    `- **0-100:** ${car.zeroToHundred || 'N/A'}`,
    `- **Tốc độ tối đa:** ${car.topSpeed || 'N/A'}`,
    `- **Động cơ:** ${car.engine || 'N/A'}`,
    `- **Dẫn động:** ${car.drivetrain || 'N/A'}`,
    `- **Mô-men xoắn:** ${car.torque || 'N/A'}`,
    `- **Trọng lượng:** ${car.weight || 'N/A'}`,
    `- **Hộp số:** ${car.transmission || 'N/A'}`,
    `- **Nhiên liệu:** ${car.fuelType || 'N/A'}`,
    `- **Kiểu dáng:** ${car.bodyType || 'N/A'}`,
    `- **Giá MSRP tham khảo (catalog):** $${car.priceUSD ? Number(car.priceUSD).toLocaleString('en-US') : 'N/A'}`,
    `- **Mô tả ngắn:** ${car.shortDescription || 'Không có'}`,
    `- **URL:** /pages/car-detail.html?id=${car.id}`,
    ''
  ];
  return lines.join('\n');
}

function postToMarkdown(post) {
  const lines = [
    `### ${post.title}`,
    `- **ID:** \`${post.id}\``,
    `- **Hãng / Model:** ${post.brand} ${post.model} (${post.year})`,
    `- **Giá rao bán:** $${Number(post.price || 0).toLocaleString('en-US')}`,
    `- **ODO:** ${Number(post.mileage || 0).toLocaleString('en-US')} km`,
    `- **Nhiên liệu:** ${post.fuel} | **Hộp số:** ${post.transmission}`,
    `- **Khu vực:** ${post.location}`,
    `- **Người đăng:** ${post.ownerName}`,
    `- **Trạng thái:** ${post.status || post.availability || 'available'}`,
    `- **Mô tả:** ${post.description}`,
    `- **URL:** /pages/market-detail.html?id=${post.id}`,
    ''
  ];
  return lines.join('\n');
}

function buildDataNotesSection(postCount) {
  return [
    '## Phụ lục — Ghi chú nguồn dữ liệu',
    '',
    '### Catalog',
    '- **Thông số xe:** `assets/js/car-data.js` + `car-data-extended.js` + `car-data-specs-import.js`',
    '- **Danh sách hãng/model (API):** NHTSA vPIC qua `assets/js/api.js`',
    '- **Giá trong catalog (`priceUSD`):** MSRP tham khảo, **không** phải giá rao bán',
    '',
    '### Marketplace',
    `- **Tin mẫu:** \`assets/js/seed.js\` (${postCount} tin seed)`,
    '- **Runtime:** LocalStorage key `autoluxe_market_posts`',
    '- **Giá trong marketplace (`price`):** Giá người bán đăng, USD',
    '- Tin user mới đăng cần admin duyệt (`moderation: pending_approval`)',
    '- Tin chỉ hiển thị công khai khi `moderation=approved` và `status=available`',
    '',
    '### Câu hỏi AI nên phân biệt',
    '| Câu hỏi | Trả lời từ |',
    '|---------|------------|',
    '| "SF90 có bao nhiêu mã lực?" | Phần Catalog |',
    '| "Có ai bán Huracán không?" | Phần Marketplace |',
    '| "Giá SF90 bao nhiêu?" | Hỏi rõ: MSRP catalog hay giá tin rao? |',
    '',
    '### Refresh file training',
    '```bash',
    'node tools/export-ai-training-data.js',
    '```',
    ''
  ].join('\n');
}

function computeMarketplaceStats(posts) {
  const byBrand = {};
  const byLocation = {};
  let minPost = null;
  let maxPost = null;

  for (const p of posts) {
    const brand = p.brand || 'Khác';
    byBrand[brand] = (byBrand[brand] || 0) + 1;
    const loc = p.location || 'Chưa rõ';
    byLocation[loc] = (byLocation[loc] || 0) + 1;
    const price = Number(p.price) || 0;
    if (!minPost || price < Number(minPost.price)) minPost = p;
    if (!maxPost || price > Number(maxPost.price)) maxPost = p;
  }

  const prices = posts.map((p) => Number(p.price) || 0).filter((n) => n > 0);
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  return { byBrand, byLocation, minPost, maxPost, avgPrice, count: posts.length };
}

function buildMarketplaceKnowledgeSection(posts, generatedAt) {
  const stats = computeMarketplaceStats(posts);
  const brandRows = Object.keys(stats.byBrand)
    .sort()
    .map((b) => `| ${b} | ${stats.byBrand[b]} |`)
    .join('\n');

  const locationRows = Object.keys(stats.byLocation)
    .sort((a, b) => stats.byLocation[b] - stats.byLocation[a])
    .map((loc) => `| ${loc} | ${stats.byLocation[loc]} |`)
    .join('\n');

  const summaryRows = posts
    .slice()
    .sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    .map((p) => {
      return `| ${p.brand} ${p.model} | $${Number(p.price || 0).toLocaleString('en-US')} | ${Number(p.mileage || 0).toLocaleString('en-US')} km | ${p.location || '—'} | \`${p.id}\` |`;
    })
    .join('\n');

  return [
    '# Marketplace AutoLuxe — AI Training Source',
    '',
    `> Sinh tự động: ${generatedAt}`,
    `> ${stats.count} tin mẫu đang available trên Marketplace`,
  '',
    '---',
    '',
    '## 1) Tổng quan Marketplace',
    '',
    'AutoLuxe Marketplace là sàn mua bán siêu xe cộng đồng, chạy hoàn toàn trên frontend.',
    '- Dữ liệu tin lưu **LocalStorage** (`autoluxe_market_posts`) — mỗi trình duyệt có thể khác nhau.',
    '- Giá hiển thị bằng **USD**.',
    '- Checkout là **mô phỏng**, không thanh toán thật.',
    '- Tin user đăng mới cần **admin duyệt** trước khi hiện công khai.',
    '',
    '### Trang liên quan',
    '| Trang | URL | Mô tả |',
    '|-------|-----|-------|',
    '| Danh sách tin | `/pages/marketplace.html` | Tìm kiếm, lọc, sắp xếp tin rao |',
    '| Chi tiết tin | `/pages/market-detail.html?id=<post-id>` | Ảnh, mô tả, mua ngay, đánh giá |',
    '| Đăng/Sửa tin | `/pages/post-editor.html` | Tạo tin mới (cần đăng nhập) |',
    '| Sửa tin | `/pages/post-editor.html?id=<post-id>` | Chỉ chủ tin |',
    '| Checkout | `/pages/checkout.html?postId=<post-id>` | Đặt mua mô phỏng |',
    '| Tài khoản | `/pages/account.html#listings` | Quản lý tin đã đăng |',
    '| Admin duyệt | `/pages/admin.html` | Duyệt/từ chối tin chờ |',
    '| Từ Catalog | `/pages/marketplace.html?brand=X&model=Y` | Lọc nhanh theo hãng/model |',
    '',
    '---',
    '',
    '## 2) Tính năng hiện tại (để bot hướng dẫn user)',
    '',
    '### 2.1 Trang Marketplace (`marketplace.html`)',
    '- **Tìm kiếm:** theo tiêu đề, hãng, model (ô `marketSearch`)',
    '- **Lọc hãng:** Ferrari, Lamborghini, McLaren, Porsche, Bugatti, Aston Martin, Koenigsegg',
    '- **Sắp xếp:** Mới nhất | Giá tăng | Giá giảm',
    '- **Lọc giá:** Giá từ / Giá đến (USD)',
    '- **Lưu tìm kiếm:** nút "Lưu tìm kiếm" — cần đăng nhập; lưu vào Account → Cảnh báo đã lưu',
    '- **Đăng tin mới:** nút "+ Đăng tin mới" → `post-editor.html`',
    '- Chỉ hiển thị tin `moderation=approved` (tin chờ duyệt không hiện ở đây)',
    '',
    '### 2.2 Đăng tin (`post-editor.html`)',
    '**Bắt buộc đăng nhập.** Trường bắt buộc (*):',
    '- Tiêu đề, Hãng xe, Model, Năm SX (1990–năm hiện tại+1)',
    '- Giá USD (>0), Số km (≥0), Mô tả chi tiết',
    '',
    'Trường tùy chọn: Địa điểm, Nhiên liệu (Xăng/Dầu/Hybrid/Điện), Hộp số (Tự động/Số sàn/PDK/DCT)',
    '',
    '**Ảnh:** tối đa 8 ảnh, mỗi ảnh ≤800KB; ảnh đầu tiên là ảnh cover; hỗ trợ kéo-thả.',
    '',
    '**Sau khi đăng:** tin có `moderation: pending_approval` → chuyển Account, chờ admin.',
    '**Sau khi sửa tin đã duyệt:** tin quay lại `pending_approval`, cần duyệt lại.',
    '',
    '### 2.3 Chi tiết tin (`market-detail.html`)',
    '- Gallery ảnh (nhiều ảnh nếu có)',
    '- Thông số: hãng, model, năm, km, nhiên liệu, hộp số, khu vực, ngày đăng, lượt xem',
    '- **Mua ngay** → checkout (nếu tin available, user không phải chủ tin)',
    '- **Tư vấn / Liên hệ** → widget liên hệ hoặc mailto người bán',
    '- **Yêu thích** → thêm tin vào wishlist (cần đăng nhập)',
    '- **Đánh giá showroom:** 1–5 sao + bình luận (xem mục 2.5)',
    '',
    '**Nút Mua ngay KHÔNG hiện khi:**',
    '- Tin đang chờ duyệt hoặc bị từ chối',
    '- Tin đã bán (`status=sold`)',
    '- Tin đang chờ thanh toán (`status=pending`)',
    '- User là chủ tin (không tự mua tin của mình)',
    '',
    '### 2.4 Checkout mô phỏng (`checkout.html`)',
    'Flow: Marketplace → Chi tiết tin → **Mua ngay** → điền form (họ tên, SĐT, email, địa chỉ, PT thanh toán, ghi chú) → xác nhận.',
    '- Tạo đơn trong LocalStorage',
    '- Cập nhật trạng thái tin thành `pending_payment`',
    '- Gửi thông báo cho người bán',
    '- **Không có thanh toán thật**',
    '',
    '### 2.5 Đánh giá showroom',
    '- Lưu tại LocalStorage key `autoluxe_reviews`',
    '- **Phải đăng nhập** mới đánh giá được',
    '- **Chủ tin không được** tự đánh giá tin của mình',
    '- Điểm 1–5 sao + nội dung (tối đa 500 ký tự)',
    '- Sắp xếp: Mới nhất | Điểm cao',
  '',
    '### 2.6 Cảnh báo tìm kiếm đã lưu (`SavedSearchService`)',
    '- Lưu bộ lọc: hãng, từ khóa model, giá min/max',
    '- Xem tại Account → "Cảnh báo đã lưu"',
    '- Khi có tin mới khớp bộ lọc → thông báo push nội bộ',
    '',
    '### 2.7 Liên kết Catalog ↔ Marketplace',
    '- Trên catalog, badge hiển thị số tin rao khả dụng theo hãng/model',
    '- Link sang marketplace với `?brand=...&model=...`',
    '',
    '---',
    '',
    '## 3) Schema dữ liệu tin rao',
    '',
    '```json',
    JSON.stringify({
      id: 'post_abc123',
      ownerEmail: 'user@email.com',
      ownerName: 'Tên hiển thị',
      title: 'Tiêu đề tin',
      brand: 'Ferrari',
      model: '488 GTB',
      year: 2019,
      price: 280000,
      mileage: 12000,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'TP. Hồ Chí Minh',
      image: 'url ảnh cover',
      images: ['url1', 'url2'],
      description: 'Mô tả chi tiết',
      moderation: 'approved',
      moderationReason: '',
      availability: 'available',
      status: 'available',
      viewCount: 0,
      createdAt: '2025-04-10T08:00:00.000Z',
      updatedAt: '2025-04-10T08:00:00.000Z'
    }, null, 2),
    '```',
    '',
    '### Trạng thái moderation',
    '| Giá trị | Ý nghĩa |',
    '|---------|---------|',
    '| `approved` | Hiển thị công khai trên Marketplace |',
    '| `pending_approval` | Chờ admin duyệt |',
    '| `rejected` | Bị từ chối, không hiển thị |',
    '',
    '### Trạng thái availability / status',
    '| Giá trị | Ý nghĩa |',
    '|---------|---------|',
    '| `available` | Đang bán, có thể mua |',
    '| `pending_payment` / `pending` | Có người đặt mua, chờ xử lý |',
    '| `sold` | Đã bán |',
    '',
    '### LocalStorage keys',
    '| Key | Mô tả |',
    '|-----|--------|',
    '| `autoluxe_market_posts` | Tất cả tin rao |',
    '| `autoluxe_seed_version` | Version seed data |',
    '| `autoluxe_reviews` | Đánh giá showroom |',
    '| `autoluxe_post_images_draft` | Draft ảnh khi đăng tin |',
    '',
    '---',
    '',
    '## 4) Thống kê tin mẫu hiện tại',
    '',
    `| Chỉ số | Giá trị |`,
    `|--------|---------|`,
    `| Tổng tin seed | ${stats.count} |`,
    `| Giá trung bình | $${stats.avgPrice.toLocaleString('en-US')} |`,
    stats.minPost
      ? `| Rẻ nhất | ${stats.minPost.title} — $${Number(stats.minPost.price).toLocaleString('en-US')} (\`${stats.minPost.id}\`) |`
      : '',
    stats.maxPost
      ? `| Đắt nhất | ${stats.maxPost.title} — $${Number(stats.maxPost.price).toLocaleString('en-US')} (\`${stats.maxPost.id}\`) |`
      : '',
    '',
    '### Số tin theo hãng',
    '| Hãng | Số tin |',
    '|------|--------|',
    brandRows,
    '',
    '### Số tin theo khu vực',
    '| Khu vực | Số tin |',
    '|---------|--------|',
    locationRows,
    '',
    '### Bảng tóm tắt nhanh (giá tăng dần)',
    '| Xe | Giá | ODO | Khu vực | ID |',
    '|----|-----|-----|---------|-----|',
    summaryRows,
    '',
    '---',
    '',
    '## 5) FAQ Marketplace (training pairs)',
    '',
    '**Q: Làm sao tìm xe Ferrari trên Marketplace?**',
    'A: Vào `/pages/marketplace.html`, chọn hãng Ferrari ở bộ lọc hoặc gõ "Ferrari" vào ô tìm kiếm.',
    '',
    '**Q: Xe rẻ nhất trên Marketplace hiện tại là gì?**',
    stats.minPost
      ? `A: Theo tin mẫu: ${stats.minPost.title} giá $${Number(stats.minPost.price).toLocaleString('en-US')} — xem tại /pages/market-detail.html?id=${stats.minPost.id}`
      : 'A: Chưa có dữ liệu tin mẫu.',
    '',
    '**Q: Xe đắt nhất trên Marketplace?**',
    stats.maxPost
      ? `A: Theo tin mẫu: ${stats.maxPost.title} giá $${Number(stats.maxPost.price).toLocaleString('en-US')} — /pages/market-detail.html?id=${stats.maxPost.id}`
      : 'A: Chưa có dữ liệu tin mẫu.',
    '',
    '**Q: Có bao nhiêu tin Lamborghini đang bán?**',
    `A: Trong dữ liệu mẫu có ${stats.byBrand.Lamborghini || 0} tin Lamborghini. Trên trình duyệt thực tế số lượng có thể khác do LocalStorage.`,
    '',
    '**Q: Tôi đăng tin xong sao không thấy trên Marketplace?**',
    'A: Tin mới cần admin duyệt (`pending_approval`). Kiểm tra tại Account → Tin đã đăng. Sau khi được duyệt mới hiện công khai.',
    '',
    '**Q: Sửa tin đã duyệt có mất tin không?**',
    'A: Tin tạm ẩn khỏi Marketplace và chuyển lại chờ duyệt cho đến khi admin approve lại.',
    '',
    '**Q: Làm sao lưu tìm kiếm để nhận thông báo?**',
    'A: Đăng nhập → Marketplace → đặt bộ lọc (hãng, giá...) → bấm "Lưu tìm kiếm". Xem lại tại Account.',
    '',
    '**Q: Tôi có thể mua tin của chính mình không?**',
    'A: Không. Chủ tin không thấy nút Mua ngay trên tin của mình.',
    '',
    '**Q: Đánh giá showroom khác gì đánh giá sản phẩm?**',
    'A: Đây là đánh giá uy tín người bán/showroom trên từng tin rao, không phải review kỹ thuật xe catalog.',
    '',
    '**Q: Giá trên Marketplace khác giá Catalog?**',
    'A: Có. Catalog là giá MSRP tham khảo; Marketplace là giá người bán đăng (có thể cao/thấp hơn tùy tình trạng xe).',
    '',
    '**Q: Từ trang chi tiết xe catalog sang marketplace thế nào?**',
    'A: Trên catalog có badge/link "X tin đang bán" hoặc mở `/pages/marketplace.html?brand=Hãng&model=Model`.',
    '',
    '**Q: Marketplace có hỗ trợ tiếng Anh không?**',
    'A: Có. Website hỗ trợ i18n vi/en qua header; bot trả lời theo ngôn ngữ user.',
    '',
    '**Q: Tôi muốn liên hệ người bán trước khi mua?**',
    'A: Trên trang chi tiết tin, bấm nút Tư vấn/Liên hệ (contact widget hoặc email người bán).',
    '',
    '---',
    '',
    '## 6) Policy cho bot khi trả lời Marketplace',
    '',
    'Bot **nên:**',
    '- Hướng dẫn đúng URL và từng bước thao tác',
    '- Trích dẫn giá/ODO/khu vực từ tin cụ thể khi có trong dữ liệu',
    '- Nhắc checkout là mô phỏng khi user hỏi mua',
    '- Nói rõ dữ liệu realtime có thể khác nếu user đã đăng tin trên máy khác',
    '',
    'Bot **không nên:**',
    '- Cam kết giao xe, giữ chỗ, hoặc thanh toán thật',
    '- Khẳng định chắc chắn tin còn available nếu không chắc trạng thái LocalStorage',
    '- Nhầm giá catalog (MSRP) với giá marketplace',
    '',
    '---',
    '',
    '## 7) Chi tiết từng tin rao (dữ liệu đầy đủ)',
    '',
    ...posts.map(postToMarkdown)
  ].join('\n');
}

function buildFullMarkdown(persona, rawCars, rawPosts, generatedAt) {
  const marketplaceKnowledge = buildMarketplaceKnowledgeSection(rawPosts, generatedAt);

  return [
    '# AutoLuxe — AI Training (Full Knowledge Base)',
    '',
    `> File tổng hợp duy nhất để upload lên Chatbase / RAG / AI assistant.`,
    `> Tự động sinh: ${generatedAt}`,
    `> Catalog: ${rawCars.length} xe | Marketplace: ${rawPosts.length} tin mẫu`,
    '',
    '---',
    '',
    '# PHẦN 1 — Persona, hướng dẫn website & FAQ',
    '',
    persona,
    '',
    '---',
    '',
    buildDataNotesSection(rawPosts.length),
    '---',
    '',
    '# PHẦN 2 — Catalog: Thông số xe (CAR_DATABASE)',
    '',
    'Dùng phần này khi người dùng hỏi về thông số kỹ thuật, so sánh xe, giá MSRP tham khảo.',
    '',
    ...rawCars.map(carToMarkdown),
    '---',
    '',
    '# PHẦN 3 — Marketplace (tính năng + FAQ + tin rao)',
    '',
    marketplaceKnowledge.replace(/^# Marketplace AutoLuxe — AI Training Source\n\n/, '')
  ].join('\n');
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const rawCars = loadCarDatabase();
  const rawPosts = loadMarketplaceSeed();
  const cars = rawCars.map(carToTrainingRecord);
  const listings = rawPosts.map(postToTrainingRecord);
  const persona = loadPersonaSection();

  fs.writeFileSync(
    path.join(OUT_DIR, 'catalog-cars.json'),
    JSON.stringify({ generatedAt, count: cars.length, items: cars }, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'marketplace-listings.json'),
    JSON.stringify({ generatedAt, count: listings.length, items: listings }, null, 2),
    'utf8'
  );

  const marketplaceMd = buildMarketplaceKnowledgeSection(rawPosts, generatedAt);
  const marketplaceMdPath = path.join(OUT_DIR, 'marketplace-ai-training.md');
  fs.writeFileSync(marketplaceMdPath, marketplaceMd, 'utf8');

  const fullMd = buildFullMarkdown(persona, rawCars, rawPosts, generatedAt);
  fs.writeFileSync(FULL_MD_PATH, fullMd, 'utf8');

  const fullStats = fs.statSync(FULL_MD_PATH);
  const marketStats = fs.statSync(marketplaceMdPath);

  console.log('Full training file:', FULL_MD_PATH);
  console.log('  Size:', Math.round(fullStats.size / 1024), 'KB');
  console.log('Marketplace training:', marketplaceMdPath);
  console.log('  Size:', Math.round(marketStats.size / 1024), 'KB');
  console.log('Catalog cars:', cars.length);
  console.log('Marketplace listings:', listings.length);
  console.log('JSON output:', OUT_DIR);
}

main();
