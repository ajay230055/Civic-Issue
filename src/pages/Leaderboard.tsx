import React from 'react';
import { fetchIssues } from '../services/api';

const Leaderboard: React.FC = () => {
  const [rows, setRows] = React.useState<{ user: string; points: number }[]>([]);
  React.useEffect(()=>{
    fetchIssues().then((all)=>{
      const map = new Map<string, number>();
      all.forEach((i)=>{
        const p = i.rewardPoints || 0;
        map.set(i.reporterName, (map.get(i.reporterName) || 0) + p);
      });
      const arr = Array.from(map.entries()).map(([user, points])=>({ user, points }))
        .sort((a,b)=> b.points - a.points).slice(0, 20);
      setRows(arr);
    });
  },[]);
  return (
    <div className="container">
      <h1>Leaderboard</h1>
      <ul className="list">
        {rows.map((r)=> (
          <li key={r.user}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{r.user}</span>
              <span className="badge badge-aqua">{r.points} pts</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;


