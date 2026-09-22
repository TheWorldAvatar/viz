import { FieldValues } from "react-hook-form";

const BASE: string = "0123456789abcdefghijklmnopqrstuvwxyz";
const MIN_CHAR: string = BASE[0];
const MAX_CHAR: string = BASE[BASE.length - 1];

/**
 * Generates LexoRanks for missing instances.
 * 
 * @param instances Presorted data according to lexorank and other criteria.
 */
export function genLexoRanks(instances: FieldValues[]): FieldValues[] {
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