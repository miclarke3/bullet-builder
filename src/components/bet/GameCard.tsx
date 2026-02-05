import { Game, formatGameTime } from '@/data/mockGames';
import { ChevronRight } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <button
      onClick={() => onSelect(game)}
      className="w-full p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Teams */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{game.awayTeam.emoji}</span>
              <div className="text-left">
                <p className="font-semibold text-foreground">{game.awayTeam.name}</p>
                <p className="text-xs text-muted-foreground">{game.awayTeam.record}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pl-1">
              <span className="text-xs text-muted-foreground">@</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-2xl">{game.homeTeam.emoji}</span>
              <div className="text-left">
                <p className="font-semibold text-foreground">{game.homeTeam.name}</p>
                <p className="text-xs text-muted-foreground">{game.homeTeam.record}</p>
              </div>
            </div>
          </div>
          
          {/* Time & Venue */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-sm text-primary font-medium">{formatGameTime(game.startTime)}</p>
            <p className="text-xs text-muted-foreground">{game.venue}</p>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
