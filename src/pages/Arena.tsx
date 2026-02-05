import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { BetCard } from '@/components/bet/BetCard';
import { GameSelectorSheet } from '@/components/bet/GameSelectorSheet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bet, Profile } from '@/types/database';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type BetWithCreator = Bet & { creator: Profile };

export default function Arena() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [bets, setBets] = useState<BetWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gameSelectorOpen, setGameSelectorOpen] = useState(false);
  const [acceptingBetId, setAcceptingBetId] = useState<string | null>(null);

  const fetchBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          creator:profiles!bets_creator_id_fkey(*)
        `)
        .eq('status', 'open')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBets((data as BetWithCreator[]) || []);
    } catch (error: any) {
      toast.error('Failed to load bets');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBets();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('bets-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bets',
          },
          () => {
            fetchBets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleAcceptBet = async (betId: string) => {
    if (!profile) {
      toast.error('You must be logged in to accept a bet');
      return;
    }

    const bet = bets.find((b) => b.id === betId);
    if (!bet) return;

    if (bet.amount > profile.balance) {
      toast.error(`Insufficient balance. You need $${bet.amount.toLocaleString()}`);
      return;
    }

    setAcceptingBetId(betId);

    try {
      const { error } = await supabase
        .from('bets')
        .update({
          opponent_id: profile.id,
          status: 'matched',
        })
        .eq('id', betId)
        .eq('status', 'open');

      if (error) throw error;

      toast.success('Bet accepted! Game on! 🎯');
      refreshProfile();
      fetchBets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept bet');
    } finally {
      setAcceptingBetId(null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBets();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen pb-24">
      <Header />

      {/* Feed header */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container flex items-center justify-between py-3">
          <h2 className="text-lg font-bold text-foreground">The Arena</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Bets feed */}
      <main className="feed-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No open bets yet
            </h3>
            <p className="text-muted-foreground max-w-xs">
              Be the first to post a wager and get the action started!
            </p>
          </div>
        ) : (
          <div>
            {bets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                currentProfileId={profile?.id}
                onAccept={handleAcceptBet}
                isAccepting={acceptingBetId === bet.id}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav onCreateBet={() => setGameSelectorOpen(true)} />
      
      <GameSelectorSheet
        open={gameSelectorOpen}
        onOpenChange={setGameSelectorOpen}
        onBetCreated={fetchBets}
      />
    </div>
  );
}
