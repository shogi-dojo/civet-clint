import React from "react";
import { Badge } from "./Badge";

export default function PlayerCard(props: { player: Player; onSelect: () => void }) {
  const player = props.player;
  const hasRank = player.rank !== null;

  return (
    <div className="player-card featured" id="main-card" onClick={props.onSelect}>
      <Badge label={player.name} count={player.tags.length} active={props.active} />
      <span className="score">{formatScore(player.score)}</span>
      <pre className="raw">{JSON.stringify(player)}</pre>
    </div>
  );
}
