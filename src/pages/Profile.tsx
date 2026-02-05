import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreateBetModal } from '@/components/bet/CreateBetModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bet, Profile as ProfileType } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type BetWithDetails = Bet & { 
  creator: ProfileType; 
  opponent: ProfileType | null;
};

export default function Profile() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [myBets, setMyBets] = useState<BetWithDetails[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (profile) {
      fetchMyBets();
    }
  }, [profile]);

  const fetchMyBets = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          creator:profiles!bets_creator_id_fkey(*),
          opponent:profiles!bets_opponent_id_fkey(*)
        `)
        .or(`creator_id.eq.${profile.id},opponent_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyBets((data as BetWithDetails[]) || []);
    } catch (error) {
      console.error('Failed to load bets:', error);
    } finally {
      setIsLoadingBets(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const winRate = profile.wins + profile.losses > 0 
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) 
    : 0;

  const activeBets = myBets.filter(b => b.status === 'open' || b.status === 'matched');
  const historyBets = myBets.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const displayedBets = activeTab === 'active' ? activeBets : historyBets;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
        </div>
      </header>

      {/* Profile Card */}
      <div className="container py-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20 avatar-ring">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-foreground text-2xl font-bold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{profile.username}</h2>
              <p className="text-muted-foreground">
                Member since {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="rounded-xl bg-gradient-gold p-4 mb-6 glow-gold">
            <p className="text-sm font-medium text-primary-foreground/80">Wallet Balance</p>
            <p className="text-3xl font-bold text-primary-foreground">
              ${profile.balance.toLocaleString()}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-secondary p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{profile.wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold text-foreground">{profile.losses}</p>
              <p className="text-xs text-muted-foreground">Losses</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bets Section */}
      <div className="container">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
              activeTab === 'active'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Active ({activeBets.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
              activeTab === 'history'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            History ({historyBets.length})
          </button>
        </div>

        {/* Bets List */}
        {isLoadingBets ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : displayedBets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {activeTab === 'active' ? 'No active bets' : 'No bet history yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedBets.map((bet) => (
              <div
                key={bet.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-foreground font-medium flex-1 pr-4">
                    {bet.description}
                  </p>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium shrink-0",
                    bet.status === 'open' && "status-open",
                    bet.status === 'matched' && "status-matched",
                    bet.status === 'completed' && "status-completed",
                    bet.status === 'cancelled' && "bg-destructive/20 text-destructive"
                  )}>
                    {bet.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {bet.creator_id === profile.id ? 'You created' : `vs ${bet.creator.username}`}
                  </span>
                  <span className="stake-gold font-semibold">
                    ${bet.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav onCreateBet={() => setCreateModalOpen(true)} />
      
      <CreateBetModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onBetCreated={() => {
          fetchMyBets();
          refreshProfile();
        }}
      />
    </div>
  );
}
