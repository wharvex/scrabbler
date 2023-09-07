import { Word, WordCandidate } from "./Word";
import { PuzModelCell } from "./PuzModelCell";

export interface PassStageState {
  vcIdx: number;
  triedVCIdxs: number[];
  vcs: WordCandidate[];
  words: Word[];
  puzMod: PuzModelCell[][];
}

export const makePassStageState = (
  vcIdx: number,
  triedVCIdxs: number[],
  vcs: WordCandidate[],
  words: Word[],
  puzMod: PuzModelCell[][]
): PassStageState => {
  return {
    vcIdx: vcIdx,
    triedVCIdxs: triedVCIdxs,
    vcs: vcs,
    words: words,
    puzMod: puzMod
  };
};

export type Passes = PassStageState[][];
export type Pass = PassStageState[];

export const getLastPSS = (passes: Passes): PassStageState => {
  const lastPass: Pass = passes[passes.length - 1];
  return { ...lastPass[lastPass.length - 1] };
};

export const hasNextVC = (pss: PassStageState): boolean => {
  return getVCGap(pss) > 1;
};

export const getVCGap = (pss: PassStageState): number => {
  return pss.vcs.length - pss.triedVCIdxs.length;
};

export const copyPasses = (passes: Passes): Passes => {
  return passes.map((pass: Pass) =>
    pass.map((pss: PassStageState) => ({ ...pss }))
  );
};

export const copyPass = (pass: Pass): Pass => {
  return pass.map((pss: PassStageState) => ({ ...pss }));
};

export const sliceEnd = (arr: any[]): any[] => {
  return arr.slice(0, arr.length - 1);
};

export const sliceTo = (arr: any[], to: number): any[] => {
  return arr.slice(0, to);
};

export const getRand = (lim: number): number => {
  return Math.floor(Math.random() * lim);
};

export const getLastPSSSafe = (passes: Passes): PassStageState | undefined => {
  const lastPSS: PassStageState = getLastPSS(passes);
  return lastPSS.vcIdx >= 0 ? lastPSS : undefined;
};

export const getVCIdx = (pss: PassStageState): number => {
  let idx: number = getRand(pss.vcs.length);
  while (pss.triedVCIdxs.includes(idx)) idx = getRand(pss.vcs.length);
  return idx;
};

export const getPassesNewPSSSamePass = (
  passes: Passes,
  newVCs: WordCandidate[],
  newWords: Word[],
  newPuzMod: PuzModelCell[][]
): Passes => {
  const vcIdx: number = getRand(newVCs.length);
  const retPSS: PassStageState = makePassStageState(
    vcIdx,
    [vcIdx],
    newVCs,
    newWords,
    newPuzMod
  );
  const retPass: Pass = copyPass(passes[passes.length - 1]);
  const ret: Passes = copyPasses(sliceEnd(passes));
  retPass.push(retPSS);
  ret.push(retPass);
  return ret;
};

export const getPassesNewPassPrevStage = (passes: Passes): Passes => {
  const ret: Passes = copyPasses(passes);
  let useStage: number | undefined = undefined;
  let topVCGap: number = 1;
  for (let i = 0; i < ret[ret.length - 1].length; i++) {
    if (
      hasNextVC(ret[ret.length - 1][i]) &&
      getVCGap(ret[ret.length - 1][i]) > topVCGap
    ) {
      topVCGap = getVCGap(ret[ret.length - 1][i]);
      useStage = i;
    }
  }
  if (useStage !== undefined) {
    const retPass: Pass = copyPass(sliceTo(ret[ret.length - 1], useStage + 1));
    const vcIdx: number = getVCIdx(retPass[useStage]);
    retPass[useStage].vcIdx = vcIdx;
    retPass[useStage].triedVCIdxs.push(vcIdx);
    ret.push(retPass);
  } else {
    // This is the only thing that ends the while loop (besides 'lim').
    ret.push([makePassStageState(-1, [], [], [], [])]);
  }
  return ret;
};

export const getPassesNewPassSameStage = (passes: Passes): Passes => {
  const ret: Passes = copyPasses(passes);
  const retPass: Pass = copyPass(ret[ret.length - 1]);
  const lastPSS: PassStageState = retPass[retPass.length - 1];
  const vcIdx: number = getVCIdx(lastPSS);
  lastPSS.vcIdx = vcIdx;
  lastPSS.triedVCIdxs.push(vcIdx);
  ret.push(retPass);
  return ret;
};

// Ignore all this stuff below here.
// pushNewStage at end of loop if there are new vcs. Gets as params the new state created in the loop.
// pushNewPass at end of loop if there are no new vcs. Gets as params the old state the loop retrieved at the beginning.
// export const pushNewPass = (
//   pss: PassStageState,
//   passes: Passes
// ): Passes | undefined => {
// If returns undefined then break the while loop.
// Returns passes with partially updated final pass. Update completes at beginning of while loop when grabbing state from the final pass.
// let newPSS: PassStageState = { ...pss, passIdx: pss.passIdx + 1 };
// let newVCIdx: number = pss.vcIdx + 1;
// if (newVCIdx >= pss.vcs.length)
//   if (pss.stageIdx > 0) newPSS.stageIdx--;
//   else newPSS.vcIdx++;

// construct state from last stage of last pass passIdxPointer and stageIdx.
// isPassesPointerValid at beginning of loop.
// while (passes[passes.length - 1][passes[passes.length - 1].length - 1].passIdxPointer >= 0)
// let prevPointerLastStageIdx: number;
// if (newPSS.vcIdx < pss.vcs.length)
//   if (pss.stageIdx > 0) {
//     newPSS = {
//       ...passes[pss.passIdxPointer][pss.stageIdx - 1],
//       vcIdx: passes[pss.passIdxPointer][pss.stageIdx - 1].vcIdx + 1
//     };
//   } else if (pss.passIdxPointer > 0) {
//   prevPointerLastStageIdx = passes[pss.passIdxPointer - 1].length - 1;

//     newPSS = {
//       ...passes[pss.passIdxPointer - 1][prevPointerLastStageIdx],

//     };
//   }
//   return;
// };
