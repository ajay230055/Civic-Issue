import React from 'react';

interface RewardsContextType {
  total: number;
  add: (points: number) => void;
  reset: () => void;
}

const RewardsContext = React.createContext<RewardsContextType | undefined>(undefined);
const KEY = 'rewards_total_v1';

export const RewardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [total, setTotal] = React.useState<number>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? Number(raw) || 0 : 0;
  });

  const add = (points: number) => {
    setTotal((t) => {
      const n = t + points;
      localStorage.setItem(KEY, String(n));
      return n;
    });
  };

  const reset = () => {
    setTotal(0);
    localStorage.setItem(KEY, '0');
  };

  return (
    <RewardsContext.Provider value={{ total, add, reset }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = () => {
  const ctx = React.useContext(RewardsContext);
  if (!ctx) throw new Error('useRewards must be used within RewardsProvider');
  return ctx;
};


