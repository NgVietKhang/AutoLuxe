/* =============================================
   SEED.JS - AutoLuxe Supercar Web
   Seed sample marketplace posts (idempotent)
   ============================================= */

var Seed = (function () {
  'use strict';

  var KEYS = {
    posts: 'autoluxe_market_posts',
    version: 'autoluxe_seed_version'
  };

  var CURRENT_SEED_VERSION = 1;

  var SAMPLE_POSTS = [
    {
      id: 'seed_001',
      ownerEmail: 'demo_ferrari@autoluxe.vn',
      ownerName: 'SupercarLover',
      title: 'Ferrari 488 GTB 2019 - Full Option',
      brand: 'Ferrari',
      model: '488 GTB',
      year: 2019,
      price: 280000,
      mileage: 12000,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&q=80',
      description: 'Xe đẹp, đi ít, full option. Bảo dưỡng chính hãng đầy đủ. Nội thất da bò đỏ nguyên bản. Giao xe toàn quốc.',
      createdAt: '2025-04-10T08:00:00.000Z'
    },
    {
      id: 'seed_002',
      ownerEmail: 'demo_lambo@autoluxe.vn',
      ownerName: 'VietRacer',
      title: 'Lamborghini Huracán EVO RWD 2021',
      brand: 'Lamborghini',
      model: 'Huracán EVO',
      year: 2021,
      price: 350000,
      mileage: 5000,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80',
      description: 'Phiên bản EVO RWD, màu xanh Blu Aegeus cực hiếm. ODO 5000km. Xe nhập chính ngạch, đầy đủ giấy tờ.',
      createdAt: '2025-04-15T10:30:00.000Z'
    },
    {
      id: 'seed_003',
      ownerEmail: 'demo_mclaren@autoluxe.vn',
      ownerName: 'SpeedKing',
      title: 'McLaren 720S Performance 2020',
      brand: 'McLaren',
      model: '720S',
      year: 2020,
      price: 310000,
      mileage: 8500,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'Đà Nẵng',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80',
      description: 'Performance spec, carbon fiber package. Xe nhập chính ngạch, đầy đủ giấy tờ. Bảo dưỡng định kỳ tại hãng.',
      createdAt: '2025-05-01T14:00:00.000Z'
    },
    {
      id: 'seed_004',
      ownerEmail: 'demo_porsche@autoluxe.vn',
      ownerName: 'TrackDay',
      title: 'Porsche 911 GT3 RS 2023',
      brand: 'Porsche',
      model: '911 GT3 RS',
      year: 2023,
      price: 420000,
      mileage: 2000,
      fuel: 'Xăng',
      transmission: 'PDK',
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&q=80',
      description: 'Chiếc 911 thuần chất đường đua. Gói Weissach, cánh gió sau cỡ lớn, phanh carbon ceramic. Chỉ 2000km.',
      createdAt: '2025-05-05T09:00:00.000Z'
    },
    {
      id: 'seed_005',
      ownerEmail: 'demo_bugatti@autoluxe.vn',
      ownerName: 'LuxuryCollector',
      title: 'Bugatti Chiron Sport 2022',
      brand: 'Bugatti',
      model: 'Chiron Sport',
      year: 2022,
      price: 3200000,
      mileage: 1500,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80',
      description: '1500 mã lực, W16 quad-turbo. Xe collection, giữ gìn cẩn thận. Nội thất bespoke 2 tông màu. Hiếm có.',
      createdAt: '2025-05-08T11:00:00.000Z'
    },
    {
      id: 'seed_006',
      ownerEmail: 'demo_aston@autoluxe.vn',
      ownerName: 'BondFan',
      title: 'Aston Martin DB11 V12 2021',
      brand: 'Aston Martin',
      model: 'DB11',
      year: 2021,
      price: 260000,
      mileage: 9500,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'Đà Nẵng',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80',
      description: 'Grand Tourer đẳng cấp Anh Quốc. V12 twin-turbo 630 mã lực. Nội thất da Bridge of Weir thượng hạng.',
      createdAt: '2025-05-10T16:00:00.000Z'
    },
    {
      id: 'seed_007',
      ownerEmail: 'demo_ferrari@autoluxe.vn',
      ownerName: 'SupercarLover',
      title: 'Ferrari SF90 Stradale 2023',
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2023,
      price: 750000,
      mileage: 3000,
      fuel: 'Hybrid',
      transmission: 'Tự động',
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&q=80',
      description: 'Hybrid supercar 986 mã lực. Assetto Fiorano package. Màu Rosso Corsa huyền thoại. ODO chỉ 3000km.',
      createdAt: '2025-05-12T08:30:00.000Z'
    },
    {
      id: 'seed_008',
      ownerEmail: 'demo_lambo@autoluxe.vn',
      ownerName: 'VietRacer',
      title: 'Lamborghini Urus Performante 2023',
      brand: 'Lamborghini',
      model: 'Urus Performante',
      year: 2023,
      price: 380000,
      mileage: 6000,
      fuel: 'Xăng',
      transmission: 'Tự động',
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80',
      description: 'Super SUV mạnh nhất phân khúc. 666 mã lực, 0-100km/h trong 3.3 giây. Full carbon package.',
      createdAt: '2025-05-14T13:00:00.000Z'
    }
  ];

  function run() {
    try {
      var savedVersion = Storage.get(KEYS.version, 0);
      if (savedVersion >= CURRENT_SEED_VERSION) return;

      var existingPosts = Storage.get(KEYS.posts, []);
      if (!Array.isArray(existingPosts)) existingPosts = [];

      if (existingPosts.length === 0) {
        Storage.set(KEYS.posts, SAMPLE_POSTS);
      }

      Storage.set(KEYS.version, CURRENT_SEED_VERSION);
    } catch (e) {
      console.error('[Seed] Failed to seed data:', e);
    }
  }

  return { run: run };
})();
