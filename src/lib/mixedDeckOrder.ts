/** All words, interleaved with heavy weight toward needs-review / learning. */
export function orderMixedDeck<T>(args: {
  forgotten: T[];
  toStudy: T[];
  known: T[];
}): T[] {
  const shuffle = <U>(arr: U[]) => [...arr].sort(() => Math.random() - 0.5);

  const pools = {
    FORGOTTEN: shuffle(args.forgotten),
    TO_STUDY: shuffle(args.toStudy),
    KNOWN: shuffle(args.known),
  };

  const plan = [
    ...Array.from({ length: 8 }, () => "FORGOTTEN" as const),
    ...Array.from({ length: 3 }, () => "TO_STUDY" as const),
    ...Array.from({ length: 1 }, () => "KNOWN" as const),
  ];

  const out: T[] = [];

  while (pools.FORGOTTEN.length || pools.TO_STUDY.length || pools.KNOWN.length) {
    let progressed = false;
    for (const bucket of plan) {
      const pool = pools[bucket];
      if (!pool.length) continue;
      out.push(pool.shift()!);
      progressed = true;
    }
    if (!progressed) break;
  }

  return out;
}
