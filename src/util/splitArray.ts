/**
 * @param arrayToSplit
 * @param evaluationCallback
 */
export function splitArray<ArrayContent = unknown>(
  arrayToSplit: ArrayContent[],
  evaluationCallback: (
    entry: ArrayContent,
    index: number,
    sourceArray: ArrayContent[]
  ) => boolean
): SplitArrayResult<ArrayContent> {

  return arrayToSplit.reduce<
  SplitArrayResult<ArrayContent>
  >((state, event, index) => {
    (
      evaluationCallback(event, index, arrayToSplit)
        ? state.accepted
        : state.rejected
    ).push(event);

    return state;
  }, { accepted: [], rejected: [] });
}

export interface SplitArrayResult<ArrayContent> {
  accepted: ArrayContent[];
  rejected: ArrayContent[];
}
