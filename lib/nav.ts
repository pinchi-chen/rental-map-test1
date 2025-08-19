// lib/nav.ts
import { Linking, Platform } from 'react-native';

export type Dest =
  | { lat: number; lng: number; label?: string }
  | { address: string; label?: string };

export type Opts = {
  preferred?: 'google' | 'apple' | 'auto';
  mode?: 'driving' | 'walking' | 'transit' | 'bicycling';
};

// 讓 1 參數或 2 參數都能過（TS overload）
export function openDirections(dest: Dest): Promise<void>;
export function openDirections(dest: Dest, opts: Opts): Promise<void>;
export async function openDirections(
  dest: Dest,
  opts: Opts = {}
): Promise<void> {
  const preferred = opts.preferred ?? 'auto';
  const mode = opts.mode ?? 'driving';

  const q =
    'address' in dest
      ? encodeURIComponent(dest.address + (dest.label ? ` (${dest.label})` : ''))
      : encodeURIComponent(`${dest.lat},${dest.lng}` + (dest.label ? ` (${dest.label})` : ''));

  const tryOpen = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) return false;
      await Linking.openURL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Google maps urls
  const gAppIOS = `comgooglemaps://?daddr=${q}&directionsmode=${mode}`;
  const gAppAndroid =
    'address' in dest
      ? `google.navigation:q=${encodeURIComponent(dest.address)}&mode=${mode[0] ?? 'd'}`
      : `google.navigation:q=${dest.lat},${dest.lng}&mode=${mode[0] ?? 'd'}`;
  const gWeb = `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=${mode}`;

  // Apple maps urls（iOS）
  const aApp = `maps://?daddr=${q}&dirflg=${mode.startsWith('walk') ? 'w' : 'd'}`;
  const aWeb = `http://maps.apple.com/?daddr=${q}`;

  // --- preferred == 'google'
  if (preferred === 'google') {
    if (Platform.OS === 'ios') {
      if (await tryOpen(gAppIOS)) return;
    } else {
      if (await tryOpen(gAppAndroid)) return;
    }
    await Linking.openURL(gWeb);
    return;
  }

  // --- preferred == 'apple'
  if (preferred === 'apple') {
    if (Platform.OS === 'ios') {
      if (await tryOpen(aApp)) return;
      await Linking.openURL(aWeb);
      return;
    }
    if (await tryOpen(gAppAndroid)) return;
    await Linking.openURL(gWeb);
    return;
  }

  // --- preferred == 'auto'
  if (Platform.OS === 'android') {
    if (await tryOpen(gAppAndroid)) return;
    await Linking.openURL(gWeb);
    return;
  } else {
    if (await tryOpen(gAppIOS)) return;
    if (await tryOpen(aApp)) return;
    await Linking.openURL(aWeb);
    return;
  }
}

// 同時提供 default 與 named export，避免匯入方式不一致造成類型錯誤
export default openDirections;
