import { FieldValues } from "react-hook-form";

const BASE: string = "0123456789abcdefghijklmnopqrstuvwxyz";
const MIN_CHAR: string = BASE[0];
const MAX_CHAR: string = BASE[BASE.length - 1];

/**
 * Generates a new LexoRank string lexicographically between two ranks.
 *
 * @param prev - Rank of the item above (null/undefined if dropped at top)
 * @param next - Rank of the item below (null/undefined if dropped at bottom)
 */
export function rankBetween(prev: string | null, next: string | null): string {
  if (prev && next && prev >= next) {
    throw new Error(`Invalid rank order: prev ("${prev}") must be strictly less than next ("${next}")`);
  }

  // Empty list baseline at midpoint of 2-character Base-36 space
  if (!prev && !next) {
    return MIN_CHAR;
  }

  const prevRank: string = prev || "";
  const nextRank: string = next || "";

  let result: string = "";
  const length: number = !prev && !next
    ? 1
    : prev && !next
      ? prev.length + 2
      : Math.max(prev?.length ?? 0, next?.length ?? 0);

  for (let i = 0; i <= length; i++) {
    const currentCharForPrevRank: string = i < prevRank.length ? prevRank[i] : MIN_CHAR;
    const currentCharForNextRank: string = i < nextRank.length ? nextRank[i] : MAX_CHAR;
    const currentCharIndexForPrevRank: number = BASE.indexOf(currentCharForPrevRank);
    const currentCharIndexForNextRank: number = BASE.indexOf(currentCharForNextRank);
    if (currentCharIndexForPrevRank === -1 || currentCharIndexForNextRank === -1) {
      throw new Error(`Invalid character in rank string: "${prev}" or "${next}"`);
    }

    // Characters match or gap of one, continue to next index
    if (currentCharIndexForNextRank - currentCharIndexForPrevRank <= 1) {
      result += currentCharForPrevRank;
      continue;
    }

    // For a large gap, simply use the current midpoint
    const midIndex: number = Math.floor((currentCharIndexForPrevRank + currentCharIndexForNextRank) / 2);
    return result + BASE[midIndex];
  }
}

/**
 * Generates LexoRanks for missing instances.
 * 
 * @param instances Presorted data according to lexorank and other criteria.
 */
export function genLexoRanks(instances: FieldValues[], syncTasks: (_id: string, _lexorank: string) => void): FieldValues[] {
  if (instances.length <= 0) return instances;
  const ranked: FieldValues[] = [];
  const unranked: FieldValues[] = [];

  for (const instance of instances) {
    if (instance.rank && instance.rank.trim() !== "") {
      ranked.push(instance);
    } else {
      unranked.push(instance);
    }
  }

  // Append missing lexoranks
  const lastRank: string | null = ranked.length > 0
    ? ranked[ranked.length - 1].rank!
    : null;

  const newRanks: string[] = genRanksAfter(lastRank, unranked.length);
  const newlyRanked: FieldValues[] = unranked.map((task, index) => {
    syncTasks(task.event_id, newRanks[index]);
    return {
      ...task,
      lexorank: newRanks[index],
    };
  });

  return [...ranked, ...newlyRanked];
}

/**
 * Generates N evenly spaced LexoRanks that come strictly AFTER `startRank`.
 *
 * @param startRank - The last known rank in the list (or null if list is empty)
 * @param count - The number of missing/unranked tasks to generate ranks for
 */
export function genRanksAfter(
  startRank: string | null,
  count: number
): string[] {
  if (count <= 0) return [];

  // Determine target character length (min 2 characters)
  let length: number = Math.max(startRank ? startRank.length : 0, 2);
  let startValAndHeadroom: number[] = computeStartValAndHeadroom(startRank, length);

  // Expand length if there isn't enough numerical space
  if (startValAndHeadroom[1] < count + 1) {
    length += 2;
    startValAndHeadroom = computeStartValAndHeadroom(startRank, length);
  }

  // Use headroom to compute steps
  const step: number = Math.floor(startValAndHeadroom[1] / (count + 1));
  const ranks: string[] = [];
  for (let i = 1; i <= count; i++) {
    // Use start value to compute next value with padded starting 0
    const nextVal: number = startValAndHeadroom[0] + (i * step);
    ranks.push(nextVal.toString(36).padStart(length, MIN_CHAR));
  }

  return ranks;
}

/**
 * Computes the headroom between start and maximum values.
 *
 * @param startRank - The last known rank in the list (or null if list is empty)
 * @param length - The target character length to aim for (min 2)
 */
function computeStartValAndHeadroom(
  startRank: string | null,
  length: number
): number[] {
  // Pad startRank with trailing zeros to match target length (e.g., "r" -> "r0")
  const paddedStart: string = startRank ? startRank.padEnd(length, MIN_CHAR) : MIN_CHAR.repeat(length);
  const startVal: number = parseInt(paddedStart, 36);
  const maxVal: number = parseInt(MAX_CHAR.repeat(length), 36);
  return [startVal, maxVal - startVal];
}