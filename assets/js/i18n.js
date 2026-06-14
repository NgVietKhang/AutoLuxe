/* =============================================
   I18N.JS - AutoLuxe Supercar Web
   Internationalization: VI/EN dictionary, locale management, runtime text swap
   Phase 12
   ============================================= */

var I18n = (function () {
  'use strict';

  var STORAGE_KEY = 'autoluxe_locale';
  var DEFAULT_LOCALE = 'vi';
  var SUPPORTED = ['vi', 'en'];
  var LOCALE_TAGS = {
    vi: 'vi-VN',
    en: 'en-US'
  };
  var USD_TO_VND_RATE = 25000;

  /* ===========================
     DICTIONARY
     =========================== */

  var dict = {
    vi: {
      /* ---------- common ---------- */
      'common.login': 'Đăng nhập',
      'common.logout': 'Đăng xuất',
      'common.register': 'Đăng ký',
      'common.submit': 'Gửi',
      'common.cancel': 'Hủy',
      'common.delete': 'Xóa',
      'common.edit': 'Sửa',
      'common.save': 'Lưu',
      'common.search': 'Tìm kiếm',
      'common.filter': 'Lọc',
      'common.sort': 'Sắp xếp',
      'common.all': 'Tất cả',
      'common.back': 'Quay lại',
      'common.view_detail': 'Xem chi tiết',
      'common.loading': 'Đang tải...',
      'common.processing': 'Đang xử lý...',
      'common.retry': 'Thử lại',
      'common.yes': 'Có',
      'common.no': 'Không',
      'common.updating': 'Đang cập nhật',
      'common.close': 'Đóng',
      'common.confirm': 'Xác nhận',
      'common.success': 'Thành công',
      'common.error': 'Lỗi',
      'common.warning': 'Cảnh báo',
      'common.info': 'Thông tin',
      'common.na': 'N/A',
      'common.countdown_clock': '{days}ng {hh}:{mm}:{ss}',

      /* ---------- nav ---------- */
      'nav.home': 'Trang chủ',
      'nav.catalog': 'Khám phá',
      'nav.brands': 'Thương hiệu',
      'nav.marketplace': 'Marketplace',
      'nav.wishlist': 'Wishlist',
      'nav.my_purchases': 'Đơn mua của tôi',
      'nav.compare': 'So sánh',
      'nav.inbox': 'Hộp thư',


      'contact.title': 'Tư vấn mua xe',
      'contact.fab_label': 'Tư vấn',
      'contact.hotline': 'Gọi hotline',
      'contact.zalo': 'Zalo',
      'contact.zalo_hint': 'Chat tư vấn nhanh',
      'contact.messenger': 'Messenger',
      'contact.messenger_hint': 'Nhắn Facebook',
      'contact.hours': 'Giờ tư vấn',
      'contact.seller_email': 'Email người bán',
      'contact.not_configured': 'Chưa cấu hình kênh liên hệ. Thêm trong config.local.js',
      'contact.consult_btn': 'Liên hệ tư vấn',

      'compare.title': 'So sánh xe',
      'compare.subtitle': 'Đang so sánh {count}/{max} mẫu',
      'compare.pool_subtitle': 'Đã đánh dấu {poolCount} xe — chọn tối đa {max} để so sánh',
      'compare.add': 'So sánh',
      'compare.in_list': 'Đã đánh dấu',
      'compare.added_toast': 'Đã thêm vào danh sách so sánh',
      'compare.removed_toast': 'Đã xóa khỏi danh sách so sánh',
      'compare.full': 'Chỉ có thể so sánh tối đa {max} xe',
      'compare.selection_full': 'Chỉ có thể chọn tối đa {max} xe để so sánh',
      'compare.duplicate': 'Xe đã có trong danh sách',
      'compare.add_failed': 'Không thể thêm xe',
      'compare.empty_title': 'Chưa có xe để so sánh',
      'compare.empty_desc': 'Đánh dấu xe từ Catalog hoặc trang chi tiết, sau đó vào đây chọn tối đa 3 xe để so sánh.',
      'compare.explore_catalog': 'Khám phá Catalog',
      'compare.clear_all': 'Xóa tất cả',
      'compare.deselect_all': 'Bỏ chọn tất cả',
      'compare.share_link': 'Sao chép link',
      'compare.link_copied': 'Đã sao chép link so sánh',
      'compare.cleared': 'Đã xóa danh sách so sánh',
      'compare.remove': 'Xóa',
      'compare.remove_from_compare': 'Bỏ khỏi so sánh',
      'compare.remove_from_pool': 'Xóa khỏi danh sách',
      'compare.select_hint': 'Chọn xe bên dưới để xem bảng so sánh',
      'compare.selected_count': '{count}/{max} đã chọn',
      'compare.picker_title': 'Chọn xe so sánh',
      'compare.results_title': 'Kết quả so sánh',
      'compare.spec_label': 'Thông số',
      'compare.row_price': 'Giá thấp nhất (Marketplace)',
      'compare.row_hp': 'Mã lực',
      'compare.row_accel': '0–100 km/h',
      'compare.row_speed': 'Tốc độ tối đa',
      'compare.row_engine': 'Động cơ',
      'compare.row_drivetrain': 'Dẫn động',
      'compare.price_none': 'Chưa có tin rao',

      'finance.title': 'Ước tính trả góp',
      'finance.disclaimer': 'Chỉ mang tính mô phỏng, không phải cam kết tài chính.',
      'finance.price': 'Giá xe',
      'finance.down_pct': 'Trả trước',
      'finance.term': 'Kỳ hạn',
      'finance.months': 'tháng',
      'finance.rate': 'Lãi suất (%/năm)',
      'finance.monthly': 'Trả mỗi tháng',
      'finance.total_interest': 'Tổng lãi',
      'finance.total_paid': 'Tổng thanh toán',

      'saved_search.save_btn': 'Lưu tìm kiếm',
      'saved_search.saved': 'Đã lưu cảnh báo tìm kiếm',
      'saved_search.login_required': 'Đăng nhập để lưu tìm kiếm',
      'saved_search.min_price': 'Giá từ',
      'saved_search.max_price': 'Giá đến',
      'saved_search.default_label': 'Tìm kiếm Marketplace',
      'saved_search.account_title': 'Cảnh báo đã lưu',
      'saved_search.empty': 'Chưa có cảnh báo nào.',

      'inbox.title': 'Hộp thư',
      'inbox.threads': 'Hội thoại',
      'inbox.empty': 'Chưa có tin nhắn.',
      'inbox.login_required': 'Đăng nhập để nhắn người bán',
      'inbox.message_seller': 'Nhắn người bán',
      'inbox.cannot_message': 'Không thể nhắn tin cho tin này',
      'inbox.placeholder': 'Nhập tin nhắn...',
      'inbox.send': 'Gửi',

      'seller.stats_line': '{views} lượt xem · {inquiries} liên hệ',
      'admin.stat_views': 'Tổng lượt xem',
      'admin.stat_orders': 'Đơn hàng',
      'admin.stat_inquiries': 'Liên hệ',
      'md.spec_views': 'Lượt xem',

      'notif.event_saved_search_title': 'Tin mới khớp tìm kiếm',
      'notif.event_saved_search_msg': 'Có tin "{postTitle}" khớp bộ lọc "{label}".',
      'notif.event_new_message_title': 'Tin nhắn mới',
      'notif.event_new_message_msg': '{preview}',

      'account.settings_motion_preset': 'Chế độ chuyển động',
      'account.settings_motion_preset_desc': 'Cinematic / Cân bằng / Tối giản',
      'account.settings_motion_cinematic': 'Cinematic',
      'account.settings_motion_balanced': 'Cân bằng',
      'account.settings_motion_minimal': 'Tối giản',

      /* ---------- footer ---------- */
      'footer.desc': 'Nền tảng khám phá và chia sẻ đam mê siêu xe hàng đầu. Kết nối cộng đồng yêu tốc độ và nghệ thuật ô tô.',
      'footer.explore': 'Khám phá',
      'footer.account': 'Tài khoản',
      'footer.post_ad': 'Đăng tin',
      'footer.copyright': '© 2024 AutoLuxe. All rights reserved.',

      /* ---------- home ---------- */
      'home.title': 'AutoLuxe - Siêu Xe Đẳng Cấp',
      'home.hero_title': 'Đỉnh Cao <span>Tốc Độ</span> &amp; Nghệ Thuật',
      'home.hero_title_highlight': 'Tốc Độ',
      'home.card_ferrari_desc': 'Hybrid supercar với 986 mã lực, tăng tốc 0-100km/h trong 2.5 giây.',
      'home.card_lambo_desc': 'V12 hybrid mạnh mẽ nhất lịch sử Lamborghini với 1015 mã lực.',
      'home.card_mclaren_desc': 'Siêu phẩm từ Woking với 750PS và trọng lượng siêu nhẹ.',
      'home.card_porsche_desc': 'Chiếc 911 thuần chất đường đua nhất với khí động học chủ động.',
      'home.card_bugatti_desc': '1500 mã lực, tốc độ tối đa 420km/h — đỉnh cao kỹ thuật ô tô.',
      'home.card_aston_desc': 'Hypercar với động cơ V12 Cosworth và khí động học F1 thuần túy.',
      'home.hero_subtitle': 'Khám phá bộ sưu tập siêu xe đẳng cấp nhất thế giới. Từ Ferrari đến Bugatti — trải nghiệm sức mạnh và vẻ đẹp cơ khí hoàn hảo.',
      'home.explore_catalog': 'Khám phá Catalog',
      'home.view_brands': 'Xem hãng xe',
      'home.featured_title': 'Siêu Xe Nổi Bật',
      'home.featured_subtitle': 'Những mẫu xe được yêu thích nhất tại AutoLuxe.',
      'home.card_bolide_desc': 'Track-only hypercar W16 1.850 mã lực, thiết kế đường đua cực hạn.',
      'home.card_tourbillon_desc': 'Kỷ nguyên V16 hybrid 1.800 mã lực — di sản Bugatti thế hệ mới.',
      'home.card_venevo_desc': 'V12 hybrid 1.015 mã lực — sức mạnh và thiết kế tương lai.',
      'home.card_ferzor_desc': 'Twin-turbo V8 hybrid 920 mã lực, tăng tốc và khí động học đỉnh cao.',
      'home.card_gt3_desc': 'Flat-6 NA 510 mã lực — cảm giác lái thuần khiết của Porsche.',
      'home.card_gt3rs_desc': 'Flat-6 NA 525 mã lực, khí động học track-focused đỉnh cao.',
      'home.brand_strip_title': 'Thương Hiệu Huyền Thoại',
      'home.brand_strip_subtitle': 'Khám phá những nhà sản xuất siêu xe hàng đầu thế giới.',
      'home.card_detail': 'Chi tiết',
      'home.hero_eyebrow': 'Bộ sưu tập siêu xe đẳng cấp thế giới',
      'home.scroll_cue': 'Cuộn xuống để khám phá',
      'home.speedo_hint': 'Giữ chuột trái để tăng tốc · chuột phải để giảm',
      'home.back_to_top': 'Lên đầu trang',
      'home.stats_cars': 'Siêu xe tuyển chọn',
      'home.stats_brands': 'Thương hiệu huyền thoại',
      'home.stats_members': 'Thành viên đam mê',
      'home.stats_satisfaction': 'Khách hàng hài lòng',
      'home.why_title': 'Vì Sao Chọn AutoLuxe',
      'home.why_subtitle': 'Trải nghiệm mua bán siêu xe minh bạch, an toàn và đẳng cấp.',
      'home.why_card1_title': 'Tuyển chọn khắt khe',
      'home.why_card1_desc': 'Mỗi mẫu xe đều được sàng lọc kỹ về tình trạng, lịch sử và giấy tờ.',
      'home.why_card2_title': 'Bảo chứng chính hãng',
      'home.why_card2_desc': 'Tin đăng được kiểm duyệt, đảm bảo nguồn gốc và thông tin minh bạch.',
      'home.why_card3_title': 'Cộng đồng đam mê',
      'home.why_card3_desc': 'Kết nối hàng nghìn tín đồ tốc độ, chia sẻ kinh nghiệm và đánh giá thật.',
      'home.why_card4_title': 'Hỗ trợ tận tâm 24/7',
      'home.why_card4_desc': 'Đội ngũ luôn sẵn sàng đồng hành từ lúc tìm xe đến khi bàn giao.',
      'home.testimonials_title': 'Khách Hàng Nói Gì',
      'home.testimonials_subtitle': 'Niềm tin từ cộng đồng yêu siêu xe trên khắp cả nước.',
      'home.tm1_quote': '"Quy trình minh bạch, đội ngũ tư vấn cực kỳ am hiểu. Tôi tậu được chiếc 911 trong mơ chỉ sau một tuần."',
      'home.tm1_name': 'Minh Hoàng',
      'home.tm1_role': 'Doanh nhân, TP.HCM',
      'home.tm2_quote': '"Hình ảnh và thông số chính xác đến từng chi tiết. Trải nghiệm mua xe trực tuyến tốt nhất tôi từng có."',
      'home.tm2_name': 'Tuấn Anh',
      'home.tm2_role': 'Nhà sưu tầm, Hà Nội',
      'home.tm3_quote': '"Đăng tin bán xe được duyệt nhanh, tiếp cận đúng người mua. Bán chiếc Lamborghini chỉ trong vài ngày."',
      'home.tm3_name': 'Phương Linh',
      'home.tm3_role': 'Người bán, Đà Nẵng',
      'home.cta_title': 'Sẵn Sàng Cầm Lái Giấc Mơ?',
      'home.cta_subtitle': 'Khám phá ngay bộ sưu tập siêu xe và tìm chiếc xe định mệnh của bạn.',
      'home.cta_button': 'Khám phá ngay',
      'home.cta_sell': 'Đăng bán xe',

      /* ---------- catalog ---------- */
      'catalog.title': 'Catalog Siêu Xe',
      'catalog.subtitle': 'Chọn thương hiệu hoặc hãng xe để xem model từ NHTSA vPIC — ảnh và thông số từ AutoLuxe Database.',
      'catalog.chip_database': 'AutoLuxe Database',
      'catalog.chip_nhtsa': 'NHTSA vPIC',
      'catalog.filter_make': 'Hãng xe',
      'catalog.search_model': 'Tìm model',
      'catalog.search_placeholder': 'Nhập tên model...',
      'catalog.select_make': '-- Chọn hãng xe --',
      'catalog.loading_makes': 'Đang tải...',
      'catalog.results_count': 'Tìm thấy <strong>{count}</strong> model',
      'catalog.featured_eyebrow': 'Gợi ý',
      'catalog.featured_title': 'Xe tiêu biểu',
      'catalog.featured_subtitle': 'Chọn hãng ở trên để xem toàn bộ model của hãng đó.',
      'catalog.featured_results_count': '<strong>{count}</strong> mẫu nổi bật',
      'catalog.state_empty_year': 'Không có mẫu tiêu biểu cho năm {year}.',
      'catalog.view_detail': 'Xem chi tiết',
      'catalog.market_available_count': 'Đang có {count} xe rao bán',
      'catalog.market_available_none': 'Hiện chưa có xe rao bán cho model này',
      'catalog.market_view_available': 'Xem xe đang bán',
      'catalog.market_none_cta': 'Chưa có xe đang bán',
      'catalog.state_loading_title': 'Đang tải...',
      'catalog.state_loading_makes': 'Đang tải danh sách hãng xe...',
      'catalog.state_loading_models': 'Đang tải model của {make}...',
      'catalog.state_error_title': 'Đã xảy ra lỗi',
      'catalog.state_empty_title': 'Không có kết quả',
      'catalog.state_empty_no_model': 'Không tìm thấy model nào cho hãng này.',
      'catalog.state_empty_keyword': 'Không có model nào phù hợp với từ khóa "{keyword}".',
      'catalog.state_empty_nodata': 'Không có dữ liệu.',
      'catalog.state_guide_title': 'Chào mừng đến Catalog',
      'catalog.state_guide_desc': 'Hãy chọn một hãng xe để xem danh sách model.',
      'catalog.hero_eyebrow': 'Bộ sưu tập model toàn cầu',
      'catalog.year_label': 'Năm',
      'catalog.year_all': 'Tất cả năm',
      'catalog.sort_label': 'Sắp xếp',
      'catalog.sort_az': 'Tên A → Z',
      'catalog.sort_za': 'Tên Z → A',
      'catalog.sort_available': 'Ưu tiên có xe bán',
      'catalog.view_label': 'Hiển thị',
      'catalog.view_grid': 'Dạng lưới',
      'catalog.view_list': 'Dạng danh sách',
      'catalog.quickview': 'Xem nhanh',
      'catalog.quickview_loading': 'Đang tải thông tin chi tiết...',
      'catalog.quickview_specs': 'Thông số kỹ thuật',
      'catalog.quickview_desc': 'Giới thiệu',
      'catalog.quickview_wiki_empty': 'Thông tin mô tả đang được cập nhật cho mẫu xe này.',
      'catalog.quickview_source_wiki': 'Nguồn',
      'catalog.pagination_prev': '‹ Trước',
      'catalog.pagination_next': 'Sau ›',

      /* ---------- detail ---------- */
      'detail.title': 'Chi Tiết Xe - AutoLuxe',
      'detail.fallback_title': 'Xe đang cập nhật',
      'detail.fallback_info': 'Thông tin đang được cập nhật, vui lòng quay lại sau.',
      'detail.data_pending': 'Dữ liệu đang bổ sung',
      'detail.specs_title': 'Thông Số Kỹ Thuật',
      'detail.desc_title': 'Mô Tả',
      'detail.desc_updating': 'Thông tin mô tả đang được cập nhật.',
      'detail.related_title': 'Xe Liên Quan',
      'detail.back_prev': 'Quay lại',
      'detail.back_catalog': 'Quay lại Catalog',
      'detail.view_marketplace': 'Xem Marketplace',
      'detail.view_marketplace_count': 'Xem {count} xe đang bán',
      'detail.view_marketplace_none': 'Chưa có xe đang bán',
      'detail.market_available_count': 'Có {count} tin rao phù hợp trên Marketplace',
      'detail.market_available_none': 'Hiện chưa có tin rao phù hợp trên Marketplace',
      'detail.market_none_hint': 'Khi có người đăng bán đúng dòng xe này, nút Marketplace sẽ tự mở.',
      'detail.notfound_title': 'Không tìm thấy xe',
      'detail.notfound_desc': 'Xe bạn đang tìm không tồn tại trong hệ thống hoặc đường dẫn không hợp lệ.',
      'detail.spec_power': 'Công suất',
      'detail.spec_topspeed': 'Tốc độ tối đa',
      'detail.spec_accel': '0-100 km/h',
      'detail.spec_engine': 'Động cơ',
      'detail.spec_drivetrain': 'Hệ dẫn động',
      'detail.spec_year': 'Năm sản xuất',

      /* ---------- brands ---------- */
      'brands.title': 'Thương Hiệu Siêu Xe',
      'brands.subtitle': 'Tìm hiểu về những nhà sản xuất siêu xe danh tiếng nhất hành tinh.',
      'brands.featured_label': 'Mẫu tiêu biểu:',
      'brands.view_all': 'Xem tất cả xe',
      'brands.established': 'Thành lập',
      'brands.ferrari_origin': 'Italy &bull; Thành lập 1947',
      'brands.lamborghini_origin': 'Italy &bull; Thành lập 1963',
      'brands.mclaren_origin': 'United Kingdom &bull; Thành lập 1963',
      'brands.porsche_origin': 'Germany &bull; Thành lập 1931',
      'brands.bugatti_origin': 'France &bull; Thành lập 1909',
      'brands.koenigsegg_origin': 'Sweden &bull; Thành lập 1994',
      'brands.aston_martin_origin': 'United Kingdom &bull; Thành lập 1913',
      'brands.ferrari_desc': 'Biểu tượng của tốc độ và đam mê từ nước Ý. Ferrari không chỉ là xe, mà là một giấc mơ trên bốn bánh với lịch sử lẫy lừng tại Formula 1 và hơn 200 chiến thắng Grand Prix.',
      'brands.lamborghini_desc': 'Nổi tiếng với thiết kế góc cạnh táo bạo và âm thanh động cơ không thể nhầm lẫn. Lamborghini luôn phá vỡ mọi giới hạn của kỹ thuật ô tô và thẩm mỹ thiết kế.',
      'brands.mclaren_desc': 'Từ đường đua F1 đến đường phố, McLaren mang DNA racing thuần túy vào từng mẫu xe với công nghệ vật liệu nhẹ đột phá và hiệu suất khí động học vượt trội.',
      'brands.porsche_desc': 'Sự hoàn hảo của kỹ thuật Đức. Porsche kết hợp tính thực dụng hàng ngày với hiệu suất đường đua đỉnh cao, cùng truyền thống hơn 19.000 chiến thắng motorsport.',
      'brands.bugatti_desc': 'Đỉnh cao của tốc độ và xa xỉ. Mỗi chiếc Bugatti là một tác phẩm nghệ thuật cơ khí với sức mạnh vượt trội mọi giới hạn, nơi khoa học kỹ thuật gặp gỡ nghệ thuật chế tác.',
      'brands.koenigsegg_desc': 'Nhà sản xuất megacar Thụy Điển với triết lý đổi mới không ngừng. Koenigsegg liên tục phá vỡ kỷ lục tốc độ thế giới bằng công nghệ tự phát triển 100%.',
      'brands.aston_martin_desc': 'Sự thanh lịch của quý ông Anh Quốc. Aston Martin kết hợp vẻ đẹp cổ điển với hiệu suất thể thao đầy mê hoặc, biểu tượng của James Bond và phong cách sống xa hoa.',

      /* ---------- data values ---------- */
      'data.fuel_gasoline': 'Xăng',
      'data.fuel_diesel': 'Dầu',
      'data.fuel_hybrid': 'Hybrid',
      'data.fuel_electric': 'Điện',
      'data.trans_auto': 'Tự động',
      'data.trans_manual': 'Số sàn',
      'data.trans_pdk': 'PDK',
      'data.trans_dct': 'DCT',

      /* ---------- marketplace ---------- */
      'market.title': 'Marketplace',
      'market.subtitle': 'Mua bán siêu xe từ cộng đồng AutoLuxe.',
      'market.post_new': '+ Đăng tin mới',
      'market.search_label': 'Tìm kiếm',
      'market.search_placeholder': 'Tìm theo tên xe, hãng, model...',
      'market.brand_label': 'Hãng xe',
      'market.sort_label': 'Sắp xếp',
      'market.sort_newest': 'Mới nhất',
      'market.sort_price_asc': 'Giá tăng',
      'market.sort_price_desc': 'Giá giảm',
      'market.prefill_applied': 'Đang lọc theo {brand} {model}.',
      'market.empty_title': 'Chưa có tin rao nào',
      'market.empty_desc': 'Hãy là người đầu tiên đăng tin bán siêu xe trên AutoLuxe!',
      'market.view_car': 'Xem xe',
      'market.delete_confirm_title': 'Xóa tin rao',
      'market.delete_confirm': 'Bạn có chắc muốn xóa tin "{title}"?',
      'market.delete_success': 'Đã xóa tin thành công!',
      'market.delete_fail': 'Xóa tin thất bại. Vui lòng thử lại.',
      'market.delete_login': 'Bạn cần đăng nhập để xóa tin.',
      'market.delete_notfound': 'Tin rao không tồn tại.',
      'market.delete_noperm': 'Bạn không có quyền xóa tin này.',
      'market.created_toast': 'Đăng tin thành công!',
      'market.updated_toast': 'Cập nhật tin thành công!',
      'market.anonymous': 'Ẩn danh',

      /* ---------- market detail ---------- */
      'md.notfound_title': 'Không tìm thấy tin rao',
      'md.notfound_desc': 'Tin rao này không tồn tại hoặc đã bị xóa.',
      'md.back': '← Quay lại Marketplace',
      'md.desc_title': 'Mô tả chi tiết',
      'md.no_desc': 'Chưa có mô tả.',
      'md.no_contact': 'Không có thông tin liên hệ',
      'md.pending_status': '⏳ Đang chờ xử lý - Không khả dụng',
      'md.sold_status': 'Đã bán — không thể mua',
      'md.owner_cannot_buy': 'Bạn là người đăng tin — không thể tự mua xe này',
      'md.not_available_title': 'Tin chưa công khai',
      'md.not_available_pending': 'Tin đang chờ admin duyệt hoặc chưa được phép hiển thị.',
      'md.not_available_rejected': 'Tin đã bị từ chối và không hiển thị trên Marketplace.',
      'md.buy_now': '🛒 Mua ngay',
      'md.spec_brand': 'Hãng xe',
      'md.spec_model': 'Model',
      'md.spec_year': 'Năm SX',
      'md.spec_mileage': 'Số km',
      'md.spec_fuel': 'Nhiên liệu',
      'md.spec_transmission': 'Hộp số',
      'md.spec_location': 'Khu vực',
      'md.spec_date': 'Ngày đăng',
      'md.spec_updating': 'Đang cập nhật',

      /* ---------- reviews ---------- */
      'review.title': 'Đánh giá showroom',
      'review.read_all': 'Đọc tất cả',
      'review.sort_label': 'Sắp xếp:',
      'review.sort_newest': 'Mới nhất',
      'review.sort_highest': 'Điểm cao',
      'review.empty_text': 'Chưa có đánh giá nào cho tin này. Hãy là người đầu tiên!',
      'review.form_title': 'Viết đánh giá',
      'review.login_notice': 'Bạn cần <a href="./auth.html">đăng nhập</a> để gửi đánh giá.',
      'review.owner_notice': 'Bạn không thể tự đánh giá tin rao của chính mình.',
      'review.star_label': 'Đánh giá sao',
      'review.star_placeholder': 'Chọn số sao',
      'review.content_label': 'Nội dung đánh giá',
      'review.content_placeholder': 'Chia sẻ trải nghiệm của bạn...',
      'review.submit': 'Gửi đánh giá',
      'review.count': '{count} lượt đánh giá',
      'review.no_perm': 'Bạn không có quyền đánh giá tin này.',
      'review.select_star': 'Vui lòng chọn số sao đánh giá (1-5).',
      'review.enter_content': 'Vui lòng nhập nội dung đánh giá.',
      'review.max_length': 'Nội dung đánh giá tối đa {max} ký tự.',
      'review.success': 'Đánh giá đã được gửi thành công!',
      'review.fail': 'Gửi đánh giá thất bại. Vui lòng thử lại.',
      'review.star_1': 'Rất tệ',
      'review.star_2': 'Tệ',
      'review.star_3': 'Bình thường',
      'review.star_4': 'Tốt',
      'review.star_5': 'Xuất sắc',

      /* ---------- post-editor ---------- */
      'editor.title_create': 'Đăng Tin Rao Bán',
      'editor.title_edit': 'Chỉnh Sửa Tin Rao',
      'editor.subtitle': 'Điền thông tin xe bạn muốn rao bán trên AutoLuxe Marketplace.',
      'editor.login_warning': 'Bạn cần <a href="./auth.html">đăng nhập</a> để đăng tin rao bán.',
      'editor.post_title': 'Tiêu đề tin *',
      'editor.post_title_ph': 'VD: Ferrari 488 GTB 2019 - Xe đẹp, đi ít',
      'editor.post_brand': 'Hãng xe *',
      'editor.post_brand_ph': 'Chọn hãng xe',
      'editor.post_brand_other': 'Khác',
      'editor.post_model': 'Model *',
      'editor.post_model_ph': 'VD: 488 GTB, Huracán EVO...',
      'editor.post_year': 'Năm sản xuất *',
      'editor.post_price': 'Giá (USD) *',
      'editor.post_mileage': 'Số km đã đi *',
      'editor.post_location': 'Địa điểm',
      'editor.post_location_ph': 'VD: TP.HCM, Hà Nội...',
      'editor.post_fuel': 'Nhiên liệu',
      'editor.post_fuel_ph': 'Chọn',
      'editor.fuel_gasoline': 'Xăng',
      'editor.fuel_diesel': 'Dầu',
      'editor.fuel_hybrid': 'Hybrid',
      'editor.fuel_electric': 'Điện',
      'editor.post_transmission': 'Hộp số',
      'editor.post_transmission_ph': 'Chọn',
      'editor.trans_auto': 'Tự động',
      'editor.trans_manual': 'Số sàn',
      'editor.post_desc': 'Mô tả chi tiết *',
      'editor.post_desc_ph': 'Mô tả tình trạng xe, lịch sử bảo dưỡng, trang bị thêm...',
      'editor.post_images': 'Hình ảnh xe',
      'editor.post_images_upload': 'Chọn ảnh',
      'editor.post_images_hint': 'PNG, JPG, WEBP, GIF — tối đa 8 ảnh, mỗi ảnh 800KB. Lưu tạm trên trình duyệt.',
      'editor.post_images_cover': 'Ảnh bìa',
      'editor.post_images_remove': 'Xóa ảnh',
      'editor.post_image_too_large': 'Ảnh vượt quá 800KB. Vui lòng chọn ảnh nhỏ hơn.',
      'editor.post_image_invalid': 'Không đọc được ảnh. Vui lòng chọn file ảnh hợp lệ.',
      'editor.post_images_max': 'Tối đa {max} ảnh cho mỗi tin.',
      'editor.post_images_quota': 'Không đủ dung lượng lưu trữ. Hãy xóa bớt ảnh hoặc chọn ảnh nhỏ hơn.',
      'editor.btn_post': 'Đăng tin',
      'editor.btn_update': 'Cập nhật tin',
      'editor.post_notfound': 'Tin rao không tồn tại.',
      'editor.no_edit_perm': 'Bạn không có quyền sửa tin này.',
      'editor.update_fail': 'Cập nhật thất bại. Vui lòng thử lại.',
      'editor.post_fail': 'Đăng tin thất bại. Vui lòng thử lại.',
      'editor.submitted_pending': 'Tin đã gửi và đang chờ admin duyệt.',
      'editor.new_pending_hint': 'Tin mới sẽ ở trạng thái chờ duyệt và chưa hiển thị công khai trên Marketplace.',
      'editor.resubmit_hint': 'Chỉnh sửa và lưu lại để gửi duyệt lại.',
      'editor.edit_reapproval_hint': 'Tin đang hiển thị. Mọi thay đổi sau khi lưu sẽ gửi lại admin duyệt trước khi public.',
      'editor.resubmitted_pending': 'Đã cập nhật tin và gửi lại chờ admin duyệt.',

      /* ---------- auth ---------- */
      'auth.page_title': 'Đăng Nhập - AutoLuxe',
      'auth.title': 'Tài Khoản',
      'auth.subtitle': 'Đăng nhập hoặc tạo tài khoản mới để sử dụng đầy đủ tính năng AutoLuxe.',
      'auth.logged_in_msg': 'Bạn đã đăng nhập với tên',
      'auth.tab_login': 'Đăng nhập',
      'auth.tab_register': 'Đăng ký',
      'auth.email_label': 'Email *',
      'auth.email_ph': 'you@example.com',
      'auth.password_label': 'Mật khẩu *',
      'auth.password_ph': 'Nhập mật khẩu...',
      'auth.login_btn': 'Đăng nhập',
      'auth.name_label': 'Tên hiển thị *',
      'auth.name_ph': 'Tên của bạn (ít nhất 2 ký tự)',
      'auth.confirm_label': 'Xác nhận mật khẩu *',
      'auth.confirm_ph': 'Nhập lại mật khẩu',
      'auth.min_6_chars': 'Tối thiểu 6 ký tự',
      'auth.register_btn': 'Tạo tài khoản',
      'auth.login_success': 'Đăng nhập thành công! Đang chuyển hướng...',
      'auth.register_success': 'Đăng ký thành công! Đang chuyển hướng...',
      'auth.greeting': 'Xin chào, ',

      /* ---------- checkout ---------- */
      'checkout.page_title': 'Thanh toán - AutoLuxe',
      'checkout.title': 'Thanh toán đơn hàng',
      'checkout.subtitle': 'Xác nhận thông tin mua xe và hoàn tất đặt hàng',
      'checkout.back': '← Quay lại chi tiết tin',
      'checkout.car_info': 'Thông tin xe',
      'checkout.buyer_info': 'Thông tin người mua',
      'checkout.fullname': 'Họ tên',
      'checkout.phone': 'Số điện thoại',
      'checkout.email': 'Email',
      'checkout.address': 'Địa chỉ nhận xe/chứng từ',
      'checkout.payment': 'Phương thức thanh toán',
      'checkout.payment_ph': '-- Chọn phương thức --',
      'checkout.payment_bank': 'Chuyển khoản ngân hàng',
      'checkout.payment_cash': 'Thanh toán tiền mặt khi nhận xe',
      'checkout.payment_installment': 'Trả góp qua ngân hàng',
      'checkout.payment_crypto': 'Thanh toán qua ví điện tử',
      'checkout.note': 'Ghi chú (tùy chọn)',
      'checkout.note_ph': 'Ghi chú thêm cho đơn hàng...',
      'checkout.submit': '🛒 Đặt mua',
      'checkout.success_title': 'Thanh toán thành công!',
      'checkout.success_desc': 'Đơn hàng <strong>{orderId}</strong> đã được tạo. Chúng tôi sẽ liên hệ bạn sớm nhất.',
      'checkout.view_post': 'Xem lại tin',
      'checkout.err_no_post_id': 'Thiếu thông tin tin rao',
      'checkout.err_no_post_id_desc': 'Không tìm thấy mã tin rao trong URL. Vui lòng quay lại marketplace và chọn xe cần mua.',
      'checkout.err_not_found': 'Tin rao không tồn tại',
      'checkout.err_not_found_desc': 'Tin rao bạn đang cố mua không tồn tại hoặc đã bị xóa.',
      'checkout.err_pending': 'Tin rao không khả dụng',
      'checkout.err_pending_desc': 'Tin rao này đang trong trạng thái chờ xử lý và không thể đặt mua.',
      'checkout.err_post_gone': 'Tin rao không còn tồn tại.',
      'checkout.err_already_pending': 'Tin rao này đã được đặt mua bởi người khác.',
      'checkout.err_update_post': 'Không thể cập nhật trạng thái tin. Vui lòng thử lại.',
      'checkout.err_save_order': 'Không thể lưu đơn hàng. Vui lòng thử lại.',
      'checkout.address_ph': 'Số nhà, đường, quận/huyện, tỉnh/TP',
      'checkout.fullname_ph': 'Nguyễn Văn A',
      'checkout.step_buyer': 'Bước 1 - Thông tin người mua',
      'checkout.step_buyer_desc': 'Nhập thông tin nhận xe/chứng từ',
      'checkout.step_payment': 'Bước 2 - Thanh toán demo',
      'checkout.step_payment_desc': 'Xác thực thẻ và mô phỏng gateway',
      'checkout.continue_to_payment': 'Tiếp tục đến bước thanh toán',
      'checkout.back_to_buyer': 'Quay lại bước 1',
      'checkout.pay_now': 'Thanh toán ngay (Demo)',
      'checkout.payment_demo_title': 'Thanh toán thẻ mô phỏng',
      'checkout.payment_demo_desc': 'Hỗ trợ Visa/Master/JCB/Amex. Đây là gateway mô phỏng để test luồng.',
      'checkout.card_type': 'Loại thẻ',
      'checkout.card_type_ph': '-- Chọn loại thẻ --',
      'checkout.card_visa': 'Visa',
      'checkout.card_mastercard': 'Mastercard',
      'checkout.card_jcb': 'JCB',
      'checkout.card_amex': 'American Express',
      'checkout.card_holder': 'Tên chủ thẻ',
      'checkout.card_holder_ph': 'NGUYEN VAN A',
      'checkout.card_number': 'Số thẻ',
      'checkout.card_number_ph': '4111 1111 1111 1111',
      'checkout.card_expiry': 'Ngày hết hạn',
      'checkout.buyer_preview_title': 'Xác nhận nhanh thông tin người mua',
      'checkout.guest_local_only_title': 'Mua không đăng nhập — chỉ lưu trên thiết bị này',
      'checkout.guest_local_only_desc': 'Bạn chưa đăng nhập. Đơn hàng vẫn được tạo nhưng chỉ lưu localStorage trên trình duyệt này.',
      'checkout.success_guest_note': 'Đơn guest sẽ chỉ còn trên thiết bị này. Khi đăng nhập cùng trình duyệt, hệ thống sẽ tự merge đơn vào tài khoản.',
      'checkout.cancel_window_countdown': 'Bạn có thể hủy trong: {countdown}',
      'checkout.view_purchases': 'Xem đơn mua của tôi',
      'checkout.gateway_failed_title': 'Thanh toán mô phỏng thất bại',
      'checkout.gateway_failed_desc': 'Gateway demo tạm thời từ chối giao dịch. Bạn có thể thử lại.',
      'checkout.gateway_retry_hint': 'Thông tin thẻ vẫn được giữ nguyên để retry nhanh.',
      'checkout.retry_payment': 'Thử thanh toán lại',
      'checkout.gateway_debug_success': 'Debug: gateway đang force success qua query ?gateway=success',
      'checkout.gateway_debug_fail': 'Debug: gateway đang force fail qua query ?gateway=fail',
      'checkout.err_missing_buyer_step': 'Vui lòng hoàn thành bước 1 trước khi thanh toán.',
      'checkout.card_cvv': 'CVV',
      'checkout.card_expiry_ph': 'MM/YY',
      'checkout.card_cvv_ph': '***',
      'checkout.phone_ph': '0912345678',
      'checkout.email_ph': 'example@email.com',
      'checkout.processing_payment': 'Đang xử lý thanh toán...',
      'checkout.payment_success_toast': 'Thanh toán thành công! Đơn hàng đã được tạo.',
      'checkout.payment_failed_toast': 'Thanh toán thất bại. Vui lòng thử lại.',
      'checkout.guest_login_prompt': 'Đăng nhập để đồng bộ đơn hàng trên nhiều thiết bị.',
      'checkout.view_marketplace': 'Mở Marketplace',
      'checkout.success_status_note': 'Đơn hàng đang ở trạng thái đã xác nhận. Bạn có thể theo dõi và hủy trong 7 ngày tại My Purchases.',
      'checkout.pending_listing_note': 'Tin rao đã chuyển sang trạng thái chờ thanh toán trong khi đơn được xử lý.',
      'checkout.err_not_approved': 'Tin chưa được duyệt',
      'checkout.err_not_approved_desc': 'Tin rao này chưa được admin duyệt nên chưa thể đặt mua.',
      'checkout.err_owner_cannot_buy': 'Không thể mua tin của chính bạn',
      'checkout.err_owner_cannot_buy_desc': 'Bạn là người đăng tin rao này. Vui lòng dùng tài khoản khác hoặc liên hệ người mua thực tế.',

      /* ---------- my purchases ---------- */
      'purchases.page_title': 'Đơn mua của tôi - AutoLuxe',
      'purchases.title': 'Đơn mua của tôi',
      'purchases.subtitle': 'Theo dõi đơn hàng, hủy trong 7 ngày và nhận nhắc đánh giá khi đã giao.',
      'purchases.filter_label': 'Lọc trạng thái',
      'purchases.filter_all': 'Tất cả',
      'purchases.filter_confirmed': 'Đã xác nhận',
      'purchases.filter_pending': 'Đang xử lý',
      'purchases.filter_shipping': 'Đang giao',
      'purchases.filter_delivered': 'Đã giao',
      'purchases.filter_cancelled': 'Đã hủy',
      'purchases.status_new': 'Mới tạo',
      'purchases.status_confirmed': 'Đã xác nhận',
      'purchases.status_rejected': 'Bị từ chối',
      'purchases.status_pending': 'Đang xử lý',
      'purchases.status_shipping': 'Đang giao',
      'purchases.status_delivered': 'Đã giao',
      'purchases.status_cancelled': 'Đã hủy',
      'purchases.cancel_window_info': 'Bạn có thể hủy đơn trong vòng 7 ngày kể từ ngày đặt.',
      'purchases.cancel_countdown_prefix': 'Còn {time}',
      'purchases.cancel_expired': 'Đã quá hạn hủy đơn (7 ngày).',
      'purchases.review_reminder': 'Hãy đánh giá trải nghiệm mua xe của bạn!',
      'purchases.review_cta': 'Để lại đánh giá',
      'purchases.delivered_banner': 'Đơn hàng đã giao. Cảm ơn bạn đã mua xe tại AutoLuxe!',
      'purchases.cancel_unavailable_delivered': 'Đơn đã giao — không thể hủy.',
      'purchases.cancel_unavailable_cancelled': 'Đơn đã hủy trước đó.',
      'purchases.filter_rejected': 'Bị từ chối',
      'purchases.context_user': 'Đang hiển thị đơn hàng gắn với tài khoản đăng nhập.',
      'purchases.context_guest': 'Bạn đang ở chế độ guest. Đơn hàng chỉ có trên thiết bị/trình duyệt này.',
      'purchases.context_guest_empty': 'Bạn đang ở chế độ guest nhưng chưa có guestId để tải đơn cũ.',
      'purchases.empty_title': 'Chưa có đơn hàng nào',
      'purchases.empty_desc': 'Bạn chưa có đơn phù hợp bộ lọc hiện tại.',
      'purchases.browse_market': 'Mở Marketplace',
      'purchases.order_id': 'Mã đơn: {orderId}',
      'purchases.created_at': 'Tạo lúc: {date}',
      'purchases.cancel_window_label': 'Thời gian còn lại để hủy:',
      'purchases.countdown_closed': 'Đã quá hạn hủy',
      'purchases.view_listing': 'Xem tin rao',
      'purchases.cancel_order': 'Hủy đơn',
      'purchases.cancel_unavailable': 'Không thể hủy',
      'purchases.cancel_confirm': 'Bạn có chắc muốn hủy đơn {orderId}?',
      'purchases.cancel_not_found': 'Không tìm thấy đơn hàng.',
      'purchases.cancel_no_permission': 'Bạn không có quyền hủy đơn này.',
      'purchases.cancel_window_closed': 'Đơn đã quá 7 ngày nên không thể hủy.',
      'purchases.cancel_success': 'Đã hủy đơn thành công và trả tin rao về trạng thái available.',
      'purchases.cancel_success_listing_warn': 'Đã hủy đơn nhưng không tìm thấy tin rao để cập nhật lại trạng thái.',
      'purchases.auto_delivered_notice': 'Tự động cập nhật {count} đơn sang trạng thái delivered khi vào trang My Purchases.',
      'purchases.listing_unknown': 'Tin rao không xác định',
      'purchases.timeline_title': 'Lịch sử xử lý đơn',
      'purchases.timeline_admin_status': 'Admin cập nhật: {status}',
      'purchases.timeline_admin_note': 'Ghi chú: {note}',
      'purchases.timeline_payment_success': 'Thanh toán demo thành công',
      'purchases.timeline_cancelled': 'Bạn đã hủy đơn hàng',
      'purchases.timeline_auto_delivered': 'Hệ thống tự chuyển sang đã giao (quá 7 ngày)',
      'purchases.timeline_guest_merged': 'Đơn guest đã gộp vào tài khoản sau khi đăng nhập',

      /* ---------- account ---------- */
      'account.page_title': 'Tài khoản - AutoLuxe',
      'account.title': 'Tài Khoản',
      'account.subtitle': 'Quản lý hồ sơ cá nhân và tùy chọn ứng dụng.',
      'account.tab_profile': 'Hồ sơ',
      'account.tab_settings': 'Cài đặt',
      'account.display_name': 'Tên hiển thị',
      'account.email': 'Email',
      'account.phone': 'Số điện thoại',
      'account.phone_ph': '0912 345 678',
      'account.address': 'Địa chỉ',
      'account.address_ph': 'Số nhà, đường, quận/huyện, tỉnh/TP',
      'account.avatar': 'Ảnh đại diện',
      'account.avatar_upload': 'Tải ảnh lên',
      'account.avatar_change': 'Đổi ảnh',
      'account.avatar_remove': 'Xóa ảnh',
      'account.avatar_hint': 'PNG, JPG, WEBP, GIF tối đa 500KB. Lưu ngay vào trình duyệt.',
      'account.avatar_saved': 'Đã lưu ảnh đại diện.',
      'account.avatar_quota': 'Không đủ dung lượng lưu trữ. Hãy chọn ảnh nhỏ hơn.',
      'account.avatar_too_large': 'Ảnh vượt quá 500KB. Vui lòng chọn ảnh nhỏ hơn.',
      'account.avatar_invalid': 'Không đọc được ảnh. Vui lòng chọn file ảnh hợp lệ.',
      'account.save_profile': 'Lưu hồ sơ',
      'account.profile_saved': 'Đã lưu hồ sơ thành công!',
      'account.profile_save_fail': 'Lưu hồ sơ thất bại. Vui lòng thử lại.',
      'account.settings_placeholder': 'Giao diện và ngôn ngữ sẽ được cấu hình tại đây trong bản cập nhật tiếp theo.',
      'account.login_title': 'Chưa đăng nhập',
      'account.login_desc': 'Vui lòng đăng nhập để quản lý hồ sơ và cài đặt tài khoản.',
      'account.menu_open': 'Mở menu tài khoản',
      'account.menu_account': 'Tài khoản',
      'account.menu_purchases': 'Đơn mua của tôi',
      'account.password_section': 'Đổi mật khẩu',
      'account.password_section_hint': 'Nhập mật khẩu hiện tại để xác thực trước khi đặt mật khẩu mới.',
      'account.current_password': 'Mật khẩu hiện tại',
      'account.current_password_ph': 'Nhập mật khẩu hiện tại...',
      'account.new_password': 'Mật khẩu mới',
      'account.new_password_ph': 'Ít nhất 6 ký tự...',
      'account.confirm_password': 'Xác nhận mật khẩu mới',
      'account.confirm_password_ph': 'Nhập lại mật khẩu mới...',
      'account.change_password': 'Cập nhật mật khẩu',
      'account.password_changed': 'Đã đổi mật khẩu thành công!',
      'account.password_change_fail': 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
      'account.settings_intro': 'Tùy chỉnh giao diện, ngôn ngữ và hiệu ứng. Các tùy chọn này chỉ hiển thị tại đây khi bạn đã đăng nhập.',
      'account.settings_theme': 'Giao diện',
      'account.settings_theme_desc': 'Chuyển giữa chế độ sáng và tối.',
      'account.settings_language': 'Ngôn ngữ',
      'account.settings_language_desc': 'Chọn ngôn ngữ hiển thị cho toàn bộ ứng dụng.',
      'account.settings_hero_scroll': 'Hiệu ứng cuộn đầu trang',
      'account.settings_hero_scroll_desc': 'Bật để giữ hiệu ứng pin và xe 3D khi cuộn ở trang chủ. Tắt để cuộn bình thường (áp dụng sau khi tải lại trang chủ).',
      'account.settings_hero_scroll_label': 'Bật hiệu ứng cuộn hero',
      'account.settings_lite_fx': 'Giảm hiệu ứng',
      'account.settings_lite_fx_desc': 'Tắt tilt 3D trên thẻ, ripple nút và parallax nhẹ để giảm lag (áp dụng sau khi tải lại trang hiện tại).',
      'account.settings_lite_fx_label': 'Giảm hiệu ứng tương tác',
      'account.settings_motion_saved': 'Đã lưu cài đặt hiệu ứng.',
      'account.tab_listings': 'Tin rao của tôi',
      'account.listings_intro': 'Theo dõi trạng thái duyệt tin rao của bạn trên Marketplace.',
      'account.my_listings_empty': 'Bạn chưa đăng tin rao nào.',
      'account.listing_status': 'Trạng thái',
      'account.listing_pending': 'Chờ duyệt',
      'account.listing_approved': 'Đang hiển thị',
      'account.listing_rejected': 'Bị từ chối',
      'account.listing_reject_reason': 'Lý do: {reason}',
      'account.listing_reject_no_reason': 'Không có lý do chi tiết.',
      'account.menu_admin': 'Quản trị',

      /* ---------- admin ---------- */
      'admin.page_title': 'Quản trị - AutoLuxe',
      'admin.title': 'Bảng Quản Trị',
      'admin.subtitle': 'Duyệt tin rao và phản hồi đơn mua với ghi chú cho người dùng.',
      'admin.tab_posts': 'Duyệt tin rao',
      'admin.tab_orders': 'Quản lý đơn hàng',
      'admin.queue_title': 'Tin chờ duyệt',
      'admin.queue_empty': 'Không có tin rao nào chờ duyệt.',
      'admin.approve_btn': 'Duyệt',
      'admin.reject_btn': 'Từ chối',
      'admin.reject_reason_label': 'Lý do từ chối *',
      'admin.reject_reason_ph': 'Nhập lý do...',
      'admin.reject_confirm': 'Xác nhận từ chối tin rao này?',
      'admin.reject_confirm_btn': 'Xác nhận từ chối',
      'admin.reject_modal_title': 'Từ chối tin rao',
      'admin.approved_toast': 'Đã duyệt tin "{title}" thành công.',
      'admin.rejected_toast': 'Đã từ chối tin "{title}".',
      'admin.order_list_title': 'Danh sách đơn hàng',
      'admin.order_empty': 'Chưa có đơn hàng nào.',
      'admin.order_empty_active': 'Không có đơn đang xử lý (đã hủy được ẩn).',
      'admin.order_status_change': 'Đổi trạng thái',
      'admin.order_note_label': 'Ghi chú admin',
      'admin.order_note_ph': 'Thêm ghi chú cho đơn hàng...',
      'admin.order_save': 'Lưu cập nhật',
      'admin.order_updated': 'Đã cập nhật đơn hàng {orderId}.',
      'admin.order_status_new': 'Mới',
      'admin.order_status_confirmed': 'Đã xác nhận',
      'admin.order_status_rejected': 'Từ chối',
      'admin.order_status_shipping': 'Đang giao',
      'admin.order_status_delivered': 'Đã giao',
      'admin.order_timeline': 'Lịch sử xử lý',
      'admin.no_permission': 'Bạn không có quyền truy cập trang quản trị.',
      'admin.no_permission_desc': 'Chỉ tài khoản admin mới có thể vào khu vực này.',
      'admin.require_reason': 'Vui lòng nhập lý do từ chối.',
      'admin.update_fail': 'Không thể cập nhật. Vui lòng thử lại.',
      'admin.post_owner': 'Người đăng: {email}',
      'admin.post_submitted': 'Gửi lúc: {date}',
      'admin.order_buyer': 'Người mua: {email}',
      'admin.order_invalid_status': 'Trạng thái đơn không hợp lệ.',
      'admin.order_no_change': 'Không có thay đổi nào để lưu.',

      /* ---------- wishlist ---------- */
      'wishlist.title': 'Wishlist Của Bạn',
      'wishlist.subtitle': 'Những mẫu xe và tin rao bạn đã lưu yêu thích.',
      'wishlist.clear_all': 'Xóa toàn bộ',
      'wishlist.clear_confirm': 'Bạn có chắc muốn xóa toàn bộ Wishlist?',
      'wishlist.cleared': 'Đã xóa toàn bộ Wishlist.',
      'wishlist.removed': 'Đã xóa item khỏi Wishlist.',
      'wishlist.added': 'Đã thêm vào Wishlist!',
      'wishlist.removed_short': 'Đã xóa khỏi Wishlist.',
      'wishlist.login_required': 'Vui lòng đăng nhập để sử dụng Wishlist.',
      'wishlist.filter_type': 'Loại item',
      'wishlist.filter_brand': 'Hãng xe',
      'wishlist.empty_title': 'Wishlist trống',
      'wishlist.empty_desc': 'Bạn chưa lưu xe hay tin rao nào. Hãy khám phá và thêm vào Wishlist!',
      'wishlist.explore_catalog': 'Khám phá Catalog',
      'wishlist.view_marketplace': 'Xem Marketplace',
      'wishlist.login_title': 'Chưa đăng nhập',
      'wishlist.login_desc': 'Vui lòng đăng nhập để xem Wishlist cá nhân của bạn.',
      'wishlist.no_match': 'Không tìm thấy item phù hợp bộ lọc.',
      'wishlist.showing': 'Hiển thị <strong>{filtered}</strong> / {total} item',
      'wishlist.saved': 'Đã lưu: ',
      'wishlist.unavailable': 'Không còn khả dụng',
      'wishlist.item_deleted': 'Item đã bị xóa',
      'wishlist.no_title': 'Không có tiêu đề',
      'wishlist.wishlisted': '♥ Đã yêu thích',
      'wishlist.add_wishlist': '♡ Yêu thích',

      /* ---------- notifications ---------- */
      'notif.title': 'Thông báo',
      'notif.read_all': 'Đọc tất cả',
      'notif.login_to_view': 'Đăng nhập để xem thông báo',
      'notif.empty': 'Chưa có thông báo nào',
      'notif.mark_read': 'Đánh dấu đã đọc',
      'notif.delete': 'Xóa',
      'notif.all_read': 'Đã đánh dấu tất cả đã đọc',
      'notif.deleted': 'Đã xóa thông báo',
      'notif.bell_label': 'Thông báo',
      'notif.time_just_now': 'Vừa xong',
      'notif.time_min': '{n} phút trước',
      'notif.time_hour': '{n} giờ trước',
      'notif.time_day': '{n} ngày trước',
      'notif.time_month': '{n} tháng trước',
      'notif.order_success': 'Đặt mua thành công!',
      'notif.order_msg': 'Đơn hàng {orderId} cho "{title}" đã được tạo.',
      'notif.new_review': 'Đánh giá mới',
      'notif.review_msg': '{reviewer} đã đánh giá tin "{title}".',
      'notif.new_order': 'Có đơn mua mới',
      'notif.order_seller_msg': 'Xe "{title}" đã được đặt mua bởi {buyer}.',
      'notif.order_cancelled_buyer': 'Đơn hàng đã được hủy',
      'notif.order_cancelled_buyer_msg': 'Đơn {orderId} đã được hủy thành công.',
      'notif.order_cancelled_seller': 'Đơn mua đã bị hủy',
      'notif.order_cancelled_seller_msg': 'Đơn {orderId} cho xe "{title}" đã bị hủy bởi người mua.',
      'notif.review_reminder': 'Nhắc đánh giá sau giao hàng',
      'notif.review_reminder_msg': 'Đơn hàng cho "{title}" đã giao. Hãy vào tin rao để để lại đánh giá.',
      'notif.post_approved': 'Tin rao đã được duyệt',
      'notif.post_approved_msg': 'Tin "{title}" đã được admin duyệt và hiển thị trên Marketplace.',
      'notif.post_rejected': 'Tin rao bị từ chối',
      'notif.post_rejected_msg': 'Tin "{title}" bị từ chối. Lý do: {reason}',
      'notif.admin_pending_post': 'Tin mới chờ duyệt',
      'notif.admin_pending_post_msg': 'Có tin mới "{title}" đang chờ duyệt.',
      'notif.order_status_admin': 'Cập nhật đơn hàng',
      'notif.order_status_admin_msg': 'Đơn {orderId} đã chuyển sang: {status}.',
      'notif.order_status_admin_note_msg': 'Đơn {orderId} → {status}. Ghi chú admin: {note}',
      'notif.event_admin_pending_post_title': 'Tin rao mới chờ duyệt',
      'notif.event_admin_pending_post_msg': 'Tin "{title}" vừa gửi lên và đang chờ admin duyệt.',
      'notif.event_post_approved_title': 'Tin rao đã được duyệt',
      'notif.event_post_approved_msg': 'Tin "{title}" đã được phê duyệt và đang hiển thị công khai.',
      'notif.event_post_rejected_title': 'Tin rao bị từ chối',
      'notif.event_post_rejected_msg': 'Tin "{title}" bị từ chối. Lý do: {reason}',
      'notif.event_order_created_buyer_title': 'Đặt mua thành công',
      'notif.event_order_created_buyer_msg': 'Đơn {orderId} cho "{title}" đã được tạo.',
      'notif.event_order_created_seller_title': 'Bạn có đơn mua mới',
      'notif.event_order_created_seller_msg': 'Xe "{title}" vừa được đặt bởi {buyer}.',
      'notif.event_order_created_admin_title': 'Đơn mua mới cần theo dõi',
      'notif.event_order_created_admin_msg': 'Đơn {orderId} cho "{title}" vừa tạo bởi {buyer}.',
      'notif.event_order_status_changed_buyer_title': 'Đơn hàng được cập nhật',
      'notif.event_order_status_changed_buyer_msg': 'Đơn {orderId} đã chuyển sang trạng thái: {status}.',
      'notif.event_order_status_changed_seller_title': 'Cập nhật đơn hàng tin rao',
      'notif.event_order_status_changed_seller_msg': 'Đơn {orderId} của "{title}" đã đổi sang: {status}.',
      'notif.event_order_cancelled_buyer_title': 'Hủy đơn thành công',
      'notif.event_order_cancelled_buyer_msg': 'Đơn {orderId} đã được hủy thành công.',
      'notif.event_order_cancelled_seller_title': 'Đơn mua đã bị hủy',
      'notif.event_order_cancelled_seller_msg': 'Đơn {orderId} cho "{title}" đã bị người mua hủy.',
      'notif.event_order_cancelled_admin_title': 'Đơn mua đã bị hủy',
      'notif.event_order_cancelled_admin_msg': 'Đơn {orderId} cho "{title}" đã bị hủy bởi {buyer}.',
      'notif.event_order_delivered_title': 'Đơn hàng đã giao',
      'notif.event_order_delivered_msg': 'Đơn {orderId} cho "{title}" đã giao thành công.',
      'notif.event_review_reminder_title': 'Nhắc đánh giá sau giao hàng',
      'notif.event_review_reminder_msg': 'Đơn cho "{title}" đã giao. Hãy để lại đánh giá giúp cộng đồng.',
      'notif.event_new_review_title': 'Bạn nhận được đánh giá mới',
      'notif.event_new_review_msg': '{reviewer} vừa đánh giá tin "{title}".',

      /* ---------- validation ---------- */
      'val.required_name': 'Vui lòng nhập tên hiển thị.',
      'val.min_name': 'Tên phải có ít nhất 2 ký tự.',
      'val.required_email': 'Vui lòng nhập email.',
      'val.invalid_email': 'Email không đúng định dạng.',
      'val.required_password': 'Vui lòng nhập mật khẩu.',
      'val.min_password': 'Mật khẩu phải có ít nhất 6 ký tự.',
      'val.required_confirm': 'Vui lòng xác nhận mật khẩu.',
      'val.password_mismatch': 'Mật khẩu xác nhận không khớp.',
      'val.email_duplicate': 'Email này đã được đăng ký.',
      'val.admin_email_reserved': 'Email admin được bảo lưu cho hệ thống.',
      'val.email_not_found': 'Email chưa được đăng ký.',
      'val.wrong_password': 'Mật khẩu không đúng.',
      'val.required_current_password': 'Vui lòng nhập mật khẩu hiện tại.',
      'val.same_password': 'Mật khẩu mới phải khác mật khẩu hiện tại.',
      'val.required_fullname': 'Vui lòng nhập họ tên.',
      'val.min_fullname': 'Họ tên phải có ít nhất 2 ký tự.',
      'val.required_phone': 'Vui lòng nhập số điện thoại.',
      'val.invalid_phone': 'SĐT không hợp lệ (VD: 0912345678 hoặc +84912345678).',
      'val.required_address': 'Vui lòng nhập địa chỉ nhận xe/chứng từ.',
      'val.min_address': 'Địa chỉ phải có ít nhất 5 ký tự.',
      'val.required_payment': 'Vui lòng chọn phương thức thanh toán.',
      'val.required_card_type': 'Vui lòng chọn loại thẻ.',
      'val.invalid_card_type': 'Loại thẻ không hợp lệ.',
      'val.required_card_holder': 'Vui lòng nhập tên chủ thẻ.',
      'val.min_card_holder': 'Tên chủ thẻ phải có ít nhất 2 ký tự.',
      'val.required_card_number': 'Vui lòng nhập số thẻ.',
      'val.invalid_card_number': 'Số thẻ không hợp lệ cho loại thẻ đã chọn.',
      'val.card_type_mismatch': 'Số thẻ không khớp với loại thẻ đã chọn.',
      'val.required_card_expiry': 'Vui lòng nhập ngày hết hạn thẻ.',
      'val.invalid_card_expiry': 'Ngày hết hạn không hợp lệ (MM/YY).',
      'val.card_expired': 'Thẻ đã hết hạn.',
      'val.required_card_cvv': 'Vui lòng nhập mã CVV.',
      'val.invalid_card_cvv': 'CVV phải có đúng {n} chữ số.',
      'val.required_title': 'Vui lòng nhập tiêu đề.',
      'val.required_brand': 'Vui lòng chọn hãng xe.',
      'val.required_model': 'Vui lòng nhập model xe.',
      'val.invalid_year': 'Năm sản xuất phải từ 1990 đến {max}.',
      'val.invalid_price': 'Giá phải lớn hơn 0.',
      'val.invalid_mileage': 'Số km phải >= 0.',
      'val.required_desc': 'Vui lòng nhập mô tả.',

      /* ---------- theme ---------- */
      'theme.dark': 'Dark',
      'theme.light': 'Light',
      'theme.switch_dark': 'Chuyển sang chế độ tối',
      'theme.switch_light': 'Chuyển sang chế độ sáng'
    },

    en: {
      /* ---------- common ---------- */
      'common.login': 'Login',
      'common.logout': 'Logout',
      'common.register': 'Register',
      'common.submit': 'Submit',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.save': 'Save',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.all': 'All',
      'common.back': 'Back',
      'common.view_detail': 'View Detail',
      'common.loading': 'Loading...',
      'common.processing': 'Processing...',
      'common.retry': 'Retry',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.updating': 'Updating',
      'common.close': 'Close',
      'common.confirm': 'Confirm',
      'common.success': 'Success',
      'common.error': 'Error',
      'common.warning': 'Warning',
      'common.info': 'Info',
      'common.na': 'N/A',
      'common.countdown_clock': '{days}d {hh}:{mm}:{ss}',

      /* ---------- nav ---------- */
      'nav.home': 'Home',
      'nav.catalog': 'Explore',
      'nav.brands': 'Brands',
      'nav.marketplace': 'Marketplace',
      'nav.wishlist': 'Wishlist',
      'nav.my_purchases': 'My Purchases',
      'nav.compare': 'Compare',
      'nav.inbox': 'Inbox',


      'contact.title': 'Consultation',
      'contact.fab_label': 'Chat',
      'contact.hotline': 'Hotline',
      'contact.zalo': 'Zalo',
      'contact.zalo_hint': 'Quick chat',
      'contact.messenger': 'Messenger',
      'contact.messenger_hint': 'Facebook message',
      'contact.hours': 'Hours',
      'contact.seller_email': 'Seller email',
      'contact.not_configured': 'Contact channels not configured. Add config.local.js',
      'contact.consult_btn': 'Contact advisor',

      'compare.title': 'Compare Cars',
      'compare.subtitle': 'Comparing {count}/{max} models',
      'compare.pool_subtitle': '{poolCount} cars marked — select up to {max} to compare',
      'compare.add': 'Compare',
      'compare.in_list': 'Marked',
      'compare.added_toast': 'Added to compare list',
      'compare.removed_toast': 'Removed from compare list',
      'compare.full': 'You can compare up to {max} cars',
      'compare.selection_full': 'You can only select up to {max} cars to compare',
      'compare.duplicate': 'Car already in list',
      'compare.add_failed': 'Could not add car',
      'compare.empty_title': 'Nothing to compare',
      'compare.empty_desc': 'Mark cars from Catalog or detail pages, then select up to 3 here to compare.',
      'compare.explore_catalog': 'Explore Catalog',
      'compare.clear_all': 'Clear all',
      'compare.deselect_all': 'Deselect all',
      'compare.share_link': 'Copy link',
      'compare.link_copied': 'Compare link copied',
      'compare.cleared': 'Compare list cleared',
      'compare.remove': 'Remove',
      'compare.remove_from_compare': 'Remove from compare',
      'compare.remove_from_pool': 'Remove from list',
      'compare.select_hint': 'Select cars below to view the comparison table',
      'compare.selected_count': '{count}/{max} selected',
      'compare.picker_title': 'Select cars to compare',
      'compare.results_title': 'Comparison results',
      'compare.spec_label': 'Specification',
      'compare.row_price': 'Lowest listing price',
      'compare.row_hp': 'Horsepower',
      'compare.row_accel': '0–100 km/h',
      'compare.row_speed': 'Top speed',
      'compare.row_engine': 'Engine',
      'compare.row_drivetrain': 'Drivetrain',
      'compare.price_none': 'No listings',

      'finance.title': 'Financing estimate',
      'finance.disclaimer': 'Simulation only — not a financial offer.',
      'finance.price': 'Vehicle price',
      'finance.down_pct': 'Down payment',
      'finance.term': 'Term',
      'finance.months': 'months',
      'finance.rate': 'APR (%)',
      'finance.monthly': 'Monthly payment',
      'finance.total_interest': 'Total interest',
      'finance.total_paid': 'Total paid',

      'saved_search.save_btn': 'Save search',
      'saved_search.saved': 'Search alert saved',
      'saved_search.login_required': 'Login to save searches',
      'saved_search.min_price': 'Min price',
      'saved_search.max_price': 'Max price',
      'saved_search.default_label': 'Marketplace search',
      'saved_search.account_title': 'Saved alerts',
      'saved_search.empty': 'No saved alerts yet.',

      'inbox.title': 'Inbox',
      'inbox.threads': 'Threads',
      'inbox.empty': 'No messages yet.',
      'inbox.login_required': 'Login to message sellers',
      'inbox.message_seller': 'Message seller',
      'inbox.cannot_message': 'Cannot message this listing',
      'inbox.placeholder': 'Type a message...',
      'inbox.send': 'Send',

      'seller.stats_line': '{views} views · {inquiries} inquiries',
      'admin.stat_views': 'Total views',
      'admin.stat_orders': 'Orders',
      'admin.stat_inquiries': 'Inquiries',
      'md.spec_views': 'Views',

      'notif.event_saved_search_title': 'New listing match',
      'notif.event_saved_search_msg': 'Listing "{postTitle}" matches alert "{label}".',
      'notif.event_new_message_title': 'New message',
      'notif.event_new_message_msg': '{preview}',

      'account.settings_motion_preset': 'Motion preset',
      'account.settings_motion_preset_desc': 'Cinematic / Balanced / Minimal',
      'account.settings_motion_cinematic': 'Cinematic',
      'account.settings_motion_balanced': 'Balanced',
      'account.settings_motion_minimal': 'Minimal',

      /* ---------- footer ---------- */
      'footer.desc': 'The premier platform for exploring and sharing the passion for supercars. Connecting the community of speed and automotive art enthusiasts.',
      'footer.explore': 'Explore',
      'footer.account': 'Account',
      'footer.post_ad': 'Post Ad',
      'footer.copyright': '© 2024 AutoLuxe. All rights reserved.',

      /* ---------- home ---------- */
      'home.title': 'AutoLuxe - Premium Supercars',
      'home.hero_title': 'The Peak of <span>Speed</span> &amp; Art',
      'home.hero_title_highlight': 'Speed',
      'home.card_ferrari_desc': 'Hybrid supercar with 986 HP, 0-100km/h in 2.5 seconds.',
      'home.card_lambo_desc': 'The most powerful V12 hybrid in Lamborghini history with 1015 HP.',
      'home.card_mclaren_desc': 'A masterpiece from Woking with 750PS and ultra-light weight.',
      'home.card_porsche_desc': 'The purest track-focused 911 with active aerodynamics.',
      'home.card_bugatti_desc': '1500 HP, top speed 420km/h — the pinnacle of automotive engineering.',
      'home.card_aston_desc': 'Hypercar with Cosworth V12 engine and pure F1 aerodynamics.',
      'home.hero_subtitle': 'Discover the world\'s most premium supercar collection. From Ferrari to Bugatti — experience the power and beauty of perfect engineering.',
      'home.explore_catalog': 'Explore Catalog',
      'home.view_brands': 'View Brands',
      'home.featured_title': 'Featured Supercars',
      'home.featured_subtitle': 'The most loved models at AutoLuxe.',
      'home.card_bolide_desc': 'Track-only W16 hypercar with 1,850 hp and extreme aero.',
      'home.card_tourbillon_desc': 'Next-gen V16 hybrid with 1,800 hp — a new Bugatti era.',
      'home.card_venevo_desc': 'V12 hybrid with 1,015 hp — power and future design.',
      'home.card_ferzor_desc': 'Twin-turbo V8 hybrid with 920 hp and peak aero performance.',
      'home.card_gt3_desc': 'Naturally aspirated flat-6 with 510 hp — pure Porsche driving.',
      'home.card_gt3rs_desc': 'Naturally aspirated flat-6 with 525 hp and track-focused aero.',
      'home.brand_strip_title': 'Legendary Brands',
      'home.brand_strip_subtitle': 'Discover the world\'s leading supercar manufacturers.',
      'home.card_detail': 'Detail',
      'home.hero_eyebrow': 'A world-class supercar collection',
      'home.scroll_cue': 'Scroll down to explore',
      'home.speedo_hint': 'Hold left click to accelerate · right click to brake',
      'home.back_to_top': 'Back to top',
      'home.stats_cars': 'Curated supercars',
      'home.stats_brands': 'Legendary brands',
      'home.stats_members': 'Passionate members',
      'home.stats_satisfaction': 'Satisfied customers',
      'home.why_title': 'Why Choose AutoLuxe',
      'home.why_subtitle': 'A transparent, secure and premium supercar trading experience.',
      'home.why_card1_title': 'Rigorous curation',
      'home.why_card1_desc': 'Every model is carefully screened for condition, history and documentation.',
      'home.why_card2_title': 'Verified authenticity',
      'home.why_card2_desc': 'Listings are moderated to guarantee genuine origin and transparent details.',
      'home.why_card3_title': 'Passionate community',
      'home.why_card3_desc': 'Connect with thousands of speed enthusiasts sharing real experience and reviews.',
      'home.why_card4_title': 'Dedicated 24/7 support',
      'home.why_card4_desc': 'Our team accompanies you from the first search to the final handover.',
      'home.testimonials_title': 'What Our Clients Say',
      'home.testimonials_subtitle': 'Trusted by the supercar community across the country.',
      'home.tm1_quote': '"A transparent process and an incredibly knowledgeable team. I got my dream 911 in just a week."',
      'home.tm1_name': 'Minh Hoang',
      'home.tm1_role': 'Entrepreneur, HCMC',
      'home.tm2_quote': '"Photos and specs accurate down to the detail. The best online car-buying experience I have had."',
      'home.tm2_name': 'Tuan Anh',
      'home.tm2_role': 'Collector, Hanoi',
      'home.tm3_quote': '"My listing was approved fast and reached the right buyers. Sold my Lamborghini within days."',
      'home.tm3_name': 'Phuong Linh',
      'home.tm3_role': 'Seller, Da Nang',
      'home.cta_title': 'Ready to Drive Your Dream?',
      'home.cta_subtitle': 'Explore the supercar collection now and find the car of your destiny.',
      'home.cta_button': 'Explore now',
      'home.cta_sell': 'Sell your car',

      /* ---------- catalog ---------- */
      'catalog.title': 'Supercar Catalog',
      'catalog.subtitle': 'Pick a brand or manufacturer to browse NHTSA vPIC models — images and specs from AutoLuxe Database.',
      'catalog.chip_database': 'AutoLuxe Database',
      'catalog.chip_nhtsa': 'NHTSA vPIC',
      'catalog.filter_make': 'Make',
      'catalog.search_model': 'Search Model',
      'catalog.search_placeholder': 'Enter model name...',
      'catalog.select_make': '-- Select make --',
      'catalog.loading_makes': 'Loading...',
      'catalog.results_count': 'Found <strong>{count}</strong> models',
      'catalog.featured_eyebrow': 'Suggested',
      'catalog.featured_title': 'Featured models',
      'catalog.featured_subtitle': 'Select a make above to browse its full model list.',
      'catalog.featured_results_count': '<strong>{count}</strong> featured models',
      'catalog.state_empty_year': 'No featured models for year {year}.',
      'catalog.view_detail': 'View detail',
      'catalog.market_available_count': '{count} listing(s) available now',
      'catalog.market_available_none': 'No active listing for this model yet',
      'catalog.market_view_available': 'View available listings',
      'catalog.market_none_cta': 'No listing available',
      'catalog.state_loading_title': 'Loading...',
      'catalog.state_loading_makes': 'Loading makes list...',
      'catalog.state_loading_models': 'Loading models for {make}...',
      'catalog.state_error_title': 'An error occurred',
      'catalog.state_empty_title': 'No results',
      'catalog.state_empty_no_model': 'No models found for this make.',
      'catalog.state_empty_keyword': 'No models matching keyword "{keyword}".',
      'catalog.state_empty_nodata': 'No data available.',
      'catalog.state_guide_title': 'Welcome to Catalog',
      'catalog.state_guide_desc': 'Select a make to view its model list.',
      'catalog.hero_eyebrow': 'A global model collection',
      'catalog.year_label': 'Year',
      'catalog.year_all': 'All years',
      'catalog.sort_label': 'Sort by',
      'catalog.sort_az': 'Name A → Z',
      'catalog.sort_za': 'Name Z → A',
      'catalog.sort_available': 'Listings first',
      'catalog.view_label': 'View',
      'catalog.view_grid': 'Grid view',
      'catalog.view_list': 'List view',
      'catalog.quickview': 'Quick view',
      'catalog.quickview_loading': 'Loading detailed information...',
      'catalog.quickview_specs': 'Specifications',
      'catalog.quickview_desc': 'Overview',
      'catalog.quickview_wiki_empty': 'Description for this model is being updated.',
      'catalog.quickview_source_wiki': 'Source',
      'catalog.pagination_prev': '‹ Prev',
      'catalog.pagination_next': 'Next ›',

      /* ---------- detail ---------- */
      'detail.title': 'Car Detail - AutoLuxe',
      'detail.fallback_title': 'Car Updating',
      'detail.fallback_info': 'Information is being updated, please check back later.',
      'detail.data_pending': 'Data pending',
      'detail.specs_title': 'Technical Specifications',
      'detail.desc_title': 'Description',
      'detail.desc_updating': 'Description is being updated.',
      'detail.related_title': 'Related Cars',
      'detail.back_prev': 'Go back',
      'detail.back_catalog': 'Back to Catalog',
      'detail.view_marketplace': 'View Marketplace',
      'detail.view_marketplace_count': 'View {count} available listing(s)',
      'detail.view_marketplace_none': 'No listing available',
      'detail.market_available_count': '{count} matched listing(s) on Marketplace',
      'detail.market_available_none': 'No matched listing on Marketplace yet',
      'detail.market_none_hint': 'Once someone posts the exact model, this Marketplace action will be enabled automatically.',
      'detail.notfound_title': 'Car not found',
      'detail.notfound_desc': 'The car you are looking for does not exist or the link is invalid.',
      'detail.spec_power': 'Power',
      'detail.spec_topspeed': 'Top Speed',
      'detail.spec_accel': '0-100 km/h',
      'detail.spec_engine': 'Engine',
      'detail.spec_drivetrain': 'Drivetrain',
      'detail.spec_year': 'Year',

      /* ---------- brands ---------- */
      'brands.title': 'Supercar Brands',
      'brands.subtitle': 'Learn about the most prestigious supercar manufacturers on the planet.',
      'brands.featured_label': 'Featured model:',
      'brands.view_all': 'View all cars',
      'brands.established': 'Est.',
      'brands.ferrari_origin': 'Italy &bull; Est. 1947',
      'brands.lamborghini_origin': 'Italy &bull; Est. 1963',
      'brands.mclaren_origin': 'United Kingdom &bull; Est. 1963',
      'brands.porsche_origin': 'Germany &bull; Est. 1931',
      'brands.bugatti_origin': 'France &bull; Est. 1909',
      'brands.koenigsegg_origin': 'Sweden &bull; Est. 1994',
      'brands.aston_martin_origin': 'United Kingdom &bull; Est. 1913',
      'brands.ferrari_desc': 'An icon of speed and passion from Italy. Ferrari is not just a car, but a dream on four wheels with a glorious history in Formula 1 and over 200 Grand Prix victories.',
      'brands.lamborghini_desc': 'Famous for bold angular design and unmistakable engine sound. Lamborghini consistently pushes the boundaries of automotive engineering and design aesthetics.',
      'brands.mclaren_desc': 'From F1 racing to the streets, McLaren brings pure racing DNA into every model with breakthrough lightweight materials and superior aerodynamic performance.',
      'brands.porsche_desc': 'German engineering perfection. Porsche combines everyday practicality with peak racing performance, with a tradition of over 19,000 motorsport victories.',
      'brands.bugatti_desc': 'The pinnacle of speed and luxury. Each Bugatti is a masterpiece of mechanical art with power that defies all limits, where engineering meets craftsmanship.',
      'brands.koenigsegg_desc': 'The Swedish megacar manufacturer with a philosophy of relentless innovation. Koenigsegg continuously breaks world speed records with 100% in-house developed technology.',
      'brands.aston_martin_desc': 'British gentleman elegance. Aston Martin combines classic beauty with enchanting sports performance, an icon of James Bond and luxurious lifestyle.',

      /* ---------- data values ---------- */
      'data.fuel_gasoline': 'Gasoline',
      'data.fuel_diesel': 'Diesel',
      'data.fuel_hybrid': 'Hybrid',
      'data.fuel_electric': 'Electric',
      'data.trans_auto': 'Automatic',
      'data.trans_manual': 'Manual',
      'data.trans_pdk': 'PDK',
      'data.trans_dct': 'DCT',

      /* ---------- marketplace ---------- */
      'market.title': 'Marketplace',
      'market.subtitle': 'Buy and sell supercars from the AutoLuxe community.',
      'market.post_new': '+ Post New Ad',
      'market.search_label': 'Search',
      'market.search_placeholder': 'Search by car name, make, model...',
      'market.brand_label': 'Make',
      'market.sort_label': 'Sort by',
      'market.sort_newest': 'Newest',
      'market.sort_price_asc': 'Price: Low to High',
      'market.sort_price_desc': 'Price: High to Low',
      'market.prefill_applied': 'Prefilled filter: {brand} {model}.',
      'market.empty_title': 'No listings yet',
      'market.empty_desc': 'Be the first to post a supercar for sale on AutoLuxe!',
      'market.view_car': 'View Car',
      'market.delete_confirm_title': 'Delete listing',
      'market.delete_confirm': 'Are you sure you want to delete "{title}"?',
      'market.delete_success': 'Listing deleted successfully!',
      'market.delete_fail': 'Failed to delete listing. Please try again.',
      'market.delete_login': 'Please login to delete listings.',
      'market.delete_notfound': 'Listing not found.',
      'market.delete_noperm': 'You don\'t have permission to delete this listing.',
      'market.created_toast': 'Listing posted successfully!',
      'market.updated_toast': 'Listing updated successfully!',
      'market.anonymous': 'Anonymous',

      /* ---------- market detail ---------- */
      'md.notfound_title': 'Listing not found',
      'md.notfound_desc': 'This listing does not exist or has been deleted.',
      'md.back': '← Back to Marketplace',
      'md.desc_title': 'Detailed Description',
      'md.no_desc': 'No description available.',
      'md.no_contact': 'No contact information',
      'md.pending_status': '⏳ Pending - Not available',
      'md.sold_status': 'Sold — not available for purchase',
      'md.owner_cannot_buy': 'You posted this listing — you cannot buy your own car',
      'md.not_available_title': 'Listing not public',
      'md.not_available_pending': 'This listing is pending admin review or not yet published.',
      'md.not_available_rejected': 'This listing was rejected and is hidden from Marketplace.',
      'md.buy_now': '🛒 Buy Now',
      'md.spec_brand': 'Make',
      'md.spec_model': 'Model',
      'md.spec_year': 'Year',
      'md.spec_mileage': 'Mileage',
      'md.spec_fuel': 'Fuel',
      'md.spec_transmission': 'Transmission',
      'md.spec_location': 'Location',
      'md.spec_date': 'Posted',
      'md.spec_updating': 'Updating',

      /* ---------- reviews ---------- */
      'review.title': 'Showroom Reviews',
      'review.read_all': 'Read all',
      'review.sort_label': 'Sort:',
      'review.sort_newest': 'Newest',
      'review.sort_highest': 'Highest rated',
      'review.empty_text': 'No reviews yet for this listing. Be the first!',
      'review.form_title': 'Write a Review',
      'review.login_notice': 'Please <a href="./auth.html">login</a> to submit a review.',
      'review.star_label': 'Star Rating',
      'review.star_placeholder': 'Select stars',
      'review.content_label': 'Review Content',
      'review.content_placeholder': 'Share your experience...',
      'review.submit': 'Submit Review',
      'review.count': '{count} reviews',
      'review.no_perm': 'You don\'t have permission to review this listing.',
      'review.select_star': 'Please select a star rating (1-5).',
      'review.enter_content': 'Please enter your review content.',
      'review.max_length': 'Review content maximum {max} characters.',
      'review.success': 'Review submitted successfully!',
      'review.fail': 'Failed to submit review. Please try again.',
      'review.owner_notice': 'You cannot review your own listing.',
      'review.star_1': 'Terrible',
      'review.star_2': 'Bad',
      'review.star_3': 'Average',
      'review.star_4': 'Good',
      'review.star_5': 'Excellent',

      /* ---------- post-editor ---------- */
      'editor.title_create': 'Post a Listing',
      'editor.title_edit': 'Edit Listing',
      'editor.subtitle': 'Fill in the car details you want to sell on AutoLuxe Marketplace.',
      'editor.login_warning': 'Please <a href="./auth.html">login</a> to post a listing.',
      'editor.post_title': 'Listing Title *',
      'editor.post_title_ph': 'e.g. Ferrari 488 GTB 2019 - Clean, low mileage',
      'editor.post_brand': 'Make *',
      'editor.post_brand_ph': 'Select make',
      'editor.post_brand_other': 'Other',
      'editor.post_model': 'Model *',
      'editor.post_model_ph': 'e.g. 488 GTB, Huracán EVO...',
      'editor.post_year': 'Year *',
      'editor.post_price': 'Price (USD) *',
      'editor.post_mileage': 'Mileage (km) *',
      'editor.post_location': 'Location',
      'editor.post_location_ph': 'e.g. Ho Chi Minh, Hanoi...',
      'editor.post_fuel': 'Fuel Type',
      'editor.post_fuel_ph': 'Select',
      'editor.fuel_gasoline': 'Gasoline',
      'editor.fuel_diesel': 'Diesel',
      'editor.fuel_hybrid': 'Hybrid',
      'editor.fuel_electric': 'Electric',
      'editor.post_transmission': 'Transmission',
      'editor.post_transmission_ph': 'Select',
      'editor.trans_auto': 'Automatic',
      'editor.trans_manual': 'Manual',
      'editor.post_desc': 'Detailed Description *',
      'editor.post_desc_ph': 'Describe the car condition, maintenance history, extras...',
      'editor.post_images': 'Car Photos',
      'editor.post_images_upload': 'Choose Photos',
      'editor.post_images_hint': 'PNG, JPG, WEBP, GIF — up to 8 photos, 800KB each. Temporarily saved in your browser.',
      'editor.post_images_cover': 'Cover',
      'editor.post_images_remove': 'Remove photo',
      'editor.post_image_too_large': 'Image exceeds 800KB. Please choose a smaller file.',
      'editor.post_image_invalid': 'Could not read image. Please choose a valid image file.',
      'editor.post_images_max': 'Maximum {max} photos per listing.',
      'editor.post_images_quota': 'Not enough storage space. Remove photos or choose smaller files.',
      'editor.btn_post': 'Post Listing',
      'editor.btn_update': 'Update Listing',
      'editor.post_notfound': 'Listing not found.',
      'editor.no_edit_perm': 'You don\'t have permission to edit this listing.',
      'editor.update_fail': 'Update failed. Please try again.',
      'editor.post_fail': 'Post failed. Please try again.',
      'editor.submitted_pending': 'Your listing was submitted and is pending admin review.',
      'editor.new_pending_hint': 'New listings start as pending review and are not public on Marketplace yet.',
      'editor.resubmit_hint': 'Edit and save to submit for review again.',
      'editor.edit_reapproval_hint': 'This listing is live. Any saved changes will require admin approval before going public again.',
      'editor.resubmitted_pending': 'Listing updated and sent back for admin review.',

      /* ---------- auth ---------- */
      'auth.page_title': 'Login - AutoLuxe',
      'auth.title': 'Account',
      'auth.subtitle': 'Login or create a new account to access all AutoLuxe features.',
      'auth.logged_in_msg': 'You are logged in as',
      'auth.tab_login': 'Login',
      'auth.tab_register': 'Register',
      'auth.email_label': 'Email *',
      'auth.email_ph': 'you@example.com',
      'auth.password_label': 'Password *',
      'auth.password_ph': 'Enter password...',
      'auth.login_btn': 'Login',
      'auth.name_label': 'Display Name *',
      'auth.name_ph': 'Your name (at least 2 characters)',
      'auth.confirm_label': 'Confirm Password *',
      'auth.confirm_ph': 'Re-enter password',
      'auth.min_6_chars': 'Minimum 6 characters',
      'auth.register_btn': 'Create Account',
      'auth.login_success': 'Login successful! Redirecting...',
      'auth.register_success': 'Registration successful! Redirecting...',
      'auth.greeting': 'Hello, ',

      /* ---------- checkout ---------- */
      'checkout.page_title': 'Checkout - AutoLuxe',
      'checkout.title': 'Checkout Order',
      'checkout.subtitle': 'Confirm your purchase details and complete the order',
      'checkout.back': '← Back to listing detail',
      'checkout.car_info': 'Car Information',
      'checkout.buyer_info': 'Buyer Information',
      'checkout.fullname': 'Full Name',
      'checkout.phone': 'Phone Number',
      'checkout.email': 'Email',
      'checkout.address': 'Delivery Address',
      'checkout.payment': 'Payment Method',
      'checkout.payment_ph': '-- Select method --',
      'checkout.payment_bank': 'Bank Transfer',
      'checkout.payment_cash': 'Cash on Delivery',
      'checkout.payment_installment': 'Bank Installment',
      'checkout.payment_crypto': 'E-Wallet Payment',
      'checkout.note': 'Notes (optional)',
      'checkout.note_ph': 'Additional notes for the order...',
      'checkout.submit': '🛒 Place Order',
      'checkout.success_title': 'Payment Successful!',
      'checkout.success_desc': 'Order <strong>{orderId}</strong> has been created. We will contact you shortly.',
      'checkout.view_post': 'View Listing',
      'checkout.err_no_post_id': 'Missing listing information',
      'checkout.err_no_post_id_desc': 'No listing ID found in URL. Please go back to marketplace and select a car.',
      'checkout.err_not_found': 'Listing not found',
      'checkout.err_not_found_desc': 'The listing you are trying to buy does not exist or has been deleted.',
      'checkout.err_pending': 'Listing not available',
      'checkout.err_pending_desc': 'This listing is pending and cannot be purchased.',
      'checkout.err_post_gone': 'Listing no longer exists.',
      'checkout.err_already_pending': 'This listing has been purchased by someone else.',
      'checkout.err_update_post': 'Cannot update listing status. Please try again.',
      'checkout.err_save_order': 'Cannot save order. Please try again.',
      'checkout.address_ph': 'Street, District, City/Province',
      'checkout.fullname_ph': 'John Doe',
      'checkout.step_buyer': 'Step 1 - Buyer Info',
      'checkout.step_buyer_desc': 'Enter delivery/contact details',
      'checkout.step_payment': 'Step 2 - Demo Payment',
      'checkout.step_payment_desc': 'Validate card and simulate gateway',
      'checkout.continue_to_payment': 'Continue to payment step',
      'checkout.back_to_buyer': 'Back to step 1',
      'checkout.pay_now': 'Pay Now (Demo)',
      'checkout.payment_demo_title': 'Demo card payment',
      'checkout.payment_demo_desc': 'Supports Visa/Master/JCB/Amex. This is a simulated gateway for flow testing.',
      'checkout.card_type': 'Card Type',
      'checkout.card_type_ph': '-- Select card type --',
      'checkout.card_visa': 'Visa',
      'checkout.card_mastercard': 'Mastercard',
      'checkout.card_jcb': 'JCB',
      'checkout.card_amex': 'American Express',
      'checkout.card_holder': 'Cardholder Name',
      'checkout.card_holder_ph': 'JOHN DOE',
      'checkout.card_number': 'Card Number',
      'checkout.card_number_ph': '4111 1111 1111 1111',
      'checkout.card_expiry': 'Expiry Date',
      'checkout.buyer_preview_title': 'Quick buyer confirmation',
      'checkout.guest_local_only_title': 'Guest checkout - local-only data',
      'checkout.guest_local_only_desc': 'You are not logged in. Order is still created but only stored in this browser localStorage.',
      'checkout.success_guest_note': 'Guest orders stay on this device only. When you login in the same browser, orders are auto-merged into your account.',
      'checkout.cancel_window_countdown': 'You can cancel within: {countdown}',
      'checkout.view_purchases': 'View My Purchases',
      'checkout.gateway_failed_title': 'Demo payment failed',
      'checkout.gateway_failed_desc': 'The demo gateway temporarily rejected this payment. Please retry.',
      'checkout.gateway_retry_hint': 'Your card inputs are preserved so you can retry quickly.',
      'checkout.retry_payment': 'Retry Payment',
      'checkout.gateway_debug_success': 'Debug: gateway forced success via query ?gateway=success',
      'checkout.gateway_debug_fail': 'Debug: gateway forced fail via query ?gateway=fail',
      'checkout.err_missing_buyer_step': 'Please complete step 1 before payment.',
      'checkout.card_cvv': 'CVV',
      'checkout.card_expiry_ph': 'MM/YY',
      'checkout.card_cvv_ph': '***',
      'checkout.phone_ph': '0912345678',
      'checkout.email_ph': 'you@example.com',
      'checkout.processing_payment': 'Processing payment...',
      'checkout.payment_success_toast': 'Payment successful! Your order has been created.',
      'checkout.payment_failed_toast': 'Payment failed. Please try again.',
      'checkout.guest_login_prompt': 'Login to sync orders across devices.',
      'checkout.view_marketplace': 'Open Marketplace',
      'checkout.success_status_note': 'Your order is confirmed. Track it or cancel within 7 days in My Purchases.',
      'checkout.pending_listing_note': 'The listing is pending payment while your order is processed.',
      'checkout.err_not_approved': 'Listing not approved',
      'checkout.err_not_approved_desc': 'This listing has not been approved by admin yet and cannot be purchased.',
      'checkout.err_owner_cannot_buy': 'You cannot buy your own listing',
      'checkout.err_owner_cannot_buy_desc': 'You are the seller of this listing. Please use another account or let a real buyer complete the purchase.',

      /* ---------- my purchases ---------- */
      'purchases.page_title': 'My Purchases - AutoLuxe',
      'purchases.title': 'My Purchases',
      'purchases.subtitle': 'Track order lifecycle, cancel within 7 days, and receive review reminders after delivery.',
      'purchases.filter_label': 'Status Filter',
      'purchases.filter_all': 'All',
      'purchases.filter_confirmed': 'Confirmed',
      'purchases.filter_pending': 'Pending',
      'purchases.filter_shipping': 'Shipping',
      'purchases.filter_delivered': 'Delivered',
      'purchases.filter_cancelled': 'Cancelled',
      'purchases.status_new': 'New',
      'purchases.status_confirmed': 'Confirmed',
      'purchases.status_rejected': 'Rejected',
      'purchases.status_pending': 'Pending',
      'purchases.status_shipping': 'Shipping',
      'purchases.status_delivered': 'Delivered',
      'purchases.status_cancelled': 'Cancelled',
      'purchases.cancel_window_info': 'You can cancel within 7 days of ordering.',
      'purchases.cancel_countdown_prefix': '{time} left',
      'purchases.cancel_expired': 'Cancellation period expired (7 days).',
      'purchases.review_reminder': 'Please review your car buying experience!',
      'purchases.review_cta': 'Leave a Review',
      'purchases.delivered_banner': 'Order delivered. Thank you for shopping with AutoLuxe!',
      'purchases.cancel_unavailable_delivered': 'Delivered — cannot cancel.',
      'purchases.cancel_unavailable_cancelled': 'Order was already cancelled.',
      'purchases.filter_rejected': 'Rejected',
      'purchases.context_user': 'Showing orders linked to your logged-in account.',
      'purchases.context_guest': 'You are viewing guest mode. Orders are available only on this browser/device.',
      'purchases.context_guest_empty': 'You are in guest mode but no guest id exists yet for previous orders.',
      'purchases.empty_title': 'No purchase orders found',
      'purchases.empty_desc': 'No orders match the current filter.',
      'purchases.browse_market': 'Open Marketplace',
      'purchases.order_id': 'Order ID: {orderId}',
      'purchases.created_at': 'Created at: {date}',
      'purchases.cancel_window_label': 'Remaining cancel window:',
      'purchases.countdown_closed': 'Cancel window closed',
      'purchases.view_listing': 'View Listing',
      'purchases.cancel_order': 'Cancel Order',
      'purchases.cancel_unavailable': 'Cannot Cancel',
      'purchases.cancel_confirm': 'Are you sure you want to cancel order {orderId}?',
      'purchases.cancel_not_found': 'Order not found.',
      'purchases.cancel_no_permission': 'You do not have permission to cancel this order.',
      'purchases.cancel_window_closed': 'Order is older than 7 days and can no longer be cancelled.',
      'purchases.cancel_success': 'Order cancelled successfully and listing returned to available.',
      'purchases.cancel_success_listing_warn': 'Order cancelled, but listing could not be found to restore availability.',
      'purchases.auto_delivered_notice': 'Auto-updated {count} order(s) to delivered when opening My Purchases.',
      'purchases.listing_unknown': 'Unknown listing',
      'purchases.timeline_title': 'Order processing history',
      'purchases.timeline_admin_status': 'Admin update: {status}',
      'purchases.timeline_admin_note': 'Note: {note}',
      'purchases.timeline_payment_success': 'Demo payment succeeded',
      'purchases.timeline_cancelled': 'You cancelled this order',
      'purchases.timeline_auto_delivered': 'Auto-marked delivered after 7-day window',
      'purchases.timeline_guest_merged': 'Guest order merged into account after login',

      /* ---------- account ---------- */
      'account.page_title': 'Account - AutoLuxe',
      'account.title': 'Account',
      'account.subtitle': 'Manage your personal profile and app preferences.',
      'account.tab_profile': 'Profile',
      'account.tab_settings': 'Settings',
      'account.display_name': 'Display Name',
      'account.email': 'Email',
      'account.phone': 'Phone',
      'account.phone_ph': '0912 345 678',
      'account.address': 'Address',
      'account.address_ph': 'Street, District, City/Province',
      'account.avatar': 'Avatar',
      'account.avatar_upload': 'Upload Photo',
      'account.avatar_change': 'Change Photo',
      'account.avatar_remove': 'Remove Photo',
      'account.avatar_hint': 'PNG, JPG, WEBP, GIF up to 500KB. Saved immediately in your browser.',
      'account.avatar_saved': 'Avatar saved.',
      'account.avatar_quota': 'Not enough storage space. Please choose a smaller image.',
      'account.avatar_too_large': 'Image exceeds 500KB. Please choose a smaller file.',
      'account.avatar_invalid': 'Could not read image. Please choose a valid image file.',
      'account.save_profile': 'Save Profile',
      'account.profile_saved': 'Profile saved successfully!',
      'account.profile_save_fail': 'Failed to save profile. Please try again.',
      'account.settings_placeholder': 'Theme and language preferences will be configured here in the next update.',
      'account.login_title': 'Not logged in',
      'account.login_desc': 'Please login to manage your profile and account settings.',
      'account.menu_open': 'Open account menu',
      'account.menu_account': 'Account',
      'account.menu_purchases': 'My Purchases',
      'account.password_section': 'Change Password',
      'account.password_section_hint': 'Enter your current password to verify before setting a new one.',
      'account.current_password': 'Current Password',
      'account.current_password_ph': 'Enter current password...',
      'account.new_password': 'New Password',
      'account.new_password_ph': 'At least 6 characters...',
      'account.confirm_password': 'Confirm New Password',
      'account.confirm_password_ph': 'Re-enter new password...',
      'account.change_password': 'Update Password',
      'account.password_changed': 'Password changed successfully!',
      'account.password_change_fail': 'Failed to change password. Please try again.',
      'account.settings_intro': 'Customize appearance, language, and motion effects. These options appear here when you are logged in.',
      'account.settings_theme': 'Appearance',
      'account.settings_theme_desc': 'Switch between light and dark mode.',
      'account.settings_language': 'Language',
      'account.settings_language_desc': 'Choose the display language for the entire app.',
      'account.settings_hero_scroll': 'Top-of-page scroll effects',
      'account.settings_hero_scroll_desc': 'Keep the home hero pin and 3D car exit on scroll. Turn off for normal scrolling (takes effect after reloading the home page).',
      'account.settings_hero_scroll_label': 'Enable hero scroll effects',
      'account.settings_lite_fx': 'Reduce motion effects',
      'account.settings_lite_fx_desc': 'Disable 3D card tilt, button ripples, and light parallax to reduce lag (reload the current page to apply).',
      'account.settings_lite_fx_label': 'Reduce interactive effects',
      'account.settings_motion_saved': 'Motion settings saved.',
      'account.tab_listings': 'My Listings',
      'account.listings_intro': 'Track moderation status of your marketplace listings.',
      'account.my_listings_empty': 'You haven\'t posted any listings yet.',
      'account.listing_status': 'Status',
      'account.listing_pending': 'Pending Review',
      'account.listing_approved': 'Active',
      'account.listing_rejected': 'Rejected',
      'account.listing_reject_reason': 'Reason: {reason}',
      'account.listing_reject_no_reason': 'No detailed reason provided.',
      'account.menu_admin': 'Admin Panel',

      /* ---------- admin ---------- */
      'admin.page_title': 'Admin - AutoLuxe',
      'admin.title': 'Admin Panel',
      'admin.subtitle': 'Moderate listings and respond to orders with notes for users.',
      'admin.tab_posts': 'Post Moderation',
      'admin.tab_orders': 'Order Management',
      'admin.queue_title': 'Pending Posts',
      'admin.queue_empty': 'No posts pending review.',
      'admin.approve_btn': 'Approve',
      'admin.reject_btn': 'Reject',
      'admin.reject_reason_label': 'Rejection Reason *',
      'admin.reject_reason_ph': 'Enter reason...',
      'admin.reject_confirm': 'Confirm rejection of this listing?',
      'admin.reject_confirm_btn': 'Confirm Rejection',
      'admin.reject_modal_title': 'Reject Listing',
      'admin.approved_toast': 'Listing "{title}" approved.',
      'admin.rejected_toast': 'Listing "{title}" rejected.',
      'admin.order_list_title': 'Order List',
      'admin.order_empty': 'No orders yet.',
      'admin.order_empty_active': 'No active orders to manage (cancelled orders are hidden).',
      'admin.order_status_change': 'Change Status',
      'admin.order_note_label': 'Admin Note',
      'admin.order_note_ph': 'Add a note for this order...',
      'admin.order_save': 'Save Update',
      'admin.order_updated': 'Order {orderId} updated.',
      'admin.order_status_new': 'New',
      'admin.order_status_confirmed': 'Confirmed',
      'admin.order_status_rejected': 'Rejected',
      'admin.order_status_shipping': 'Shipping',
      'admin.order_status_delivered': 'Delivered',
      'admin.order_timeline': 'Processing History',
      'admin.no_permission': 'You do not have permission to access the admin panel.',
      'admin.no_permission_desc': 'Only the admin account can access this area.',
      'admin.require_reason': 'Please enter a rejection reason.',
      'admin.update_fail': 'Update failed. Please try again.',
      'admin.post_owner': 'Posted by: {email}',
      'admin.post_submitted': 'Submitted: {date}',
      'admin.order_buyer': 'Buyer: {email}',
      'admin.order_invalid_status': 'Invalid order status.',
      'admin.order_no_change': 'No changes to save.',

      /* ---------- wishlist ---------- */
      'wishlist.title': 'Your Wishlist',
      'wishlist.subtitle': 'Cars and listings you have saved as favorites.',
      'wishlist.clear_all': 'Clear All',
      'wishlist.clear_confirm': 'Are you sure you want to clear your entire Wishlist?',
      'wishlist.cleared': 'Wishlist cleared.',
      'wishlist.removed': 'Item removed from Wishlist.',
      'wishlist.added': 'Added to Wishlist!',
      'wishlist.removed_short': 'Removed from Wishlist.',
      'wishlist.login_required': 'Please login to use Wishlist.',
      'wishlist.filter_type': 'Item Type',
      'wishlist.filter_brand': 'Make',
      'wishlist.empty_title': 'Wishlist is empty',
      'wishlist.empty_desc': 'You haven\'t saved any cars or listings yet. Explore and add to your Wishlist!',
      'wishlist.explore_catalog': 'Explore Catalog',
      'wishlist.view_marketplace': 'View Marketplace',
      'wishlist.login_title': 'Not logged in',
      'wishlist.login_desc': 'Please login to view your personal Wishlist.',
      'wishlist.no_match': 'No items matching the filters.',
      'wishlist.showing': 'Showing <strong>{filtered}</strong> / {total} items',
      'wishlist.saved': 'Saved: ',
      'wishlist.unavailable': 'No longer available',
      'wishlist.item_deleted': 'Item has been deleted',
      'wishlist.no_title': 'No title',
      'wishlist.wishlisted': '♥ Wishlisted',
      'wishlist.add_wishlist': '♡ Wishlist',

      /* ---------- notifications ---------- */
      'notif.title': 'Notifications',
      'notif.read_all': 'Read all',
      'notif.login_to_view': 'Login to view notifications',
      'notif.empty': 'No notifications yet',
      'notif.mark_read': 'Mark as read',
      'notif.delete': 'Delete',
      'notif.all_read': 'All notifications marked as read',
      'notif.deleted': 'Notification deleted',
      'notif.bell_label': 'Notifications',
      'notif.time_just_now': 'Just now',
      'notif.time_min': '{n} min ago',
      'notif.time_hour': '{n} hr ago',
      'notif.time_day': '{n} day ago',
      'notif.time_month': '{n} month ago',
      'notif.order_success': 'Order placed successfully!',
      'notif.order_msg': 'Order {orderId} for "{title}" has been created.',
      'notif.new_review': 'New review',
      'notif.review_msg': '{reviewer} reviewed listing "{title}".',
      'notif.new_order': 'New purchase order',
      'notif.order_seller_msg': 'Car "{title}" has been purchased by {buyer}.',
      'notif.order_cancelled_buyer': 'Order cancelled',
      'notif.order_cancelled_buyer_msg': 'Order {orderId} has been cancelled successfully.',
      'notif.order_cancelled_seller': 'Purchase cancelled by buyer',
      'notif.order_cancelled_seller_msg': 'Order {orderId} for "{title}" was cancelled by the buyer.',
      'notif.review_reminder': 'Review reminder after delivery',
      'notif.review_reminder_msg': 'Your order for "{title}" is delivered. Please leave a review on the listing.',
      'notif.post_approved': 'Listing approved',
      'notif.post_approved_msg': 'Your listing "{title}" was approved and is now public.',
      'notif.post_rejected': 'Listing rejected',
      'notif.post_rejected_msg': 'Listing "{title}" was rejected. Reason: {reason}',
      'notif.admin_pending_post': 'New listing pending review',
      'notif.admin_pending_post_msg': 'New listing "{title}" is waiting for approval.',
      'notif.order_status_admin': 'Order updated',
      'notif.order_status_admin_msg': 'Order {orderId} status: {status}.',
      'notif.order_status_admin_note_msg': 'Order {orderId} → {status}. Admin note: {note}',
      'notif.event_admin_pending_post_title': 'New listing pending approval',
      'notif.event_admin_pending_post_msg': 'Listing "{title}" has been submitted and is waiting for review.',
      'notif.event_post_approved_title': 'Listing approved',
      'notif.event_post_approved_msg': 'Your listing "{title}" has been approved and is now public.',
      'notif.event_post_rejected_title': 'Listing rejected',
      'notif.event_post_rejected_msg': 'Listing "{title}" was rejected. Reason: {reason}',
      'notif.event_order_created_buyer_title': 'Order placed successfully',
      'notif.event_order_created_buyer_msg': 'Order {orderId} for "{title}" has been created.',
      'notif.event_order_created_seller_title': 'You received a new order',
      'notif.event_order_created_seller_msg': 'Your car "{title}" has been ordered by {buyer}.',
      'notif.event_order_created_admin_title': 'New order requires oversight',
      'notif.event_order_created_admin_msg': 'Order {orderId} for "{title}" was created by {buyer}.',
      'notif.event_order_status_changed_buyer_title': 'Order status updated',
      'notif.event_order_status_changed_buyer_msg': 'Order {orderId} is now: {status}.',
      'notif.event_order_status_changed_seller_title': 'Listing order updated',
      'notif.event_order_status_changed_seller_msg': 'Order {orderId} for "{title}" changed to: {status}.',
      'notif.event_order_cancelled_buyer_title': 'Order cancelled',
      'notif.event_order_cancelled_buyer_msg': 'Order {orderId} has been cancelled successfully.',
      'notif.event_order_cancelled_seller_title': 'Order cancelled by buyer',
      'notif.event_order_cancelled_seller_msg': 'Order {orderId} for "{title}" was cancelled by the buyer.',
      'notif.event_order_cancelled_admin_title': 'Order cancelled',
      'notif.event_order_cancelled_admin_msg': 'Order {orderId} for "{title}" was cancelled by {buyer}.',
      'notif.event_order_delivered_title': 'Order delivered',
      'notif.event_order_delivered_msg': 'Order {orderId} for "{title}" has been delivered.',
      'notif.event_review_reminder_title': 'Review reminder',
      'notif.event_review_reminder_msg': 'Your order for "{title}" is delivered. Please leave a review.',
      'notif.event_new_review_title': 'You received a new review',
      'notif.event_new_review_msg': '{reviewer} reviewed your listing "{title}".',

      /* ---------- validation ---------- */
      'val.required_name': 'Please enter your display name.',
      'val.min_name': 'Name must be at least 2 characters.',
      'val.required_email': 'Please enter your email.',
      'val.invalid_email': 'Invalid email format.',
      'val.required_password': 'Please enter your password.',
      'val.min_password': 'Password must be at least 6 characters.',
      'val.required_confirm': 'Please confirm your password.',
      'val.password_mismatch': 'Passwords do not match.',
      'val.email_duplicate': 'This email is already registered.',
      'val.admin_email_reserved': 'The admin email is reserved for system use.',
      'val.email_not_found': 'Email is not registered.',
      'val.wrong_password': 'Incorrect password.',
      'val.required_current_password': 'Please enter your current password.',
      'val.same_password': 'New password must be different from your current password.',
      'val.required_fullname': 'Please enter your full name.',
      'val.min_fullname': 'Full name must be at least 2 characters.',
      'val.required_phone': 'Please enter your phone number.',
      'val.invalid_phone': 'Invalid phone number (e.g. 0912345678 or +84912345678).',
      'val.required_address': 'Please enter the delivery address.',
      'val.min_address': 'Address must be at least 5 characters.',
      'val.required_payment': 'Please select a payment method.',
      'val.required_card_type': 'Please select a card type.',
      'val.invalid_card_type': 'Invalid card type.',
      'val.required_card_holder': 'Please enter cardholder name.',
      'val.min_card_holder': 'Cardholder name must be at least 2 characters.',
      'val.required_card_number': 'Please enter card number.',
      'val.invalid_card_number': 'Card number is invalid for the selected card type.',
      'val.card_type_mismatch': 'Card number does not match the selected card type.',
      'val.required_card_expiry': 'Please enter card expiry date.',
      'val.invalid_card_expiry': 'Invalid expiry format (MM/YY).',
      'val.card_expired': 'Card is expired.',
      'val.required_card_cvv': 'Please enter CVV.',
      'val.invalid_card_cvv': 'CVV must contain exactly {n} digits.',
      'val.required_title': 'Please enter a title.',
      'val.required_brand': 'Please select a make.',
      'val.required_model': 'Please enter the model.',
      'val.invalid_year': 'Year must be from 1990 to {max}.',
      'val.invalid_price': 'Price must be greater than 0.',
      'val.invalid_mileage': 'Mileage must be >= 0.',
      'val.required_desc': 'Please enter a description.',

      /* ---------- theme ---------- */
      'theme.dark': 'Dark',
      'theme.light': 'Light',
      'theme.switch_dark': 'Switch to dark mode',
      'theme.switch_light': 'Switch to light mode'
    }
  };

  /* ===========================
     CORE FUNCTIONS
     =========================== */

  var currentLocale = DEFAULT_LOCALE;

  function getLocale() {
    return currentLocale;
  }

  function setLocale(locale) {
    if (SUPPORTED.indexOf(locale) === -1) {
      console.warn('[I18n] Unsupported locale: ' + locale + ', falling back to ' + DEFAULT_LOCALE);
      locale = DEFAULT_LOCALE;
    }
    currentLocale = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (e) { /* ignore */ }
    document.documentElement.lang = locale;
    applyTranslations();
    updateSwitcherUI();

    try {
      document.dispatchEvent(new CustomEvent('autoluxe:locale-changed', { detail: { locale: locale } }));
    } catch (e) { /* ignore */ }
  }

  function getLocaleTag(locale) {
    var candidate = locale;
    if (SUPPORTED.indexOf(candidate) === -1) {
      candidate = currentLocale;
    }
    if (SUPPORTED.indexOf(candidate) === -1) {
      candidate = DEFAULT_LOCALE;
    }
    return LOCALE_TAGS[candidate] || LOCALE_TAGS[DEFAULT_LOCALE];
  }

  function normalizeFormattedText(value) {
    return String(value || '').replace(/\u00A0/g, ' ');
  }

  function toDate(value) {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    var parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  }

  function formatCurrency(usdAmount, options) {
    var opts = options || {};
    var locale = opts.locale;
    if (SUPPORTED.indexOf(locale) === -1) locale = currentLocale;
    if (SUPPORTED.indexOf(locale) === -1) locale = DEFAULT_LOCALE;

    var amount = Number(usdAmount);
    if (!isFinite(amount)) amount = 0;

    var localeTag = getLocaleTag(locale);

    try {
      if (locale === 'vi') {
        var vnd = Math.round(amount * USD_TO_VND_RATE);
        return normalizeFormattedText(
          new Intl.NumberFormat(localeTag, {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(vnd)
        );
      }

      var minDigits = typeof opts.minimumFractionDigits === 'number'
        ? opts.minimumFractionDigits
        : (Math.round(amount) === amount ? 0 : 2);
      var maxDigits = typeof opts.maximumFractionDigits === 'number'
        ? opts.maximumFractionDigits
        : 2;

      return normalizeFormattedText(
        new Intl.NumberFormat(localeTag, {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: minDigits,
          maximumFractionDigits: maxDigits
        }).format(amount)
      );
    } catch (e) {
      if (locale === 'vi') {
        return normalizeFormattedText(Math.round(amount * USD_TO_VND_RATE).toLocaleString('vi-VN')) + ' ₫';
      }
      return '$' + Number(amount).toLocaleString('en-US');
    }
  }

  function formatNumber(value, options) {
    var opts = options || {};
    var locale = opts.locale;
    if (SUPPORTED.indexOf(locale) === -1) locale = currentLocale;
    if (SUPPORTED.indexOf(locale) === -1) locale = DEFAULT_LOCALE;

    var number = Number(value);
    if (!isFinite(number)) number = 0;

    var numberFormatOptions = {};
    for (var key in opts) {
      if (!opts.hasOwnProperty(key)) continue;
      if (key === 'locale') continue;
      numberFormatOptions[key] = opts[key];
    }

    try {
      return normalizeFormattedText(new Intl.NumberFormat(getLocaleTag(locale), numberFormatOptions).format(number));
    } catch (e) {
      return number.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN');
    }
  }

  function formatDateTime(value, options) {
    var opts = options || {};
    var locale = opts.locale;
    if (SUPPORTED.indexOf(locale) === -1) locale = currentLocale;
    if (SUPPORTED.indexOf(locale) === -1) locale = DEFAULT_LOCALE;

    var date = toDate(value);
    if (!date) return '-';

    var dateTimeOptions = {};
    var hasCustom = false;
    for (var key in opts) {
      if (!opts.hasOwnProperty(key)) continue;
      if (key === 'locale') continue;
      dateTimeOptions[key] = opts[key];
      hasCustom = true;
    }

    if (!hasCustom) {
      dateTimeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
    }

    try {
      return normalizeFormattedText(new Intl.DateTimeFormat(getLocaleTag(locale), dateTimeOptions).format(date));
    } catch (e) {
      return '-';
    }
  }

  function formatDate(value, options) {
    var opts = options || {};
    var dateOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    for (var key in opts) {
      if (!opts.hasOwnProperty(key)) continue;
      dateOptions[key] = opts[key];
    }
    return formatDateTime(value, dateOptions);
  }

  function formatRelativeTime(value, options) {
    var opts = options || {};
    var locale = opts.locale;
    if (SUPPORTED.indexOf(locale) === -1) locale = currentLocale;
    if (SUPPORTED.indexOf(locale) === -1) locale = DEFAULT_LOCALE;

    var date = toDate(value);
    if (!date) return '';

    var nowMs = typeof opts.nowMs === 'number' ? opts.nowMs : Date.now();
    var diffSeconds = Math.round((date.getTime() - nowMs) / 1000);
    var absSeconds = Math.abs(diffSeconds);

    if (absSeconds < 30) {
      return t('notif.time_just_now');
    }

    var unit = 'second';
    var amount = diffSeconds;

    if (absSeconds >= 2592000) {
      unit = 'month';
      amount = Math.round(diffSeconds / 2592000);
    } else if (absSeconds >= 86400) {
      unit = 'day';
      amount = Math.round(diffSeconds / 86400);
    } else if (absSeconds >= 3600) {
      unit = 'hour';
      amount = Math.round(diffSeconds / 3600);
    } else if (absSeconds >= 60) {
      unit = 'minute';
      amount = Math.round(diffSeconds / 60);
    }

    try {
      var rtf = new Intl.RelativeTimeFormat(getLocaleTag(locale), { numeric: 'auto' });
      return normalizeFormattedText(rtf.format(amount, unit));
    } catch (e) {
      if (amount <= -1 && unit === 'minute') return t('notif.time_min', { n: Math.abs(amount) });
      if (amount <= -1 && unit === 'hour') return t('notif.time_hour', { n: Math.abs(amount) });
      if (amount <= -1 && unit === 'day') return t('notif.time_day', { n: Math.abs(amount) });
      if (amount <= -1 && unit === 'month') return t('notif.time_month', { n: Math.abs(amount) });
      return t('notif.time_just_now');
    }
  }

  /**
   * Translate a key with optional interpolation params.
   * Fallback chain: currentLocale -> vi -> en -> key itself
   */
  function t(key, params) {
    var value = null;

    // 1. Try current locale
    if (dict[currentLocale] && dict[currentLocale][key] !== undefined) {
      value = dict[currentLocale][key];
    }
    // 2. Fallback to VI
    if (value === null && currentLocale !== 'vi' && dict.vi && dict.vi[key] !== undefined) {
      value = dict.vi[key];
    }
    // 3. Fallback to EN
    if (value === null && currentLocale !== 'en' && dict.en && dict.en[key] !== undefined) {
      value = dict.en[key];
    }
    // 4. Return friendly fallback instead of raw key
    if (value === null) {
      console.warn('[I18n] Missing key: "' + key + '" for locale: "' + currentLocale + '"');
      var genericFallback = (dict[currentLocale] && dict[currentLocale]['common.updating'])
        || (dict.vi && dict.vi['common.updating'])
        || 'Đang cập nhật';
      return genericFallback;
    }

    // Interpolate {param}
    if (params) {
      for (var p in params) {
        if (params.hasOwnProperty(p)) {
          value = value.split('{' + p + '}').join(String(params[p]));
        }
      }
    }

    return value;
  }

  /**
   * Apply translations to all elements with data-i18n attributes.
   * @param {Element} root - optional root element, defaults to document
   */
  function applyTranslations(root) {
    root = root || document;

    // data-i18n -> textContent (supports HTML via innerHTML for keys containing HTML)
    var els = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (!key) continue;
      var translated = t(key);
      // Use innerHTML if the translation contains HTML tags
      if (translated.indexOf('<') !== -1 && translated.indexOf('>') !== -1) {
        els[i].innerHTML = translated;
      } else {
        els[i].textContent = translated;
      }
    }

    // data-i18n-html -> innerHTML (explicit HTML)
    var htmlEls = root.querySelectorAll('[data-i18n-html]');
    for (var h = 0; h < htmlEls.length; h++) {
      var hKey = htmlEls[h].getAttribute('data-i18n-html');
      if (hKey) htmlEls[h].innerHTML = t(hKey);
    }

    // data-i18n-placeholder
    var phEls = root.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phEls.length; j++) {
      var phKey = phEls[j].getAttribute('data-i18n-placeholder');
      if (phKey) phEls[j].placeholder = t(phKey);
    }

    // data-i18n-title
    var titleEls = root.querySelectorAll('[data-i18n-title]');
    for (var k = 0; k < titleEls.length; k++) {
      var tKey = titleEls[k].getAttribute('data-i18n-title');
      if (tKey) titleEls[k].title = t(tKey);
    }

    // data-i18n-aria-label
    var ariaEls = root.querySelectorAll('[data-i18n-aria-label]');
    for (var m = 0; m < ariaEls.length; m++) {
      var aKey = ariaEls[m].getAttribute('data-i18n-aria-label');
      if (aKey) ariaEls[m].setAttribute('aria-label', t(aKey));
    }

    // data-i18n-alt
    var altEls = root.querySelectorAll('[data-i18n-alt]');
    for (var n = 0; n < altEls.length; n++) {
      var altKey = altEls[n].getAttribute('data-i18n-alt');
      if (altKey) altEls[n].alt = t(altKey);
    }

    // title[data-i18n-page-title]
    var pageTitleEl = document.querySelector('title[data-i18n-page-title]');
    if (pageTitleEl) {
      var pageTitleKey = pageTitleEl.getAttribute('data-i18n-page-title');
      if (pageTitleKey) document.title = t(pageTitleKey);
    }
  }

  /* ===========================
     LANGUAGE SWITCHER
     =========================== */

  function injectSwitcher() {
    if (typeof Auth !== 'undefined' && typeof Auth.isLoggedIn === 'function' && Auth.isLoggedIn()) {
      return;
    }

    var headers = document.querySelectorAll('.site-header__cta');
    for (var i = 0; i < headers.length; i++) {
      var cta = headers[i];
      if (cta.querySelector('.lang-switch')) continue;

      var switcher = document.createElement('div');
      switcher.className = 'lang-switch';
      switcher.innerHTML =
        '<button class="lang-switch__btn' + (currentLocale === 'vi' ? ' is-active' : '') + '" data-lang="vi">VI</button>' +
        '<button class="lang-switch__btn' + (currentLocale === 'en' ? ' is-active' : '') + '" data-lang="en">EN</button>';

      // Insert before the first child (before theme toggle)
      cta.insertBefore(switcher, cta.firstChild);

      switcher.addEventListener('click', function (e) {
        var btn = e.target.closest('.lang-switch__btn');
        if (!btn) return;
        var lang = btn.getAttribute('data-lang');
        if (lang && lang !== currentLocale) {
          setLocale(lang);
        }
      });
    }
  }

  function updateSwitcherUI() {
    var btns = document.querySelectorAll('.lang-switch__btn');
    for (var i = 0; i < btns.length; i++) {
      var lang = btns[i].getAttribute('data-lang');
      if (lang === currentLocale) {
        btns[i].classList.add('is-active');
      } else {
        btns[i].classList.remove('is-active');
      }
    }
  }

  /* ===========================
     INIT
     =========================== */

  function initI18n() {
    // Read saved locale
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) {
        currentLocale = saved;
      }
    } catch (e) { /* ignore */ }

    document.documentElement.lang = currentLocale;
    injectSwitcher();
    applyTranslations();
  }

  /* ===========================
     PUBLIC API
     =========================== */

  return {
    getLocale: getLocale,
    getLocaleTag: getLocaleTag,
    setLocale: setLocale,
    t: t,
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatRelativeTime: formatRelativeTime,
    USD_TO_VND_RATE: USD_TO_VND_RATE,
    applyTranslations: applyTranslations,
    initI18n: initI18n,
    injectSwitcher: injectSwitcher,
    updateSwitcherUI: updateSwitcherUI
  };
})();

// Global shortcut for I18n.t
function _t(key, params) {
  return (typeof I18n !== 'undefined') ? I18n.t(key, params) : key;
}
