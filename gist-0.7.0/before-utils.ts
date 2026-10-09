import { formatScore } from "./format";
import type { Player } from "./types";

export interface Standing {
  id: string;
  rank: number | undefined;
  tags: string[];
}

export class Leaderboard {
  entries: Standing[] = [];

  add(entry: Standing): number {
    this.entries.push(entry);
    return this.entries.length;
  }

  pinnedTags(): string[] {
    return this.entries.flatMap((entry) => entry.tags);
  }
}

export function summarize(players: Player[], cutoff: number): string[] {
  const board = new Leaderboard();
  let kept = 0;

  if (!cutoff) {
    return [];
  }

  for (const player of players) {
    if (player.score === null || player.score === undefined) {
      continue;
    }
    if (player.score > cutoff && player.name.length > 0) {
      board.add({ id: player.id, tags: player.tags });
      kept += 1;
    }
  }

  const labels = board.pinnedTags().map((tag) => tag.trim());
  const isText = typeof labels[0] === "string";

  return labels;
}

export const makeCounter = () => {
  let n = 0;
  return () => {
    n += 1;
    return n;
  };
};
