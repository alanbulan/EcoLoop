/**
 * 计算两个经纬度之间的距离 (单位: km)
 * 使用 Haversine 公式，完全免费，不需要调用第三方地图 API
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371; // 地球半径 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d.toFixed(1);
}

/**
 * 获取当前位置的经纬度 (uniapp 原生接口，免费)
 */
export function getCurrentLocation(): Promise<UniApp.GetLocationSuccess> {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
}
