import { useState } from 'react';
import { X, Zap, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetCreated: () => void;
}

export function CreateBetModal({ open, onOpenChange, onBetCreated }: CreateBetModalProps) {
  const { profile, refreshProfile } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('You must be logged in to create a bet');
      return;
    }

    const betAmount = parseInt(amount, 10);
    
    if (!description.trim()) {
      toast.error('Please describe your bet');
      return;
    }

    if (isNaN(betAmount) || betAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (betAmount > profile.balance) {
      toast.error(`Insufficient balance. You have $${profile.balance.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('bets').insert({
        creator_id: profile.id,
        description: description.trim(),
        amount: betAmount,
        is_public: isPublic,
        status: 'open',
      });

      if (error) throw error;

      toast.success('Bet created successfully!');
      setDescription('');
      setAmount('');
      setIsPublic(true);
      onOpenChange(false);
      onBetCreated();
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Create a Bet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              What's the bet?
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., Chiefs to win the Super Bowl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/280
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Wager Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground pl-7 text-lg font-semibold"
                min={1}
                max={profile?.balance || 1000}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Available: <span className="stake-gold">${profile?.balance.toLocaleString() || 0}</span>
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-3">
            <Label className="text-foreground">Who can see this?</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                  isPublic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">Public Feed</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                  !isPublic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Friends Only</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !description.trim() || !amount}
            className="w-full bg-gradient-gold text-primary-foreground font-bold text-lg py-6 btn-gold-glow hover:opacity-90"
          >
            <Zap className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Creating...' : 'POST BET'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
