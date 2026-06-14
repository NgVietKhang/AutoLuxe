/* =============================================
   CAR-DATA.JS - AutoLuxe Supercar Web
   Primary specs source (HP, top speed, 0-100, engine).
   No paid API required — extend CAR_DATABASE for new models.
   ============================================= */

var PLACEHOLDER_IMAGE = '../assets/images/cars/placeholder.svg';

var BrandModelNormalize = (function () {
  'use strict';

  function normalizeToken(value) {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function normalizePair(make, model) {
    return {
      make: normalizeToken(make),
      model: normalizeToken(model)
    };
  }

  function isExactMatch(left, right) {
    return normalizeToken(left) === normalizeToken(right);
  }

  function buildStableId(make, model) {
    var pair = normalizePair(make, model);
    var raw = (pair.make + '-' + pair.model).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return raw || 'updating-car';
  }

  function slugify(value) {
    return normalizeToken(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  return {
    normalizeToken: normalizeToken,
    normalizePair: normalizePair,
    isExactMatch: isExactMatch,
    buildStableId: buildStableId,
    slugify: slugify
  };
})();

var CarImagePaths = (function () {
  'use strict';

  var BASE_PATH = '../assets/images/cars/';
  var EXTENSIONS = ['jpg', 'jpeg', 'webp', 'png'];

  function stripAccents(value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function slugWithDots(value) {
    return stripAccents(value)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function slugPreserveAccents(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFC')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.\-\u00c0-\u024f]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function buildModelSlugVariants(model) {
    var variants = [];
    var seen = {};

    function add(slug) {
      if (!slug || seen[slug]) return;
      seen[slug] = true;
      variants.push(slug);
    }

    var plain = stripAccents(model).toLowerCase().replace(/\s+/g, ' ').trim();

    add(slugPreserveAccents(model));
    add(slugWithDots(model));
    add(slugWithDots(plain));
    add(BrandModelNormalize.slugify(plain));
    add(BrandModelNormalize.slugify(model));

    var snapshot = variants.slice();
    snapshot.forEach(function (slug) {
      add(slug.replace(/-/g, '_'));
    });

    return variants;
  }

  function isValidHeroImage(url, placeholder) {
    if (!url || typeof url !== 'string') return false;
    var trimmed = url.trim();
    if (!trimmed) return false;
    return trimmed !== placeholder;
  }

  function buildBrandFolderImageCandidates(make, model) {
    var brandSlug = BrandModelNormalize.slugify(make);
    if (!brandSlug) return [];

    var list = [];
    var seen = {};
    buildModelSlugVariants(model).forEach(function (modelSlug) {
      EXTENSIONS.forEach(function (ext) {
        var url = BASE_PATH + brandSlug + '/' + modelSlug + '.' + ext;
        if (!seen[url]) {
          seen[url] = true;
          list.push(url);
        }
      });
    });
    return list;
  }

  function buildRootImageCandidates(make, model) {
    var brandSlug = BrandModelNormalize.slugify(make);
    if (!brandSlug) return [];

    var list = [];
    var seen = {};
    buildModelSlugVariants(model).forEach(function (modelSlug) {
      EXTENSIONS.forEach(function (ext) {
        [brandSlug + '_' + modelSlug, brandSlug + '-' + modelSlug].forEach(function (base) {
          var url = BASE_PATH + base + '.' + ext;
          if (!seen[url]) {
            seen[url] = true;
            list.push(url);
          }
        });
      });
    });
    return list;
  }

  function buildImageCandidates(make, model) {
    var list = [];
    var seen = {};

    function pushUnique(url) {
      if (!url || seen[url]) return;
      seen[url] = true;
      list.push(url);
    }

    buildBrandFolderImageCandidates(make, model).forEach(pushUnique);
    buildRootImageCandidates(make, model).forEach(pushUnique);
    return list;
  }

  function resolveImage(make, model, options) {
    options = options || {};
    var placeholder = options.placeholder || PLACEHOLDER_IMAGE;
    var list = [];
    var seen = {};

    function pushUnique(url) {
      if (!url || seen[url]) return;
      seen[url] = true;
      list.push(url);
    }

    buildImageCandidates(make, model).forEach(pushUnique);

    if (typeof getCarByMakeModel === 'function') {
      var localCar = getCarByMakeModel(make, model);
      if (localCar && isValidHeroImage(localCar.heroImage, placeholder)) {
        pushUnique(localCar.heroImage);
      }
    }

    pushUnique(placeholder);

    var primary = list[0] || placeholder;
    return {
      primary: primary,
      fallbacks: list.slice(1),
      candidates: list
    };
  }

  return {
    buildBrandFolderImageCandidates: buildBrandFolderImageCandidates,
    buildRootImageCandidates: buildRootImageCandidates,
    buildImageCandidates: buildImageCandidates,
    resolveImage: resolveImage
  };
})();

var CAR_DATABASE = [
  {
    id: 'ferrari-sf90-stradale',
    make: 'Ferrari',
    model: 'SF90 Stradale',
    aliases: ['SF90', 'SF90 Stradale', 'SF90 Spider'],
    year: 2024,
    horsepower: 986,
    topSpeed: '340 km/h',
    zeroToHundred: '2.5s',
    engine: 'V8 Twin-Turbo Hybrid',
    drivetrain: 'AWD',
    torque: '800 Nm',
    weight: '1,570 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,710 x 1,972 x 1,186 mm',
    fuelType: 'Petrol / Plug-in Hybrid',
    bodyType: 'Coupe',
    priceUSD: 625000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Hybrid supercar với 986 mã lực, tăng tốc 0-100km/h trong 2.5 giây.',
    longDescription: 'Ferrari SF90 Stradale là mẫu siêu xe hybrid plug-in đầu tiên của Ferrari, kết hợp động cơ V8 twin-turbo 4.0L với ba motor điện tạo ra tổng công suất 986 mã lực. Đây là chiếc Ferrari sản xuất hàng loạt mạnh nhất từ trước đến nay, mang đến trải nghiệm lái không tưởng với khả năng tăng tốc ngoạn mục và công nghệ đỉnh cao từ đường đua F1. Hệ thống hybrid cho phép xe chạy thuần điện trong phạm vi 25km, trong khi chế độ Qualify mở khóa toàn bộ sức mạnh cho trải nghiệm tốc độ thuần túy.',
    heroImage: '../assets/images/cars/ferrari-sf90-stradale.jpg',
    gallery: [
      '../assets/images/cars/ferrari-sf90-stradale-1.jpg',
      '../assets/images/cars/ferrari-sf90-stradale-2.jpg',
      '../assets/images/cars/ferrari-sf90-stradale-3.jpg'
    ]
  },
  {
    id: 'ferrari-296-gtb',
    make: 'Ferrari',
    model: '296 GTB',
    year: 2024,
    horsepower: 830,
    topSpeed: '330 km/h',
    zeroToHundred: '2.9s',
    engine: 'V6 Twin-Turbo Hybrid',
    drivetrain: 'RWD',
    torque: '740 Nm',
    weight: '1,470 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,565 x 1,958 x 1,187 mm',
    fuelType: 'Petrol / Plug-in Hybrid',
    bodyType: 'Coupe',
    priceUSD: 420000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'V6 hybrid mới của Ferrari với 830 mã lực và thiết kế gợi nhớ huyền thoại Dino.',
    longDescription: 'Ferrari 296 GTB đánh dấu sự trở lại của động cơ V6 trong lịch sử Ferrari, nhưng lần này được trang bị công nghệ hybrid tiên tiến. Với tổng công suất 830 mã lực từ động cơ V6 twin-turbo 3.0L kết hợp motor điện, chiếc xe mang đến trải nghiệm lái thuần khiết và phấn khích. Thiết kế lấy cảm hứng từ huyền thoại 250 LM và Dino 206 S, tạo nên vẻ đẹp vượt thời gian.',
    heroImage: '../assets/images/cars/ferrari/296-gtb.jpg',
    gallery: [
      '../assets/images/cars/ferrari-296-gtb-1.jpg',
      '../assets/images/cars/ferrari-296-gtb-2.jpg'
    ]
  },
  {
    id: 'lamborghini-revuelto',
    make: 'Lamborghini',
    model: 'Revuelto',
    aliases: ['Revuelto', 'LB744'],
    year: 2024,
    horsepower: 1015,
    topSpeed: '350 km/h',
    zeroToHundred: '2.5s',
    engine: 'V12 Hybrid',
    drivetrain: 'AWD',
    torque: '725 Nm',
    weight: '1,772 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,947 x 2,066 x 1,160 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 600000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'V12 hybrid mạnh mẽ nhất lịch sử Lamborghini với 1015 mã lực.',
    longDescription: 'Lamborghini Revuelto là siêu xe hybrid V12 đầu tiên của Lamborghini, kế thừa di sản của Aventador với công nghệ hoàn toàn mới. Động cơ V12 hút khí tự nhiên 6.5L kết hợp 3 motor điện tạo ra tổng công suất 1015 mã lực. Khung gầm carbon monocoque mới, hộp số ly hợp kép 8 cấp, và hệ dẫn động 4 bánh thông minh mang đến khả năng vận hành vượt trội so với bất kỳ Lamborghini nào trước đó.',
    heroImage: '../assets/images/cars/lamborghini-revuelto.jpg',
    gallery: [
      '../assets/images/cars/lamborghini-revuelto-1.jpg',
      '../assets/images/cars/lamborghini-revuelto-2.jpg',
      '../assets/images/cars/lamborghini-revuelto-3.jpg'
    ]
  },
  {
    id: 'lamborghini-huracan-sto',
    make: 'Lamborghini',
    model: 'Huracán STO',
    year: 2023,
    horsepower: 640,
    topSpeed: '310 km/h',
    zeroToHundred: '3.0s',
    engine: 'V10 5.2L',
    drivetrain: 'RWD',
    torque: '565 Nm',
    weight: '1,339 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,549 x 1,945 x 1,220 mm',
    fuelType: 'Petrol',
    bodyType: 'Coupe',
    priceUSD: 330000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Phiên bản đường đua thuần túy của Huracán với khí động học từ Super Trofeo.',
    longDescription: 'Lamborghini Huracán STO (Super Trofeo Omologata) là phiên bản đường phố của chiếc xe đua Super Trofeo EVO và GT3 EVO. Với động cơ V10 hút khí tự nhiên 5.2L sản sinh 640 mã lực, hệ dẫn động cầu sau, và trọng lượng giảm đáng kể nhờ vật liệu carbon fiber, Huracán STO mang đến trải nghiệm lái gần nhất với xe đua thực thụ mà vẫn hợp pháp trên đường phố.',
    heroImage: '../assets/images/cars/lamborghini-huracan-sto.jpg',
    gallery: [
      '../assets/images/cars/lamborghini-huracan-sto-1.jpg',
      '../assets/images/cars/lamborghini-huracan-sto-2.jpg'
    ]
  },
  {
    id: 'mclaren-750s',
    make: 'McLaren',
    model: '750S',
    year: 2024,
    horsepower: 750,
    topSpeed: '332 km/h',
    zeroToHundred: '2.8s',
    engine: 'V8 Twin-Turbo 4.0L',
    drivetrain: 'RWD',
    torque: '800 Nm',
    weight: '1,389 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,569 x 1,930 x 1,196 mm',
    fuelType: 'Petrol',
    bodyType: 'Coupe',
    priceUSD: 375000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Siêu phẩm từ Woking với 750PS và trọng lượng siêu nhẹ.',
    longDescription: 'McLaren 750S là sự nâng cấp toàn diện của 720S, với động cơ V8 twin-turbo 4.0L được tinh chỉnh lên 750PS (740 mã lực). Nhẹ hơn 30kg so với người tiền nhiệm, 750S sở hữu tỷ lệ công suất/trọng lượng ấn tượng. Khung gầm carbon monocoque, hệ thống treo Proactive Chassis Control II, và khí động học cải tiến mang đến sự cân bằng hoàn hảo giữa hiệu suất và sự thoải mái hàng ngày.',
    heroImage: '../assets/images/cars/mclaren-750s.jpg',
    gallery: [
      '../assets/images/cars/mclaren-750s-1.jpg',
      '../assets/images/cars/mclaren-750s-2.jpg',
      '../assets/images/cars/mclaren-750s-3.jpg'
    ]
  },
  {
    id: 'mclaren-artura',
    make: 'McLaren',
    model: 'Artura',
    year: 2024,
    horsepower: 680,
    topSpeed: '330 km/h',
    zeroToHundred: '3.0s',
    engine: 'V6 Twin-Turbo Hybrid',
    drivetrain: 'RWD',
    torque: '720 Nm',
    weight: '1,395 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,539 x 1,913 x 1,193 mm',
    fuelType: 'Petrol / Plug-in Hybrid',
    bodyType: 'Coupe',
    priceUSD: 250000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Siêu xe hybrid thế hệ mới của McLaren với kiến trúc carbon hoàn toàn mới.',
    longDescription: 'McLaren Artura là siêu xe hybrid đầu tiên của McLaren, xây dựng trên nền tảng McLaren Carbon Lightweight Architecture (MCLA) hoàn toàn mới. Động cơ V6 twin-turbo 3.0L kết hợp motor điện tạo ra 680 mã lực. Với trọng lượng chỉ 1.395kg, Artura là minh chứng cho triết lý nhẹ và hiệu quả của McLaren, đồng thời mở ra kỷ nguyên điện hóa cho thương hiệu.',
    heroImage: '../assets/images/cars/mclaren-artura.jpg',
    gallery: [
      '../assets/images/cars/mclaren-artura-1.jpg',
      '../assets/images/cars/mclaren-artura-2.jpg'
    ]
  },
  {
    id: 'porsche-911-gt3-rs',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    horsepower: 525,
    topSpeed: '296 km/h',
    zeroToHundred: '3.2s',
    engine: 'Flat-6 4.0L',
    drivetrain: 'RWD',
    torque: '465 Nm',
    weight: '1,450 kg',
    transmission: '7-speed PDK',
    seats: 2,
    doors: 2,
    dimensions: '4,572 x 1,900 x 1,282 mm',
    fuelType: 'Petrol',
    bodyType: 'Coupe',
    priceUSD: 310000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Chiếc 911 thuần chất đường đua nhất với khí động học chủ động.',
    longDescription: 'Porsche 911 GT3 RS (992) là đỉnh cao của dòng 911 về khả năng vận hành trên đường đua. Với động cơ flat-6 hút khí tự nhiên 4.0L sản sinh 525 mã lực tại 8.500 vòng/phút, cánh gió chủ động DRS tạo ra lực ép 409kg ở tốc độ 200km/h, và trọng lượng chỉ 1.450kg, GT3 RS là chiếc xe đường phố gần nhất với xe đua GT3 Cup. Mỗi chi tiết đều được tối ưu hóa cho tốc độ thuần túy.',
    heroImage: '../assets/images/cars/porsche_gt3_rs.jpg',
    gallery: [
      '../assets/images/cars/porsche-911-gt3-rs-1.jpg',
      '../assets/images/cars/porsche-911-gt3-rs-2.jpg',
      '../assets/images/cars/porsche-911-gt3-rs-3.jpg'
    ]
  },
  {
    id: 'porsche-918-spyder',
    make: 'Porsche',
    model: '918 Spyder',
    year: 2015,
    horsepower: 887,
    topSpeed: '345 km/h',
    zeroToHundred: '2.6s',
    engine: 'V8 4.6L Hybrid',
    drivetrain: 'AWD',
    torque: '1,280 Nm',
    weight: '1,675 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,643 x 1,940 x 1,167 mm',
    fuelType: 'Petrol / Plug-in Hybrid',
    bodyType: 'Spyder',
    priceUSD: 850000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Hypercar hybrid huyền thoại của Porsche với công nghệ từ Le Mans.',
    longDescription: 'Porsche 918 Spyder là một trong bộ ba hypercar Holy Trinity cùng thời với LaFerrari và McLaren P1. Với động cơ V8 4.6L kết hợp hai motor điện tạo ra tổng công suất 887 mã lực, 918 Spyder đã thiết lập kỷ lục tại Nürburgring Nordschleife với thời gian 6:57. Chỉ 918 chiếc được sản xuất, biến nó thành một trong những chiếc Porsche quý hiếm và đáng thèm muốn nhất mọi thời đại.',
    heroImage: '../assets/images/cars/porsche-918-spyder.jpg',
    gallery: [
      '../assets/images/cars/porsche-918-spyder-1.jpg',
      '../assets/images/cars/porsche-918-spyder-2.jpg'
    ]
  },
  {
    id: 'bugatti-chiron',
    make: 'Bugatti',
    model: 'Chiron',
    year: 2024,
    horsepower: 1500,
    topSpeed: '420 km/h',
    zeroToHundred: '2.4s',
    engine: 'W16 Quad-Turbo 8.0L',
    drivetrain: 'AWD',
    torque: '1,600 Nm',
    weight: '1,995 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,544 x 2,038 x 1,212 mm',
    fuelType: 'Petrol',
    bodyType: 'Coupe',
    priceUSD: 3200000,
    brakes: 'Carbon-ceramic',
    shortDescription: '1500 mã lực, tốc độ tối đa 420km/h — đỉnh cao kỹ thuật ô tô.',
    longDescription: 'Bugatti Chiron là hiện thân của sự xa xỉ và hiệu suất tối thượng. Động cơ W16 quad-turbo 8.0L sản sinh 1.500 mã lực và 1.600 Nm mô-men xoắn, đưa chiếc xe từ 0 lên 100km/h trong 2.4 giây và đạt tốc độ tối đa 420km/h (giới hạn điện tử). Nội thất được chế tác thủ công với những vật liệu quý hiếm nhất, mỗi chiếc Chiron là sự kết hợp hoàn hảo giữa nghệ thuật và công nghệ.',
    heroImage: '../assets/images/cars/bugatti-chiron.jpg',
    gallery: [
      '../assets/images/cars/bugatti-chiron-1.jpg',
      '../assets/images/cars/bugatti-chiron-2.jpg',
      '../assets/images/cars/bugatti-chiron-3.jpg'
    ]
  },
  {
    id: 'koenigsegg-jesko',
    make: 'Koenigsegg',
    model: 'Jesko',
    year: 2024,
    horsepower: 1600,
    topSpeed: '531 km/h',
    zeroToHundred: '2.5s',
    engine: 'V8 Twin-Turbo 5.0L',
    drivetrain: 'RWD',
    torque: '1,500 Nm',
    weight: '1,420 kg',
    transmission: '9-speed LST',
    seats: 2,
    doors: 2,
    dimensions: '4,610 x 2,030 x 1,210 mm',
    fuelType: 'Petrol / E85',
    bodyType: 'Coupe',
    priceUSD: 2850000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Megacar Thụy Điển với 1600 mã lực và tốc độ lý thuyết trên 500km/h.',
    longDescription: 'Koenigsegg Jesko là megacar được đặt theo tên cha của nhà sáng lập Christian von Koenigsegg. Với động cơ V8 twin-turbo 5.0L sản sinh 1.600 mã lực (sử dụng E85), hộp số Light Speed Transmission 9 cấp đa ly hợp độc quyền, và khí động học tạo ra 1.400kg lực ép, Jesko nhắm đến danh hiệu xe sản xuất nhanh nhất thế giới với tốc độ lý thuyết 531km/h.',
    heroImage: '../assets/images/cars/koenigsegg-jesko.jpg',
    gallery: [
      '../assets/images/cars/koenigsegg-jesko-1.jpg',
      '../assets/images/cars/koenigsegg-jesko-2.jpg'
    ]
  },
  {
    id: 'aston-martin-valkyrie',
    make: 'Aston Martin',
    model: 'Valkyrie',
    year: 2024,
    horsepower: 1160,
    topSpeed: '402 km/h',
    zeroToHundred: '2.5s',
    engine: 'V12 6.5L Hybrid',
    drivetrain: 'RWD',
    torque: '900 Nm',
    weight: '1,030 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,800 x 2,020 x 1,090 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 3000000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Hypercar với động cơ V12 Cosworth và khí động học F1 thuần túy.',
    longDescription: 'Aston Martin Valkyrie là sản phẩm hợp tác giữa Aston Martin và Red Bull Advanced Technologies, với mục tiêu tạo ra chiếc xe đường phố có hiệu suất ngang xe F1. Động cơ V12 hút khí tự nhiên 6.5L do Cosworth chế tạo đạt 11.100 vòng/phút, kết hợp motor điện Rimac tạo ra 1.160 mã lực. Thiết kế khí động học cực đoan của Adrian Newey tạo ra hơn 1.800kg lực ép mà không cần cánh gió lớn.',
    heroImage: '../assets/images/cars/aston-martin-valkyrie.jpg',
    gallery: [
      '../assets/images/cars/aston-martin-valkyrie-1.jpg',
      '../assets/images/cars/aston-martin-valkyrie-2.jpg'
    ]
  },
  {
    id: 'bugatti-bolide',
    make: 'Bugatti',
    model: 'Bolide',
    year: 2024,
    horsepower: 1850,
    topSpeed: '500 km/h',
    zeroToHundred: '2.2s',
    engine: 'W16 Quad-Turbo 8.0L',
    drivetrain: 'AWD',
    torque: '1,850 Nm',
    weight: '1,240 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,750 x 1,998 x 1,100 mm',
    fuelType: 'Petrol',
    bodyType: 'Track Coupe',
    priceUSD: 4000000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Track-only hypercar cực đoan nhất từ Bugatti với 1850 mã lực.',
    longDescription: 'Bugatti Bolide là chiếc xe đường đua thuần túy đầu tiên của Bugatti trong thời hiện đại. Dựa trên động cơ W16 8.0L nhưng được tinh chỉnh lên 1.850 mã lực, kết hợp thân xe carbon cực nhẹ chỉ 1.240kg, Bolide đạt tỷ lệ công suất/trọng lượng 1.49 mã lực/kg. Thiết kế khí động học tạo ra 2.600kg lực ép tại tốc độ 320km/h, biến Bolide thành cỗ máy tốc độ thuần túy không thỏa hiệp.',
    heroImage: '../assets/images/cars/bugatti_bolide.jpg',
    gallery: [
      '../assets/images/cars/bugatti-bolide-1.jpg',
      '../assets/images/cars/bugatti-bolide-2.jpg'
    ]
  },
  {
    id: 'bugatti-tourbillon',
    make: 'Bugatti',
    model: 'Tourbillon',
    aliases: ['Tourbillon', 'Bugatti Tourbillon'],
    year: 2026,
    horsepower: 1775,
    topSpeed: '445 km/h',
    zeroToHundred: '2.0s',
    engine: 'V16 Hybrid 8.3L',
    drivetrain: 'AWD',
    torque: '1,800 Nm',
    weight: '1,995 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,670 x 2,050 x 1,210 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 3600000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Kế thừa Chiron với V16 hybrid tự nhiên và 1775 mã lực.',
    longDescription: 'Bugatti Tourbillon là thế hệ hypercar mới thay thế Chiron, trang bị động cơ V16 hút khí tự nhiên 8.3L kết hợp ba motor điện cho tổng công suất 1.775 mã lực. Khung carbon và thiết kế nội thất đồng hồ Tourbillon thể hiện di sản thủ công của Molsheim trong kỷ nguyên hybrid hiệu suất cao.',
    heroImage: '../assets/images/cars/bugatti_tourbillon.jpg',
    gallery: [
      '../assets/images/cars/bugatti-tourbillon-1.jpg',
      '../assets/images/cars/bugatti-tourbillon-2.jpg'
    ]
  },
  {
    id: 'ferrari-purosangue',
    make: 'Ferrari',
    model: 'Purosangue',
    year: 2024,
    horsepower: 725,
    topSpeed: '310 km/h',
    zeroToHundred: '3.3s',
    engine: 'V12 6.5L',
    drivetrain: 'AWD',
    torque: '716 Nm',
    weight: '2,033 kg',
    transmission: '8-speed DCT',
    seats: 4,
    doors: 4,
    dimensions: '4,970 x 2,028 x 1,589 mm',
    fuelType: 'Petrol',
    bodyType: 'SUV / Crossover',
    priceUSD: 400000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Ferrari bốn cửa đầu tiên với V12 hút khí tự nhiên và AWD.',
    longDescription: 'Ferrari Purosangue mang động cơ V12 6.5L hút khí tự nhiên 725 mã lực lên nền tảng gầm cao, kết hợp hệ dẫn động bốn bánh và không gian bốn chỗ. Đây là cách Ferrari mở rộng danh mục mà vẫn giữ DNA hiệu suất và âm thanh V12 đặc trưng.',
    heroImage: '../assets/images/cars/ferrari-purosangue.jpg',
    gallery: [
      '../assets/images/cars/ferrari-purosangue-1.jpg',
      '../assets/images/cars/ferrari-purosangue-2.jpg'
    ]
  },
  {
    id: 'ferrari-daytona-sp3',
    make: 'Ferrari',
    model: 'Daytona SP3',
    aliases: ['Daytona SP3', 'SP3'],
    year: 2024,
    horsepower: 829,
    topSpeed: '340 km/h',
    zeroToHundred: '2.85s',
    engine: 'V12 6.5L',
    drivetrain: 'RWD',
    torque: '697 Nm',
    weight: '1,485 kg',
    transmission: '7-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,686 x 1,976 x 1,136 mm',
    fuelType: 'Petrol',
    bodyType: 'Targa / Spider',
    priceUSD: 2200000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Icona Series với V12 829 mã lực và thiết kế lấy cảm hứng Daytona.',
    longDescription: 'Ferrari Daytona SP3 thuộc dòng Icona, sử dụng động cơ V12 6.5L từ 812 Competizione với 829 mã lực. Thiết kế gợi nhớ 330 P3/4 và 512 S, trong khi khung carbon và hệ thống treo mang lại trải nghiệm lái hiện đại.',
    heroImage: '../assets/images/cars/ferrari/296-gtb.jpg',
    gallery: [
      '../assets/images/cars/ferrari-296-gtb-1.jpg',
      '../assets/images/cars/ferrari-296-gtb-2.jpg'
    ]
  },
  {
    id: 'lamborghini-temerario',
    make: 'Lamborghini',
    model: 'Temerario',
    aliases: ['Temerario', 'Huracán successor'],
    year: 2025,
    horsepower: 920,
    topSpeed: '343 km/h',
    zeroToHundred: '2.7s',
    engine: 'V8 Twin-Turbo Hybrid',
    drivetrain: 'AWD',
    torque: '800 Nm',
    weight: '1,750 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,700 x 1,996 x 1,198 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 290000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Siêu xe hybrid V8 thay thế Huracán với 920 mã lực.',
    longDescription: 'Lamborghini Temerario kế nhiệm Huracán với động cơ V8 twin-turbo 4.0L và hệ hybrid, tổng công suất 920 mã lực. Khung aluminum spaceframe và thiết kế hexagon mới định hình dòng entry supercar của Sant\'Agata.',
    heroImage: '../assets/images/cars/lamborghini-temerario.jpg',
    gallery: [
      '../assets/images/cars/lamborghini-temerario-1.jpg',
      '../assets/images/cars/lamborghini-temerario-2.jpg'
    ]
  },
  {
    id: 'porsche-911-gt3',
    make: 'Porsche',
    model: '911 GT3',
    aliases: ['911 GT3', '992 GT3'],
    year: 2024,
    horsepower: 510,
    topSpeed: '318 km/h',
    zeroToHundred: '3.4s',
    engine: 'Flat-6 4.0L',
    drivetrain: 'RWD',
    torque: '470 Nm',
    weight: '1,418 kg',
    transmission: '7-speed PDK / 6-speed Manual',
    seats: 2,
    doors: 2,
    dimensions: '4,573 x 1,852 x 1,279 mm',
    fuelType: 'Petrol',
    bodyType: 'Coupe',
    priceUSD: 200000,
    brakes: 'Cast-iron / Carbon-ceramic optional',
    shortDescription: '911 GT3 bản tiêu chuẩn với flat-six 510 mã lực và khả năng track-day.',
    longDescription: 'Porsche 911 GT3 (992.2) dùng động cơ flat-six hút khí tự nhiên 4.0L 510 mã lực, hộp số PDK hoặc sáu cấp thủ công. Là lựa chọn cân bằng giữa GT3 RS cực đoan và 911 Carrera hàng ngày.',
    heroImage: '../assets/images/cars/porsche_911_gt3.jpg',
    gallery: [
      '../assets/images/cars/porsche-911-gt3-1.jpg',
      '../assets/images/cars/porsche-911-gt3-2.jpg'
    ]
  },
  {
    id: 'mclaren-w1',
    make: 'McLaren',
    model: 'W1',
    aliases: ['W1', 'McLaren W1'],
    year: 2025,
    horsepower: 1258,
    topSpeed: '350 km/h',
    zeroToHundred: '2.7s',
    engine: 'V8 Twin-Turbo Hybrid',
    drivetrain: 'RWD',
    torque: '1,100 Nm',
    weight: '1,399 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,650 x 1,980 x 1,180 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 2100000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Hypercar kế thừa P1 với 1258 mã lực và công nghệ F1.',
    longDescription: 'McLaren W1 là hypercar hybrid thay thế P1, kết hợp V8 twin-turbo với motor điện cho 1.258 mã lực. Anima mode, khí động học chủ động và carbon monocoque tiếp nối di sản Ultimate Series của Woking.',
    heroImage: '../assets/images/cars/mclaren-w1.jpg',
    gallery: [
      '../assets/images/cars/mclaren-w1-1.jpg',
      '../assets/images/cars/mclaren-w1-2.jpg'
    ]
  },
  {
    id: 'lamborghini-venevo',
    make: 'Lamborghini',
    model: 'Venevo',
    aliases: ['Venevo'],
    year: 2024,
    horsepower: 1015,
    topSpeed: '350 km/h',
    zeroToHundred: '2.5s',
    engine: 'V12 Hybrid',
    drivetrain: 'AWD',
    torque: '1,050 Nm',
    weight: '1,650 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,950 x 2,100 x 1,160 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 3500000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'V12 hybrid 1.015 mã lực — sức mạnh và thiết kế tương lai.',
    longDescription: 'Lamborghini Venevo là hypercar hybrid đột phá, kết hợp động cơ V12 tự nhiên với hệ thống hybrid tiên tiến cho tổng công suất 1.015 mã lực. Thiết kế khí động học tương lai và hiệu suất đường đua đỉnh cao.',
    heroImage: '../assets/images/cars/lamborghini_venevo.jpg',
    gallery: [
      '../assets/images/cars/lamborghini_venevo.jpg'
    ]
  },
  {
    id: 'lamborghini-ferzor',
    make: 'Lamborghini',
    model: 'Ferzor',
    aliases: ['Ferzor'],
    year: 2024,
    horsepower: 920,
    topSpeed: '340 km/h',
    zeroToHundred: '2.8s',
    engine: 'V8 Twin-Turbo Hybrid',
    drivetrain: 'AWD',
    torque: '950 Nm',
    weight: '1,580 kg',
    transmission: '8-speed DCT',
    seats: 2,
    doors: 2,
    dimensions: '4,800 x 2,050 x 1,180 mm',
    fuelType: 'Petrol / Hybrid',
    bodyType: 'Coupe',
    priceUSD: 2800000,
    brakes: 'Carbon-ceramic',
    shortDescription: 'Twin-turbo V8 hybrid 920 mã lực, tăng tốc và khí động học đỉnh cao.',
    longDescription: 'Lamborghini Ferzor sở hữu động cơ V8 twin-turbo kết hợp hybrid cho 920 mã lực. Khí động học chủ động và khung carbon mang lại tăng tốc vượt trội cùng khả năng vào cua chính xác.',
    heroImage: '../assets/images/cars/lamborghini_ferzor.jpg',
    gallery: [
      '../assets/images/cars/lamborghini_ferzor.jpg'
    ]
  }
];

/* === Helper functions === */

function getCarById(id) {
  if (!id) return null;
  return CAR_DATABASE.find(function(car) { return car.id === id; }) || null;
}

function getCarByMakeModel(make, model) {
  if (!make && !model) return null;

  var query = BrandModelNormalize.normalizePair(make, model);
  var matches = [];

  function carMatches(car) {
    var makeMatch = !query.make || BrandModelNormalize.isExactMatch(car.make, query.make);
    if (!makeMatch) return false;

    if (query.model && BrandModelNormalize.isExactMatch(car.model, query.model)) {
      return true;
    }

    if (Array.isArray(car.aliases)) {
      for (var i = 0; i < car.aliases.length; i++) {
        if (BrandModelNormalize.isExactMatch(car.aliases[i], query.model)) {
          return true;
        }
      }
    }

    var carModelNorm = BrandModelNormalize.normalizeToken(car.model);
    if (query.model && (carModelNorm.indexOf(query.model) !== -1 || query.model.indexOf(carModelNorm) !== -1)) {
      return true;
    }

    return false;
  }

  CAR_DATABASE.forEach(function (car) {
    if (carMatches(car)) matches.push(car);
  });

  if (!matches.length) return null;

  var placeholder = getPlaceholderImage();

  function getMatchTier(car) {
    if (!query.model) return 0;
    if (BrandModelNormalize.isExactMatch(car.model, model)) return 1;
    if (Array.isArray(car.aliases)) {
      for (var j = 0; j < car.aliases.length; j++) {
        if (BrandModelNormalize.isExactMatch(car.aliases[j], model)) return 2;
      }
    }
    var carModelNorm = BrandModelNormalize.normalizeToken(car.model);
    if (carModelNorm.indexOf(query.model) !== -1 || query.model.indexOf(carModelNorm) !== -1) {
      return 3;
    }
    return 4;
  }

  matches.sort(function (a, b) {
    var tierDiff = getMatchTier(a) - getMatchTier(b);
    if (tierDiff !== 0) return tierDiff;

    var aHasImage = !!(a.heroImage && a.heroImage !== placeholder && String(a.heroImage).trim());
    var bHasImage = !!(b.heroImage && b.heroImage !== placeholder && String(b.heroImage).trim());
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    return 0;
  });

  return matches[0];
}

function getCarsByMake(make, excludeId) {
  if (!make) return [];

  var normalizedMake = BrandModelNormalize.normalizeToken(make);

  return CAR_DATABASE.filter(function(car) {
    return BrandModelNormalize.normalizeToken(car.make) === normalizedMake && car.id !== excludeId;
  });
}

function getFeaturedCatalogModels() {
  return CAR_DATABASE.map(function (car) {
    return {
      makeName: car.make,
      name: car.model,
      year: car.year || null,
      catalogId: car.id
    };
  });
}

function getRelatedCars(currentCar, maxCount) {
  maxCount = maxCount || 4;
  if (!currentCar) {
    return CatalogVisibility.filterVisibleCars(CAR_DATABASE).slice(0, maxCount);
  }

  var sameBrand = getCarsByMake(currentCar.make, currentCar.id);
  var result = CatalogVisibility.filterVisibleCars(sameBrand).slice(0, maxCount);

  if (result.length < maxCount) {
    var others = CAR_DATABASE.filter(function (car) {
      return car.id !== currentCar.id &&
        car.make.toLowerCase() !== currentCar.make.toLowerCase();
    });
    result = result.concat(
      CatalogVisibility.filterVisibleCars(others).slice(0, maxCount - result.length)
    );
  }

  return result;
}

function getPlaceholderImage() {
  return PLACEHOLDER_IMAGE;
}

/* 
Bật lại sau này:
Đặt CATALOG_DEMO_FILTER = false trong car-data.js,
hoặc mở rộng VISIBLE_BRANDS và chạy lại node tools/build-image-manifest.js khi thêm ảnh.
*/
var CATALOG_DEMO_FILTER = true;

var CatalogVisibility = (function () {
  'use strict';

  var VISIBLE_BRANDS = [
    'Ferrari',
    'Lamborghini',
    'Bugatti',
    'Porsche',
    'McLaren',
    'Koenigsegg',
    'Aston Martin'
  ];

  var manifestPathSet = null;

  function normalizeMakeKey(make) {
    return BrandModelNormalize.normalizeToken(make);
  }

  function buildManifestPathSet() {
    if (manifestPathSet) return manifestPathSet;
    manifestPathSet = {};
    if (typeof CAR_IMAGE_MANIFEST === 'undefined' || !CAR_IMAGE_MANIFEST) {
      return manifestPathSet;
    }
    var paths = CAR_IMAGE_MANIFEST.paths || [];
    for (var i = 0; i < paths.length; i++) {
      manifestPathSet[paths[i]] = true;
    }
    return manifestPathSet;
  }

  function isDemoFilterEnabled() {
    return CATALOG_DEMO_FILTER === true;
  }

  function isBrandVisible(make) {
    if (!isDemoFilterEnabled()) return true;
    if (!make) return false;
    var key = normalizeMakeKey(make);
    for (var i = 0; i < VISIBLE_BRANDS.length; i++) {
      if (normalizeMakeKey(VISIBLE_BRANDS[i]) === key) return true;
    }
    return false;
  }

  function getVisibleBrands() {
    return VISIBLE_BRANDS.slice();
  }

  function candidateHasManifestImage(candidate, placeholder, pathSet) {
    if (!candidate || candidate === placeholder) return false;
    return !!pathSet[candidate];
  }

  function hasProvidedImage(make, model) {
    if (!isDemoFilterEnabled()) return true;
    if (!make || !model) return false;

    var placeholder = getPlaceholderImage();
    var pathSet = buildManifestPathSet();
    if (!Object.keys(pathSet).length) return false;

    if (typeof CarImagePaths !== 'undefined' && CarImagePaths.resolveImage) {
      var resolved = CarImagePaths.resolveImage(make, model, { placeholder: placeholder });
      var candidates = resolved.candidates || [];
      for (var i = 0; i < candidates.length; i++) {
        if (candidateHasManifestImage(candidates[i], placeholder, pathSet)) return true;
      }
    }

    if (typeof getCarByMakeModel === 'function') {
      var car = getCarByMakeModel(make, model);
      if (car && car.heroImage && car.heroImage !== placeholder && pathSet[car.heroImage]) {
        return true;
      }
    }

    return false;
  }

  function isCatalogItemVisible(make, model) {
    if (!isDemoFilterEnabled()) return true;
    return isBrandVisible(make) && hasProvidedImage(make, model);
  }

  function filterVisibleModels(models) {
    if (!isDemoFilterEnabled() || !Array.isArray(models)) return models || [];
    return models.filter(function (model) {
      var make = model.makeName || model.make || '';
      var name = model.name || model.model || '';
      return isCatalogItemVisible(make, name);
    });
  }

  function filterVisibleCars(cars) {
    if (!isDemoFilterEnabled() || !Array.isArray(cars)) return cars || [];
    return cars.filter(function (car) {
      return isCatalogItemVisible(car.make, car.model);
    });
  }

  return {
    isDemoFilterEnabled: isDemoFilterEnabled,
    isBrandVisible: isBrandVisible,
    hasProvidedImage: hasProvidedImage,
    isCatalogItemVisible: isCatalogItemVisible,
    filterVisibleModels: filterVisibleModels,
    filterVisibleCars: filterVisibleCars,
    getVisibleBrands: getVisibleBrands
  };
})();

var CarDataAdapter = (function () {
  'use strict';

  var DEFAULT_PROVIDER_NAME = 'local-static-db';
  var activeProvider = createLocalProvider();

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function normalizeQuery(input) {
    if (typeof input === 'string') {
      return {
        id: input,
        make: '',
        model: ''
      };
    }

    var query = isObject(input) ? input : {};
    var rawId = query.id;

    return {
      id: rawId === undefined || rawId === null ? '' : String(rawId).trim(),
      make: query.make || '',
      model: query.model || '',
      year: query.year || ''
    };
  }

  function cloneCar(rawCar) {
    if (!isObject(rawCar)) return null;

    var clone = {};
    for (var key in rawCar) {
      if (rawCar.hasOwnProperty(key)) {
        clone[key] = rawCar[key];
      }
    }
    return clone;
  }

  function createFallbackDetail(query) {
    var pair = BrandModelNormalize.normalizePair(query.make, query.model);
    var make = pair.make ? String(query.make || '').replace(/\s+/g, ' ').trim() : '';
    var model = pair.model ? String(query.model || '').replace(/\s+/g, ' ').trim() : '';
    var fallbackId = query.id || BrandModelNormalize.buildStableId(make, model);

    return {
      id: fallbackId,
      make: make,
      model: model,
      year: null,
      horsepower: null,
      topSpeed: '',
      zeroToHundred: '',
      engine: '',
      drivetrain: '',
      shortDescription: '',
      longDescription: '',
      heroImage: getPlaceholderImage(),
      gallery: [getPlaceholderImage()]
    };
  }

  function sanitizeDetail(rawDetail, query) {
    var fallback = createFallbackDetail(query);
    var detail = cloneCar(rawDetail) || {};

    if (!detail.id) detail.id = fallback.id;
    if (!detail.make) detail.make = fallback.make;
    if (!detail.model) detail.model = fallback.model;

    if (detail.year === undefined) detail.year = fallback.year;
    if (detail.horsepower === undefined) detail.horsepower = fallback.horsepower;
    if (!detail.topSpeed) detail.topSpeed = fallback.topSpeed;
    if (!detail.zeroToHundred) detail.zeroToHundred = fallback.zeroToHundred;
    if (!detail.engine) detail.engine = fallback.engine;
    if (!detail.drivetrain) detail.drivetrain = fallback.drivetrain;
    if (!detail.shortDescription) detail.shortDescription = fallback.shortDescription;
    if (!detail.longDescription) detail.longDescription = fallback.longDescription;

    if (!detail.heroImage) detail.heroImage = getPlaceholderImage();

    if (!Array.isArray(detail.gallery) || detail.gallery.length === 0) {
      detail.gallery = [detail.heroImage || getPlaceholderImage()];
    }

    return detail;
  }

  function createLocalProvider() {
    return {
      name: DEFAULT_PROVIDER_NAME,

      fetchDetail: function (query) {
        if (query.id) {
          return getCarById(query.id);
        }
        return getCarByMakeModel(query.make, query.model);
      },

      fetchImage: function (query, detail) {
        if (detail && detail.heroImage) {
          return detail.heroImage;
        }

        var fallbackDetail = this.fetchDetail(query);
        if (fallbackDetail && fallbackDetail.heroImage) {
          return fallbackDetail.heroImage;
        }

        return getPlaceholderImage();
      }
    };
  }

  function validateProvider(provider) {
    if (!isObject(provider)) {
      return false;
    }

    if (typeof provider.fetchDetail !== 'function') {
      return false;
    }

    if (provider.fetchImage !== undefined && typeof provider.fetchImage !== 'function') {
      return false;
    }

    return true;
  }

  function setProvider(provider) {
    if (!validateProvider(provider)) {
      return false;
    }

    activeProvider = provider;
    return true;
  }

  function resetProvider() {
    activeProvider = createLocalProvider();
  }

  function getProviderName() {
    return activeProvider && activeProvider.name ? activeProvider.name : DEFAULT_PROVIDER_NAME;
  }

  function fetchDetail(input) {
    var query = normalizeQuery(input);

    return Promise.resolve()
      .then(function () {
        if (!activeProvider || typeof activeProvider.fetchDetail !== 'function') {
          return null;
        }
        return activeProvider.fetchDetail(query);
      })
      .then(function (rawDetail) {
        return sanitizeDetail(rawDetail, query);
      })
      .catch(function () {
        return createFallbackDetail(query);
      });
  }

  function fetchImage(input) {
    var query = normalizeQuery(input);

    return fetchDetail(query)
      .then(function (detail) {
        if (!activeProvider || typeof activeProvider.fetchImage !== 'function') {
          return detail.heroImage || getPlaceholderImage();
        }

        return Promise.resolve(activeProvider.fetchImage(query, detail))
          .then(function (providerImage) {
            if (!providerImage || !String(providerImage).trim()) {
              return detail.heroImage || getPlaceholderImage();
            }
            return providerImage;
          })
          .catch(function () {
            return detail.heroImage || getPlaceholderImage();
          });
      })
      .catch(function () {
        return getPlaceholderImage();
      });
  }

  function applyResolvedImage(detail, query) {
    var make = query.make || detail.make;
    var model = query.model || detail.model;
    var resolved = CarImagePaths.resolveImage(make, model, { placeholder: getPlaceholderImage() });

    detail.heroImage = resolved.primary;
    detail.gallery = [resolved.primary];

    return detail;
  }

  function fetchDetailWithImage(input) {
    var query = normalizeQuery(input);

    return fetchDetail(query)
      .then(function (detail) {
        var finalDetail = sanitizeDetail(detail, query);
        finalDetail = applyResolvedImage(finalDetail, query);

        return {
          detail: finalDetail,
          image: finalDetail.heroImage,
          provider: getProviderName()
        };
      })
      .catch(function () {
        var fallback = createFallbackDetail(query);
        return {
          detail: fallback,
          image: fallback.heroImage,
          provider: getProviderName()
        };
      });
  }

  return {
    setProvider: setProvider,
    resetProvider: resetProvider,
    getProviderName: getProviderName,
    fetchDetail: fetchDetail,
    fetchImage: fetchImage,
    fetchDetailWithImage: fetchDetailWithImage
  };
})();


