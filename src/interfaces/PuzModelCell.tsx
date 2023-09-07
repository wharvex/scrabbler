import { getWordCoords, Word, WordCandidate } from "./Word";
import { XingWord } from "./Xing";

// Rows first, columns second
export type Coords = [number, number];

export interface PuzModelCell {
  coords: Coords;
  contents: string;
  acrossWord: string;
  downWord: string;
}

export const makePuzModelCell = (
  coords: Coords,
  contents: string,
  acrossWord: string,
  downWord: string
): PuzModelCell => {
  return {
    coords: coords,
    contents: contents,
    acrossWord: acrossWord,
    downWord: downWord
  };
};

export const doCoordsMatch = (coords1: Coords, coords2: Coords): boolean => {
  return coords1.every((coord: number, i: number) => coord === coords2[i]);
};

export const areCoordsSafe = (
  coords: Coords,
  puzModel: PuzModelCell[][]
): boolean => {
  return (
    coords[0] < puzModel.length &&
    coords[1] < puzModel[0].length &&
    coords.every(coord => coord >= 0)
  );
};

export const hasDown = (cell: PuzModelCell): boolean => {
  return Boolean(cell.downWord);
};

export const hasAcross = (cell: PuzModelCell): boolean => {
  return Boolean(cell.acrossWord);
};

export const has2Words = (cell: PuzModelCell): boolean => {
  return Boolean(cell.downWord) && Boolean(cell.acrossWord);
};

export const getPuzModelCellSafe = (
  coords: Coords,
  puzModel: PuzModelCell[][]
): PuzModelCell | undefined => {
  return areCoordsSafe(coords, puzModel)
    ? { ...puzModel[coords[0]][coords[1]] }
    : undefined;
};

export const getPuzModelCell = (
  coords: Coords,
  puzModel: PuzModelCell[][]
): PuzModelCell => {
  return { ...puzModel[coords[0]][coords[1]] };
};

export const getPuzModelWithUpdatedCells = (
  updatedCells: PuzModelCell[],
  puzModel: PuzModelCell[][]
): PuzModelCell[][] => {
  const ret: PuzModelCell[][] = [];
  let cellRow: PuzModelCell[];
  let updatedCell: PuzModelCell | undefined;
  for (let row of puzModel) {
    cellRow = [];
    for (let cell of row) {
      updatedCell = updatedCells.find(uCell =>
        doCoordsMatch(uCell.coords, cell.coords)
      );
      cellRow.push(updatedCell ? updatedCell : cell);
    }
    ret.push(cellRow);
  }
  return ret;
};

export const getUpdatedCell = (
  oldCell: PuzModelCell,
  contents: string,
  acrossWord: string,
  downWord: string
): PuzModelCell => {
  const newCell: PuzModelCell = { ...oldCell };
  newCell.contents = contents;
  newCell.acrossWord = acrossWord;
  newCell.downWord = downWord;
  return newCell;
};

export const getCoordsGeneric = (
  staticIdx: number,
  staticVal: number,
  dynamicIdx: number,
  dynamicVal: number
): Coords => {
  const ret: Coords = [-1, -1];
  ret[staticIdx] = staticVal;
  ret[dynamicIdx] = dynamicVal;
  return ret;
};

