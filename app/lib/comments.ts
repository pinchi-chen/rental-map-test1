// app/lib/comments.ts
import { getJSON, setJSON } from './storage';

export type Comment = {
  id: string;
  user: string;
  rating: number; // 1~5
  text: string;
  createdAt: number;
};

// 統一 Key：評論清單 & 平均評分快取
export const commentsKey = (pid: string) => `comments:${pid}`;
export const avgKey = (pid: string) => `avgRating:${pid}`;

// 從快取取得平均分數；如果沒有快取，就從評論計算一次
export async function getAverageRating(pid: string): Promise<number | null> {
  const cached = await getJSON<number>(avgKey(pid), null as any);
  if (typeof cached === 'number' && !Number.isNaN(cached)) return cached;

  const list = await getJSON<Comment[]>(commentsKey(pid), []);
  if (!list.length) return null;

  const total = list.reduce((s, c) => s + c.rating, 0);
  const avg = Math.round((total / list.length) * 10) / 10;
  // 可選：把計算結果寫回快取，加速下次讀取
  await setJSON(avgKey(pid), avg);
  return avg;
}

// 在你送出/更新評論後呼叫它：幫你把平均分數寫入快取
export async function setAverageRatingFromComments(pid: string, list: Comment[]) {
  if (!list.length) {
    await setJSON(avgKey(pid), null as any);
    return;
  }
  const total = list.reduce((s, c) => s + c.rating, 0);
  const avg = Math.round((total / list.length) * 10) / 10;
  await setJSON(avgKey(pid), avg);
}
