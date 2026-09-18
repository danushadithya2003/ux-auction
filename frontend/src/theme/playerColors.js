// Players are colored by join order from a fixed four-color set, cycling
// if a fifth or more player joins.
export const PLAYER_COLORS = ["#7C5CFF", "#00E5FF", "#3DDC84", "#FFC24B"];

export function colorForPlayer(playerId, players) {
  const idx = players.findIndex((p) => p.id === playerId);
  return PLAYER_COLORS[(idx >= 0 ? idx : 0) % PLAYER_COLORS.length];
}
