// lib/rating.ts
import { Comment } from '../lib/types';
export function calculateAverageRating(comments: Comment[]): number | undefined {
  if (comments.length === 0) return undefined;

  const total = comments.reduce((sum, c) => sum + c.rating, 0);
  return Math.round((total / comments.length) * 10) / 10;
}
/*export function ratingToStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}*/