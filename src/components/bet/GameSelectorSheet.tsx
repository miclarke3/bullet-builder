import { useState } from 'react';
import { Trophy } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { upcomingGames, Game } from '@/data/mockGames';
import { GameCard } from './GameCard';
import { BookieSheet } from './BookieSheet';

interface GameSelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetCreated: () => void;
}

export function GameSelectorSheet({ open, onOpenChange, onBetCreated }: GameSelectorSheetProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [bookieSheetOpen, setBookieSheetOpen] = useState(false);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    onOpenChange(false);
    setTimeout(() => setBookieSheetOpen(true), 150);
  };

  const handleBookieSheetClose = (open: boolean) => {
    setBookieSheetOpen(open);
    if (!open) {
      setSelectedGame(null);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-card border-border max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <DrawerTitle className="text-xl font-bold text-foreground">
                Upcoming Games
              </DrawerTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Select a game to create your wager
            </p>
          </DrawerHeader>

          <div className="p-4 space-y-3 overflow-y-auto">
            {upcomingGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={handleGameSelect} />
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <BookieSheet
        game={selectedGame}
        open={bookieSheetOpen}
        onOpenChange={handleBookieSheetClose}
        onBetCreated={onBetCreated}
      />
    </>
  );
}
