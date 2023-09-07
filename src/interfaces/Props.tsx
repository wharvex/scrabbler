import {
  Word,
  makeWord,
  getUpdatedFirstWord,
  getWordsWithUpdatedWord,
  getDisplayedWords
} from "./Word";
import { Xing, makeXingWord } from "./Xing";
import {
  PuzModelCell,
  makePuzModelCell,
  getPuzModelWithAddedWord
} from "./PuzModelCell";
import { generate } from "random-words";
import { exit } from "process";

const initWords = (
  wordsQty: number,
  puzModel: PuzModelCell[][]
): Word[] | undefined => {
  const wordsSet: Set<string> = new Set(generate(wordsQty));
  while (wordsSet.size < wordsQty)
    wordsSet.add(...(generate(1) as [string]));
  const wordsArr: Word[] = [];
  wordsSet.forEach(word => wordsArr.push(makeWord(word)));
  let updatedFirstWord: Word | undefined = getUpdatedFirstWord(
    wordsArr[0],
    puzModel
  );
  if (!updatedFirstWord) {
    for (let w of wordsArr) {
      updatedFirstWord = getUpdatedFirstWord(w, puzModel);
      if (updatedFirstWord) break;
    }
  }
  if (!updatedFirstWord) return;
  return getWordsWithUpdatedWord(updatedFirstWord, wordsArr);
};

const initPuzModel = (
  puzHeight: number,
  puzWidth: number
): PuzModelCell[][] => {
  const puzModel: PuzModelCell[][] = [];
  for (let i = 0; i < puzHeight; i++) {
    const row: PuzModelCell[] = [];
    for (let j = 0; j < puzWidth; j++) {
      row.push(makePuzModelCell([i, j], "*", "", ""));
    }
    puzModel.push(row);
  }
  return puzModel;
};

const initXings = (words: Word[]): Xing[] => {
  const xings: Xing[] = [];
  for (let h = 0; h < words.length - 1; h++) {
    for (let i = 0; i < words[h].word.length; i++) {
      for (let j = h + 1; j < words.length; j++) {
        for (let k = 0; k < words[j].word.length; k++) {
          if (words[h].word[i] === words[j].word[k]) {
            xings.push([
              makeXingWord(words[h].word, i, true),
              makeXingWord(words[j].word, k, false)
            ]);
            xings.push([
              makeXingWord(words[h].word, i, false),
              makeXingWord(words[j].word, k, true)
            ]);
          }
        }
      }
    }
  }
  return xings;
};

export interface Props {
  wordsQty: number;
  puzWidth: number;
  puzHeight: number;
  dispWordsQty: number;
  words: Word[];
  xings: Xing[];
  puzModel: PuzModelCell[][];
  origWords: Word[];
}

export const initProps = (
  wordsQty: number,
  puzHeight: number,
  puzWidth: number,
  origWordsParam: Word[] | undefined = undefined
): Props => {
  const puzModel: PuzModelCell[][] = initPuzModel(puzHeight, puzWidth);
  const words: Word[] | undefined = origWordsParam
    ? origWordsParam
    : initWords(wordsQty, puzModel);
  try {
    if (!words) throw new Error("Bad words.");
    else
      return {
        wordsQty: wordsQty,
        puzWidth: puzWidth,
        puzHeight: puzHeight,
        dispWordsQty: 1,
        words: words,
        xings: initXings(words),
        puzModel: getPuzModelWithAddedWord(
          getDisplayedWords(words)[0],
          puzModel
        ),
        origWords: words
      };
  } catch (error) {
    exit();
  }
};
