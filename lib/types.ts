export interface Ratings {
  food: number;
  venue: number;
  decor: number;
  photobooth: number;
  giveaways: number;
  emcees: number;
  games: number;
  department_presentations: number;
  raffle: number;
  loyalty_awards: number;
}

export interface FeedbackData {
  user_id: string;
  ratings: Ratings;
  comment?: string;
  name?: string;
  department?: string;
  user_agent?: string;
}

export interface ExistingFeedback extends FeedbackData {
  id: number;
  created_at: string;
  updated_at: string;
}

export const ratingCategories = [
  { key: 'food' as keyof Ratings, label: 'Food' },
  { key: 'venue' as keyof Ratings, label: 'Venue' },
  { key: 'decor' as keyof Ratings, label: 'Decor' },
  { key: 'photobooth' as keyof Ratings, label: 'Photobooth' },
  { key: 'giveaways' as keyof Ratings, label: 'Giveaways' },
  { key: 'emcees' as keyof Ratings, label: 'Emcees' },
  { key: 'games' as keyof Ratings, label: 'Games' },
  { key: 'department_presentations' as keyof Ratings, label: 'Department Presentations' },
  { key: 'raffle' as keyof Ratings, label: 'Raffle' },
  { key: 'loyalty_awards' as keyof Ratings, label: 'Loyalty Awards' },
];
