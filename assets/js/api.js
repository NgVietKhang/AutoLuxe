/* =============================================
   API.JS - AutoLuxe Supercar Web
   NHTSA VPIC API layer
   ============================================= */

const API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const REQUEST_TIMEOUT = 9000;

/**
 * Internal helper: fetch with timeout via AbortController
 */
function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  return fetch(url, { signal: controller.signal })
    .finally(function () {
      clearTimeout(timeoutId);
    });
}

/**
 * Fetch all vehicle makes from NHTSA
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function fetchAllMakes() {
  try {
    var response = await fetchWithTimeout(
      API_BASE + '/GetAllMakes?format=json',
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error('Lỗi server: ' + response.status);
    }

    var data = await response.json();

    if (!data.Results || !Array.isArray(data.Results)) {
      throw new Error('Dữ liệu trả về không hợp lệ');
    }

    return data.Results.map(function (item) {
      return {
        id: item.Make_ID,
        name: item.Make_Name
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
 * Fetch models for a specific make
 * @param {string} makeName - Name of the vehicle make
 * @returns {Promise<Array<{id: number, name: string, makeName: string}>>}
 */
async function fetchModelsByMake(makeName) {
  if (!makeName) {
    throw new Error('Tên hãng không được để trống.');
  }

  try {
    var encodedMake = encodeURIComponent(makeName);
    var response = await fetchWithTimeout(
      API_BASE + '/GetModelsForMake/' + encodedMake + '?format=json',
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error('Lỗi server: ' + response.status);
    }

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
