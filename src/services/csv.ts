import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SyncHistoryItem } from '../types';

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const exportSyncHistoryCsv = async (items: SyncHistoryItem[]) => {
  const header = ['summary', 'syncedAt'];
  const rows = items.map((item) => [item.summary, item.syncedAt]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(';'))
    .join('\n');

  const file = new File(Paths.cache, `dropigo-sync-${Date.now()}.csv`);
  file.create({ overwrite: true });
  file.write(csv, { encoding: 'utf8' });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Historique DropiGO',
    });
  }
  return file.uri;
};
