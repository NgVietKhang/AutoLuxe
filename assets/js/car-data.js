/* =============================================
   CAR-DATA.JS - AutoLuxe Supercar Web
   Centralized local car data for detail pages
   ============================================= */

var PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=60';

var CAR_DATABASE = [
  {
    id: 'ferrari-sf90-stradale',
    make: 'Ferrari',
    model: 'SF90 Stradale',
    year: 2024,
    horsepower: 986,
    topSpeed: '340 km/h',
    zeroToHundred: '2.5s',
    engine: 'V8 Twin-Turbo Hybrid',
    drivetrain: 'AWD',
    shortDescription: 'Hybrid supercar với 986 mã lực, tăng tốc 0-100km/h trong 2.5 giây.',
    longDescription: 'Ferrari SF90 Stradale là mẫu siêu xe hybrid plug-in đầu tiên của Ferrari, kết hợp động cơ V8 twin-turbo 4.0L với ba motor điện tạo ra tổng công suất 986 mã lực. Đây là chiếc Ferrari sản xuất hàng loạt mạnh nhất từ trước đến nay, mang đến trải nghiệm lái không tưởng với khả năng tăng tốc ngoạn mục và công nghệ đỉnh cao từ đường đua F1. Hệ thống hybrid cho phép xe chạy thuần điện trong phạm vi 25km, trong khi chế độ Qualify mở khóa toàn bộ sức mạnh cho trải nghiệm tốc độ thuần túy.',
    heroImage: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'
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
    shortDescription: 'V6 hybrid mới của Ferrari với 830 mã lực và thiết kế gợi nhớ huyền thoại Dino.',
    longDescription: 'Ferrari 296 GTB đánh dấu sự trở lại của động cơ V6 trong lịch sử Ferrari, nhưng lần này được trang bị công nghệ hybrid tiên tiến. Với tổng công suất 830 mã lực từ động cơ V6 twin-turbo 3.0L kết hợp motor điện, chiếc xe mang đến trải nghiệm lái thuần khiết và phấn khích. Thiết kế lấy cảm hứng từ huyền thoại 250 LM và Dino 206 S, tạo nên vẻ đẹp vượt thời gian.',
    heroImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80'
    ]
  },
  {
    id: 'lamborghini-revuelto',
    make: 'Lamborghini',
    model: 'Revuelto',
    year: 2024,
    horsepower: 1015,
    topSpeed: '350 km/h',
    zeroToHundred: '2.5s',
    engine: 'V12 Hybrid',
    drivetrain: 'AWD',
    shortDescription: 'V12 hybrid mạnh mẽ nhất lịch sử Lamborghini với 1015 mã lực.',
    longDescription: 'Lamborghini Revuelto là siêu xe hybrid V12 đầu tiên của Lamborghini, kế thừa di sản của Aventador với công nghệ hoàn toàn mới. Động cơ V12 hút khí tự nhiên 6.5L kết hợp 3 motor điện tạo ra tổng công suất 1015 mã lực. Khung gầm carbon monocoque mới, hộp số ly hợp kép 8 cấp, và hệ dẫn động 4 bánh thông minh mang đến khả năng vận hành vượt trội so với bất kỳ Lamborghini nào trước đó.',
    heroImage: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
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
    shortDescription: 'Phiên bản đường đua thuần túy của Huracán với khí động học từ Super Trofeo.',
    longDescription: 'Lamborghini Huracán STO (Super Trofeo Omologata) là phiên bản đường phố của chiếc xe đua Super Trofeo EVO và GT3 EVO. Với động cơ V10 hút khí tự nhiên 5.2L sản sinh 640 mã lực, hệ dẫn động cầu sau, và trọng lượng giảm đáng kể nhờ vật liệu carbon fiber, Huracán STO mang đến trải nghiệm lái gần nhất với xe đua thực thụ mà vẫn hợp pháp trên đường phố.',
    heroImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80'
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
    shortDescription: 'Siêu phẩm từ Woking với 750PS và trọng lượng siêu nhẹ.',
    longDescription: 'McLaren 750S là sự nâng cấp toàn diện của 720S, với động cơ V8 twin-turbo 4.0L được tinh chỉnh lên 750PS (740 mã lực). Nhẹ hơn 30kg so với người tiền nhiệm, 750S sở hữu tỷ lệ công suất/trọng lượng ấn tượng. Khung gầm carbon monocoque, hệ thống treo Proactive Chassis Control II, và khí động học cải tiến mang đến sự cân bằng hoàn hảo giữa hiệu suất và sự thoải mái hàng ngày.',
    heroImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'
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
    shortDescription: 'Siêu xe hybrid thế hệ mới của McLaren với kiến trúc carbon hoàn toàn mới.',
    longDescription: 'McLaren Artura là siêu xe hybrid đầu tiên của McLaren, xây dựng trên nền tảng McLaren Carbon Lightweight Architecture (MCLA) hoàn toàn mới. Động cơ V6 twin-turbo 3.0L kết hợp motor điện tạo ra 680 mã lực. Với trọng lượng chỉ 1.395kg, Artura là minh chứng cho triết lý nhẹ và hiệu quả của McLaren, đồng thời mở ra kỷ nguyên điện hóa cho thương hiệu.',
    heroImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80'
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
    shortDescription: 'Chiếc 911 thuần chất đường đua nhất với khí động học chủ động.',
    longDescription: 'Porsche 911 GT3 RS (992) là đỉnh cao của dòng 911 về khả năng vận hành trên đường đua. Với động cơ flat-6 hút khí tự nhiên 4.0L sản sinh 525 mã lực tại 8.500 vòng/phút, cánh gió chủ động DRS tạo ra lực ép 409kg ở tốc độ 200km/h, và trọng lượng chỉ 1.450kg, GT3 RS là chiếc xe đường phố gần nhất với xe đua GT3 Cup. Mỗi chi tiết đều được tối ưu hóa cho tốc độ thuần túy.',
    heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'
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
    shortDescription: 'Hypercar hybrid huyền thoại của Porsche với công nghệ từ Le Mans.',
    longDescription: 'Porsche 918 Spyder là một trong bộ ba hypercar Holy Trinity cùng thời với LaFerrari và McLaren P1. Với động cơ V8 4.6L kết hợp hai motor điện tạo ra tổng công suất 887 mã lực, 918 Spyder đã thiết lập kỷ lục tại Nürburgring Nordschleife với thời gian 6:57. Chỉ 918 chiếc được sản xuất, biến nó thành một trong những chiếc Porsche quý hiếm và đáng thèm muốn nhất mọi thời đại.',
    heroImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80'
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
    shortDescription: '1500 mã lực, tốc độ tối đa 420km/h — đỉnh cao kỹ thuật ô tô.',
    longDescription: 'Bugatti Chiron là hiện thân của sự xa xỉ và hiệu suất tối thượng. Động cơ W16 quad-turbo 8.0L sản sinh 1.500 mã lực và 1.600 Nm mô-men xoắn, đưa chiếc xe từ 0 lên 100km/h trong 2.4 giây và đạt tốc độ tối đa 420km/h (giới hạn điện tử). Nội thất được chế tác thủ công với những vật liệu quý hiếm nhất, mỗi chiếc Chiron là sự kết hợp hoàn hảo giữa nghệ thuật và công nghệ.',
    heroImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
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
    shortDescription: 'Megacar Thụy Điển với 1600 mã lực và tốc độ lý thuyết trên 500km/h.',
    longDescription: 'Koenigsegg Jesko là megacar được đặt theo tên cha của nhà sáng lập Christian von Koenigsegg. Với động cơ V8 twin-turbo 5.0L sản sinh 1.600 mã lực (sử dụng E85), hộp số Light Speed Transmission 9 cấp đa ly hợp độc quyền, và khí động học tạo ra 1.400kg lực ép, Jesko nhắm đến danh hiệu xe sản xuất nhanh nhất thế giới với tốc độ lý thuyết 531km/h.',
    heroImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
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
    shortDescription: 'Hypercar với động cơ V12 Cosworth và khí động học F1 thuần túy.',
    longDescription: 'Aston Martin Valkyrie là sản phẩm hợp tác giữa Aston Martin và Red Bull Advanced Technologies, với mục tiêu tạo ra chiếc xe đường phố có hiệu suất ngang xe F1. Động cơ V12 hút khí tự nhiên 6.5L do Cosworth chế tạo đạt 11.100 vòng/phút, kết hợp motor điện Rimac tạo ra 1.160 mã lực. Thiết kế khí động học cực đoan của Adrian Newey tạo ra hơn 1.800kg lực ép mà không cần cánh gió lớn.',
    heroImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
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
    shortDescription: 'Track-only hypercar cực đoan nhất từ Bugatti với 1850 mã lực.',
    longDescription: 'Bugatti Bolide là chiếc xe đường đua thuần túy đầu tiên của Bugatti trong thời hiện đại. Dựa trên động cơ W16 8.0L nhưng được tinh chỉnh lên 1.850 mã lực, kết hợp thân xe carbon cực nhẹ chỉ 1.240kg, Bolide đạt tỷ lệ công suất/trọng lượng 1.49 mã lực/kg. Thiết kế khí động học tạo ra 2.600kg lực ép tại tốc độ 320km/h, biến Bolide thành cỗ máy tốc độ thuần túy không thỏa hiệp.',
    heroImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'
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
  return CAR_DATABASE.find(function(car) {
    var makeMatch = !make || car.make.toLowerCase() === make.toLowerCase();
    var modelMatch = !model || car.model.toLowerCase() === model.toLowerCase();
    return makeMatch && modelMatch;
  }) || null;
}

function getCarsByMake(make, excludeId) {
  if (!make) return [];
  return CAR_DATABASE.filter(function(car) {
    return car.make.toLowerCase() === make.toLowerCase() && car.id !== excludeId;
  });
}

function getRelatedCars(currentCar, maxCount) {
  maxCount = maxCount || 4;
  if (!currentCar) return CAR_DATABASE.slice(0, maxCount);

  var sameBrand = getCarsByMake(currentCar.make, currentCar.id);
  var result = sameBrand.slice(0, maxCount);

  if (result.length < maxCount) {
    var others = CAR_DATABASE.filter(function(car) {
      return car.id !== currentCar.id && car.make.toLowerCase() !== currentCar.make.toLowerCase();
    });
    result = result.concat(others.slice(0, maxCount - result.length));
  }

  return result;
}

function getPlaceholderImage() {
  return PLACEHOLDER_IMAGE;
}
