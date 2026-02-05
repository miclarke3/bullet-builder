export type BetStatus = 'open' | 'matched' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  balance: number;
  wins: number;
  losses: number;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  creator_id: string;
  opponent_id: string | null;
  description: string;
  amount: number;
  status: BetStatus;
  winner_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  opponent?: Profile;
}
