import { formatDistanceToNow } from 'date-fns';
import { User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bet, Profile } from '@/types/database';
import { cn } from '@/lib/utils';

interface BetCardProps {
  bet: Bet & { creator: Profile };
  currentProfileId?: string;
  onAccept: (betId: string) => void;
  isAccepting?: boolean;
}

export function BetCard({ bet, currentProfileId, onAccept, isAccepting }: BetCardProps) {
  const isOwnBet = bet.creator_id === currentProfileId;
  const canAccept = !isOwnBet && bet.status === 'open';

  return (
    <article className="border-b border-border bg-card p-4 transition-colors card-hover animate-slide-up">
      {/* Header with avatar and user info */}
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 avatar-ring">
          <AvatarImage src={bet.creator.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary text-foreground font-semibold">
            {bet.creator.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* User info row */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {bet.creator.username}
            </span>
            <span className="text-muted-foreground text-sm">
              · {formatDistanceToNow(new Date(bet.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Win/Loss record */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="text-success">{bet.creator.wins}W</span>
            <span>-</span>
            <span className="text-destructive">{bet.creator.losses}L</span>
          </div>

          {/* Bet description */}
          <p className="mt-3 text-foreground text-balance leading-relaxed">
            {bet.description}
          </p>

          {/* Stake and action */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stake:</span>
              <span className="stake-gold font-bold text-lg">
                ${bet.amount.toLocaleString()}
              </span>
            </div>

            {canAccept && (
              <Button
                onClick={() => onAccept(bet.id)}
                disabled={isAccepting}
                className="bg-gradient-gold text-primary-foreground font-semibold btn-gold-glow hover:opacity-90"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isAccepting ? 'Accepting...' : 'ACCEPT BET'}
              </Button>
            )}

            {isOwnBet && bet.status === 'open' && (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium status-open"
              )}>
                Waiting for opponent
              </span>
            )}

            {bet.status === 'matched' && (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium status-matched"
              )}>
                Matched
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
