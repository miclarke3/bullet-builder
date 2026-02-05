export interface Team {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  record: string;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: Date;
  venue: string;
}

const teams: Record<string, Team> = {
  lakers: {
    id: 'lakers',
    name: 'Los Angeles Lakers',
    shortName: 'LAL',
    emoji: '💜💛',
    record: '32-18',
  },
  warriors: {
    id: 'warriors',
    name: 'Golden State Warriors',
    shortName: 'GSW',
    emoji: '💙💛',
    record: '28-22',
  },
  bulls: {
    id: 'bulls',
    name: 'Chicago Bulls',
    shortName: 'CHI',
    emoji: '🐂',
    record: '24-26',
  },
  heat: {
    id: 'heat',
    name: 'Miami Heat',
    shortName: 'MIA',
    emoji: '🔥',
    record: '30-20',
  },
  celtics: {
    id: 'celtics',
    name: 'Boston Celtics',
    shortName: 'BOS',
    emoji: '☘️',
    record: '40-10',
  },
  nets: {
    id: 'nets',
    name: 'Brooklyn Nets',
    shortName: 'BKN',
    emoji: '🖤🤍',
    record: '20-30',
  },
  suns: {
    id: 'suns',
    name: 'Phoenix Suns',
    shortName: 'PHX',
    emoji: '☀️',
    record: '33-17',
  },
  nuggets: {
    id: 'nuggets',
    name: 'Denver Nuggets',
    shortName: 'DEN',
    emoji: '⛏️',
    record: '35-15',
  },
  knicks: {
    id: 'knicks',
    name: 'New York Knicks',
    shortName: 'NYK',
    emoji: '🗽',
    record: '31-19',
  },
  sixers: {
    id: 'sixers',
    name: 'Philadelphia 76ers',
    shortName: 'PHI',
    emoji: '🔔',
    record: '29-21',
  },
};

// Generate upcoming games relative to current date
const generateUpcomingGames = (): Game[] => {
  const now = new Date();
  
  return [
    {
      id: 'game-1',
      homeTeam: teams.lakers,
      awayTeam: teams.warriors,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      venue: 'Crypto.com Arena',
    },
    {
      id: 'game-2',
      homeTeam: teams.bulls,
      awayTeam: teams.heat,
      startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      venue: 'United Center',
    },
    {
      id: 'game-3',
      homeTeam: teams.celtics,
      awayTeam: teams.nets,
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      venue: 'TD Garden',
    },
    {
      id: 'game-4',
      homeTeam: teams.suns,
      awayTeam: teams.nuggets,
      startTime: new Date(now.getTime() + 26 * 60 * 60 * 1000), // Tomorrow + 2h
      venue: 'Footprint Center',
    },
    {
      id: 'game-5',
      homeTeam: teams.knicks,
      awayTeam: teams.sixers,
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 days from now
      venue: 'Madison Square Garden',
    },
  ];
};

export const upcomingGames = generateUpcomingGames();

export const formatGameTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 24) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffHours < 48) {
    return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
};
