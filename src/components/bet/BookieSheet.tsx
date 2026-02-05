import { useState } from 'react';
import { ArrowLeft, Check, Copy, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Game, Team } from '@/data/mockGames';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookieSheetProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetCreated: () => void;
}

type Step = 'team' | 'spread' | 'stake' | 'confirm';

export function BookieSheet({ game, open, onOpenChange, onBetCreated }: BookieSheetProps) {
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>('team');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [spread, setSpread] = useState('');
  const [stake, setStake] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setStep('team');
    setSelectedTeam(null);
    setSpread('');
    setStake('');
    setCopied(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleBack = () => {
    if (step === 'spread') setStep('team');
    else if (step === 'stake') setStep('spread');
    else if (step === 'confirm') setStep('stake');
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setStep('spread');
  };

  const handleSpreadContinue = () => {
    if (!spread.trim()) {
      toast.error('Please enter a spread');
      return;
    }
    setStep('stake');
  };

  const handleStakeContinue = () => {
    const stakeAmount = parseInt(stake, 10);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }
    if (profile && stakeAmount > profile.balance) {
      toast.error(`Insufficient balance. You have $${profile.balance.toLocaleString()}`);
      return;
    }
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!profile || !selectedTeam || !game) {
      toast.error('Missing required information');
      return;
    }

    const stakeAmount = parseInt(stake, 10);
    const spreadValue = spread.startsWith('+') || spread.startsWith('-') ? spread : `+${spread}`;
    const description = `${selectedTeam.name} ${spreadValue} vs ${
      selectedTeam.id === game.homeTeam.id ? game.awayTeam.name : game.homeTeam.name
    }`;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('bets').insert({
        creator_id: profile.id,
        description,
        amount: stakeAmount,
        is_public: true,
        status: 'open',
      });

      if (error) throw error;

      toast.success('Bet posted to The Arena! 🎯');
      refreshProfile();
      onBetCreated();
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyChallenge = async () => {
    if (!selectedTeam) return;
    
    const spreadValue = spread.startsWith('+') || spread.startsWith('-') ? spread : `+${spread}`;
    const challengeText = `I bet $${stake} on ${selectedTeam.name} ${spreadValue}. You in? Join Bullet to accept!`;
    
    try {
      await navigator.clipboard.writeText(challengeText);
      setCopied(true);
      toast.success('Challenge copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (!game) return null;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            {step !== 'team' && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <DrawerTitle className="text-xl font-bold text-foreground">
              {step === 'team' && 'Pick Your Team'}
              {step === 'spread' && 'Set the Line'}
              {step === 'stake' && 'Set Your Stake'}
              {step === 'confirm' && 'Confirm Your Bet'}
            </DrawerTitle>
          </div>
          
          {/* Progress indicator */}
          <div className="flex gap-1 mt-4">
            {['team', 'spread', 'stake', 'confirm'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= ['team', 'spread', 'stake', 'confirm'].indexOf(step)
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Step 1: Team Selection */}
          {step === 'team' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">
                Who are you betting on to cover the spread?
              </p>
              
              {[game.awayTeam, game.homeTeam].map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className="w-full p-5 bg-secondary border border-border rounded-xl hover:border-primary transition-all flex items-center gap-4"
                >
                  <span className="text-4xl">{team.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg text-foreground">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.record}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Spread */}
          {step === 'spread' && selectedTeam && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 py-4">
                <span className="text-4xl">{selectedTeam.emoji}</span>
                <span className="font-bold text-xl text-foreground">{selectedTeam.shortName}</span>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="spread" className="text-foreground">
                  What's your spread?
                </Label>
                <Input
                  id="spread"
                  placeholder="-5.5"
                  value={spread}
                  onChange={(e) => setSpread(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground text-center text-3xl font-bold h-16"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter "-5.5" if you think {selectedTeam.shortName} wins by 6+
                </p>
              </div>
              
              {/* Quick spread buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['-1.5', '-3.5', '-5.5', '-7.5'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpread(s)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      spread === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              
              <Button
                onClick={handleSpreadContinue}
                disabled={!spread.trim()}
                className="w-full bg-gradient-gold text-primary-foreground font-bold py-6"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 3: Stake */}
          {step === 'stake' && selectedTeam && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
                  <span className="text-xl">{selectedTeam.emoji}</span>
                  <span className="font-bold text-foreground">{selectedTeam.shortName}</span>
                  <span className="text-primary font-bold">{spread}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="stake" className="text-foreground">
                  How much are you wagering?
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-2xl font-bold">
                    $
                  </span>
                  <Input
                    id="stake"
                    type="number"
                    placeholder="100"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground text-center text-3xl font-bold h-16 pl-10"
                    min={1}
                    max={profile?.balance || 1000}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Available: <span className="text-primary font-medium">${profile?.balance.toLocaleString() || 0}</span>
                </p>
              </div>
              
              {/* Quick stake buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['25', '50', '100', '250'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStake(s)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      stake === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ${s}
                  </button>
                ))}
              </div>
              
              <Button
                onClick={handleStakeContinue}
                disabled={!stake.trim()}
                className="w-full bg-gradient-gold text-primary-foreground font-bold py-6"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && selectedTeam && (
            <div className="space-y-6">
              {/* Bet Summary Card */}
              <div className="p-6 bg-secondary rounded-xl border border-border">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">{selectedTeam.emoji}</span>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-foreground">{selectedTeam.name}</p>
                  <p className="text-3xl font-bold text-primary">
                    {spread.startsWith('+') || spread.startsWith('-') ? spread : `+${spread}`}
                  </p>
                  <div className="pt-4 border-t border-border mt-4">
                    <p className="text-sm text-muted-foreground">Your Wager</p>
                    <p className="text-4xl font-bold text-foreground">${parseInt(stake).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Challenge Friend Button */}
              <Button
                onClick={handleCopyChallenge}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 font-bold py-6"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5 mr-2" />
                    Challenge Friend
                  </>
                )}
              </Button>
              
              {/* Post to Arena Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-gold text-primary-foreground font-bold text-lg py-6 btn-gold-glow"
              >
                <Zap className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Posting...' : 'POST TO ARENA'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Your bet will be visible in The Arena for others to accept
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
