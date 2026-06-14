/* =============================================
   API.JS - AutoLuxe Supercar Web
   NHTSA vPIC catalog API only.
   Local images/specs live in car-data.js.
   ============================================= */

const REQUEST_TIMEOUT = 9000;
const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Internal helper: fetch with timeout via AbortController
 */
function fetchWithTimeout(url, timeoutMs, init) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  var options = init ? Object.assign({}, init) : {};
  options.signal = controller.signal;

  return fetch(url, options)
    .finally(function () {
      clearTimeout(timeoutId);
    });
}

/* =============================================
   NHTSA VPIC — catalog
   ============================================= */

async function fetchNhtsaMakes() {
  try {
    var response = await fetchWithTimeout(
      NHTSA_API_BASE + '/GetAllMakes?format=json',
      REQUEST_TIMEOUT
    );
    if (!response.ok) throw new Error('Lỗi server: ' + response.status);

    var data = await response.json();
    if (!data.Results || !Array.isArray(data.Results)) {
      throw new Error('Dữ liệu trả về không hợp lệ');
    }

    return data.Results.map(function (item) {
      return { id: item.Make_ID, name: item.Make_Name };
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
    }
    throw new Error(err.message || 'Không thể kết nối đến server.');
  }
}

async function fetchNhtsaModelsByMake(makeName) {
  if (!makeName) throw new Error('Tên hãng không được để trống.');

  try {
    var encodedMake = encodeURIComponent(makeName);
    var response = await fetchWithTimeout(
      NHTSA_API_BASE + '/GetModelsForMake/' + encodedMake + '?format=json',
      REQUEST_TIMEOUT
    );
    if (!response.ok) throw new Error('Lỗi server: ' + response.status);

    var data = await response.json();
    if (!data.Results || !Array.isArray(data.Results)) {
      throw new Error('Dữ liệu trả về không hợp lệ');
    }

    return data.Results.map(function (item) {
      return {
        id: item.Model_ID,
        name: item.Model_Name,
        makeName: item.Make_Name
      };
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
    }
    throw new Error(err.message || 'Không thể kết nối đến server.');
  }
}

async function fetchNhtsaModelsByMakeYear(makeName, year) {
  if (!makeName) throw new Error('Tên hãng không được để trống.');
  if (!year) return fetchNhtsaModelsByMake(makeName);

  try {
    var encodedMake = encodeURIComponent(makeName);
    var encodedYear = encodeURIComponent(year);
    var response = await fetchWithTimeout(
      NHTSA_API_BASE + '/GetModelsForMakeYear/make/' + encodedMake + '/modelyear/' + encodedYear + '?format=json',
      REQUEST_TIMEOUT
    );
    if (!response.ok) throw new Error('Lỗi server: ' + response.status);

    var data = await response.json();
    if (!data.Results || !Array.isArray(data.Results)) {
      throw new Error('Dữ liệu trả về không hợp lệ');
    }

    return data.Results.map(function (item) {
      return {
        id: item.Model_ID,
        name: item.Model_Name,
        makeName: item.Make_Name
      };
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
    }
    throw new Error(err.message || 'Không thể kết nối đến server.');
  }
}

/**
 * Public catalog: NHTSA vPIC (free, no API key).
 */
async function fetchAllMakes(year) {
  return fetchNhtsaMakes();
}

async function fetchModelsByMake(makeName, year) {
  if (year) return fetchNhtsaModelsByMakeYear(makeName, year);
  return fetchNhtsaModelsByMake(makeName);
}

async function fetchModelsByMakeYear(makeName, year) {
  return fetchModelsByMake(makeName, year);
}
