export const startOfNextDay = (date: Date): Date => {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
};

export const isBeforeOrEqual = (dateA: Date | null | undefined, dateB: Date): boolean => {
  if (!dateA) {
    return true;
  }
  return dateA.getTime() <= dateB.getTime();
};

export const hoursDifference = (from: Date, to: Date): number => {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60);
};
