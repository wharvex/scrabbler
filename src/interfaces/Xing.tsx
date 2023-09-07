import {
  getWordCoords,
  Word,
  getWord,
} from "./Word";

export interface XingWord {
  word: string;
  letterIdxInWord: number;
  isAcross: boolean;
  isCandidate: null | boolean;
}

export type Xing = [XingWord, XingWord];

export const makeXingWord = (
  word: string,
  letterIdxInWord: number,
  isAcross: boolean
): XingWord => {
  return {
    word: word,
    letterIdxInWord: letterIdxInWord,
    isAcross: isAcross,
    isCandidate: null,
  };
};

export const getXingWordWithUpdatedIsCandidate = (
  xingWord: XingWord,
): XingWord => {
  return {
    ...xingWord,
    isCandidate: true,
  };
};

export const doXingWordAndWordMatch = (
  xingWord: XingWord,
  word: Word
): boolean => {
  return word.word === xingWord.word && word.isAcross === xingWord.isAcross;
};

export const getXingWordMatchIdx = (
  word: Word,
  xing: Xing
): number | undefined => {
  if (doXingWordAndWordMatch(xing[0], word)) return 0;
  else if (doXingWordAndWordMatch(xing[1], word)) return 1;
  else return;
};

export const getCandFromHalfDispXing = (xing: Xing): XingWord => {
  return {
    ...(xing.find((xingWord: XingWord) => xingWord.isCandidate) as XingWord)
  };
};

export const getNonCandFromHalfDispXing = (xing: Xing): XingWord => {
  return {
    ...(xing.find((xingWord: XingWord) => !xingWord.isCandidate) as XingWord)
  };
};

export const getHalfDisplayedXings = (
  displayedWords: Word[],
  xings: Xing[]
): Xing[] => {
  const ret: Xing[] = [];
  let xingWordMatchIdx: number | undefined; // Displayed word.
  let otherXingWordIdx: number; // Potential candidate.
  let updatedXing: Xing;
  for (let word of displayedWords) {
    for (let xing of xings) {
      xingWordMatchIdx = getXingWordMatchIdx(word, xing);
      if (xingWordMatchIdx === undefined) continue;
      otherXingWordIdx = xingWordMatchIdx ? 0 : 1;
      // Check if other xingWord is displayed as well.
      if (displayedWords.some(dw => dw.word === xing[otherXingWordIdx].word))
        continue;
      updatedXing = [...xing];
      updatedXing[otherXingWordIdx] = getXingWordWithUpdatedIsCandidate(
        updatedXing[otherXingWordIdx],
      );
      ret.push(updatedXing);
    }
  }
  return ret;
};
