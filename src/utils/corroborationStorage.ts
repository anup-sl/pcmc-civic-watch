const STORAGE_KEY = 'pcmc_corroborated_hotspots';

export function getCorroboratedHotspotIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasUserCorroborated(hotspotId: string): boolean {
  const ids = getCorroboratedHotspotIds();
  return ids.includes(hotspotId);
}

export function recordUserCorroboration(hotspotId: string): void {
  try {
    const ids = getCorroboratedHotspotIds();
    if (!ids.includes(hotspotId)) {
      ids.push(hotspotId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error('Failed to save corroboration locally:', err);
  }
}
