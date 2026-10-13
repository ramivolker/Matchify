// Rotate only the current local queue; no interaction or persistence is involved.
export function passCandidate(queue, candidateId) {
  const index = queue.findIndex(({ id }) => id === candidateId);
  if (queue.length < 2 || index < 0 || index === queue.length - 1) return queue;
  return [...queue.slice(0, index), ...queue.slice(index + 1), queue[index]];
}
