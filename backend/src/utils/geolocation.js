export class GeolocationUtils {
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRad(degrees) {
    return degrees * Math.PI / 180;
  }

  static getBoundingBox(lat, lng, radiusKm) {
    const latChange = radiusKm / 111.32;
    const lngChange = radiusKm / (111.32 * Math.cos(this.toRad(lat)));
    return {
      minLat: lat - latChange,
      maxLat: lat + latChange,
      minLng: lng - lngChange,
      maxLng: lng + lngChange
    };
  }
}