import { Linking } from 'react-native';

export const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const openNavigationApp = async (lat: number, lng: number) => {
  const destination = `${lat},${lng}`;
  const wazeUrl = `waze://?ll=${destination}&navigate=yes`;
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  try {
    const canOpenWaze = await Linking.canOpenURL(wazeUrl);
    if (canOpenWaze) {
      await Linking.openURL(wazeUrl);
      return;
    }
    await Linking.openURL(googleUrl);
  } catch {
    await Linking.openURL(googleUrl);
  }
};