export const getSurroundCells = (
  xingWordCand: XingWord,
  coordsCand: Coords[],
  puzModel: PuzModelCell[][]
): (PuzModelCell | undefined)[] => {
  const staticDirection: number = xingWordCand.isAcross ? 0 : 1;
  const leftOrTopStatic: number = coordsCand[0][staticDirection] - 1;
  const middleStatic: number = coordsCand[0][staticDirection];
  const rightOrBottomStatic: number = coordsCand[0][staticDirection] + 1;
  const dynamicDirection: number = staticDirection ? 0 : 1;
  const beforeBeginning: PuzModelCell | undefined = getPuzModelCellSafe(
    getCoordsGeneric(
      staticDirection,
      middleStatic,
      dynamicDirection,
      coordsCand[0][dynamicDirection] - 1
    ),
    puzModel
  );
  const afterEnd: PuzModelCell | undefined = getPuzModelCellSafe(
    getCoordsGeneric(
      staticDirection,
      middleStatic,
      dynamicDirection,
      coordsCand[coordsCand.length - 1][dynamicDirection] + 1
    ),
    puzModel
  );
  const ret: (PuzModelCell | undefined)[] = [beforeBeginning, afterEnd];
  let leftOrTop: PuzModelCell | undefined;
  let rightOrBottom: PuzModelCell | undefined;
  for (let i = 0; i < coordsCand.length; i++) {
    leftOrTop = getPuzModelCellSafe(
      getCoordsGeneric(
        staticDirection,
        leftOrTopStatic,
        dynamicDirection,
        coordsCand[i][dynamicDirection]
      ),
      puzModel
    );
    rightOrBottom = getPuzModelCellSafe(
      getCoordsGeneric(
        staticDirection,
        rightOrBottomStatic,
        dynamicDirection,
        coordsCand[i][dynamicDirection]
      ),
      puzModel
    );
    ret.push(leftOrTop, rightOrBottom);
  }
  return ret;
};

export const anyBadSurroundCells = (
  surroundCells: (PuzModelCell | undefined)[],
  goodWords: string[]
): boolean => {
  for (let cell of surroundCells) {
    for (let word of goodWords) {
      if (
        cell &&
        ((cell.acrossWord && cell.acrossWord !== word) ||
          (cell.downWord && cell.downWord !== word)) &&
        cell.contents !== "*"
      )
        return true;
    }
  }
  return false;
};

export const getWordCandCells = (
  coordsCand: Coords[],
  puzModel: PuzModelCell[][]
): PuzModelCell[] => {
  return coordsCand.map((letterCoords: Coords) =>
    getPuzModelCell(letterCoords, puzModel)
  );
};

export const anyCellTakenDiffLetter = (wordCand: WordCandidate): boolean => {
  const { wordCells, xingWordCandidate } = wordCand;
  return wordCells.some(
    (cell: PuzModelCell, i: number) =>
      cell.contents !== xingWordCandidate.word[i] && cell.contents !== "*"
  );
};

export const getGoodSurroundWords = (wordCand: WordCandidate): string[] => {
  const { xingWordCandidate, wordCells, dispWord } = wordCand;
  let letterMatch: boolean;
  let oppDirection: boolean;
  const ret: string[] = [];
  const retSet: Set<string> = new Set([dispWord]);
  for (let i = 0; i < wordCells.length; i++) {
    letterMatch = wordCells[i].contents === xingWordCandidate.word[i];
    oppDirection =
      (hasAcross(wordCells[i]) && !xingWordCandidate.isAcross) ||
      (hasDown(wordCells[i]) && xingWordCandidate.isAcross);
    if (letterMatch && oppDirection && !has2Words(wordCells[i]))
      retSet.add(wordCells[i].acrossWord || wordCells[i].downWord);
  }
  retSet.forEach((word: string) => ret.push(word));
  return ret;
};

export const getPuzModelWithAddedWord = (
  word: Word,
  puzModel: PuzModelCell[][]
): PuzModelCell[][] => {
  let acrossWord: string = word.isAcross ? word.word : "";
  let downWord: string = !word.isAcross ? word.word : "";
  let oldCell: PuzModelCell;
  const updatedCells: PuzModelCell[] = [];
  for (let i = 0; i < getWordCoords(word).length; i++) {
    oldCell = getPuzModelCell(getWordCoords(word)[i], puzModel);
    acrossWord = oldCell.acrossWord || acrossWord;
    downWord = oldCell.downWord || downWord;
    updatedCells.push(
      getUpdatedCell(oldCell, word.word[i], acrossWord, downWord)
    );
  }
  return getPuzModelWithUpdatedCells(updatedCells, puzModel);
};
