import { initProps, Props } from "./interfaces/Props";
import {
    Word,
    WordCandidate,
    getDisplayedWords,
    makeWordCandsFromHalfDispXings,
    getUpdatedWord,
    getWordsWithUpdatedWord
} from "./interfaces/Word";
import { Xing, getHalfDisplayedXings } from "./interfaces/Xing";
import {
    PuzModelCell,
    anyCellTakenDiffLetter,
    getGoodSurroundWords,
    anyBadSurroundCells,
    getPuzModelWithAddedWord
} from "./interfaces/PuzModelCell";
import {
    makePassStageState,
    Passes,
    PassStageState,
    getPassesNewPSSSamePass,
    copyPasses,
    getLastPSSSafe,
    getLastPSS,
    getPassesNewPassPrevStage,
} from "./interfaces/PassStageState";

const getVettedCandidates = (
    puzModel: PuzModelCell[][],
    xings: Xing[],
    words: Word[]
): WordCandidate[] => {
    const displayedWords: Word[] = getDisplayedWords(words);
    const halfDispXings: Xing[] = getHalfDisplayedXings(displayedWords, xings);
    const wordCandidates: WordCandidate[] = makeWordCandsFromHalfDispXings(
        halfDispXings,
        words,
        puzModel
    );
    const ret: WordCandidate[] = [];
    let goodWords: string[];
    for (let cand of wordCandidates) {
        if (anyCellTakenDiffLetter(cand)) continue;
        goodWords = getGoodSurroundWords(cand);
        if (!goodWords.length) continue;
        if (anyBadSurroundCells(cand.surroundCells, goodWords)) continue;
        ret.push(cand);
    }
    return ret;
};

export const getBestPuzModel2 = (
    props: Props,
    vcsParam: WordCandidate[]
): [number, PuzModelCell[][], Word[]] => {
    let curVCIdx: number;
    let curVCs: WordCandidate[];
    let curWords: Word[];
    let curPuzModel: PuzModelCell[][];
    let newVCs: WordCandidate[];
    let newWord: Word;
    let newWords: Word[];
    let newPuzModel: PuzModelCell[][];
    const firstVCIdx: number = Math.floor(Math.random() * vcsParam.length);
    let passes: Passes = [
        [
            makePassStageState(
                firstVCIdx,
                [firstVCIdx],
                [...vcsParam],
                [...props.words],
                [...props.puzModel]
            )
        ]
    ];
    let lim: number = 0;
    let curPSS: PassStageState;
    while (getLastPSSSafe(passes) && lim < 33) {
        curPSS = getLastPSS(passes);
        ({
            vcIdx: curVCIdx,
            vcs: curVCs,
            words: curWords,
            puzMod: curPuzModel
        } = curPSS);
        // BEGIN LOOP BODY
        newWord = getUpdatedWord(
            curVCs[curVCIdx].xingWordCandidate.word,
            curVCs[curVCIdx].xingWordCandidate.isAcross,
            curVCs[curVCIdx].wordCells.map((cell: PuzModelCell) => cell.coords)
        );
        newWords = getWordsWithUpdatedWord(newWord, curWords);
        newPuzModel = getPuzModelWithAddedWord(newWord, curPuzModel);
        newVCs = getVettedCandidates(newPuzModel, props.xings, newWords);
        // END LOOP BODY -- BEGIN POST-TESTS
        if (newVCs.length) {
            passes = getPassesNewPSSSamePass(passes, newVCs, newWords, newPuzModel);
            // } else if (hasNextVC(curPSS)) {
            //   passes = getPassesNewPassSameStage(passes);
            //   console.log("New pass same stage: ", copyPasses(passes));
            //   lim++;
        } else {
            passes = getPassesNewPassPrevStage(passes);
            lim++;
        }
    }
    console.log(copyPasses(passes))
    let longestPassIdx: number = 0;
    let longestPassLength: number = 0;
    for (let i = 0; i < passes.length; i++) {
        if (passes[i].length > longestPassLength) {
            longestPassLength = passes[i].length;
            longestPassIdx = i;
        }
    }
    const longestPassLastPSS: PassStageState =
        passes[longestPassIdx][passes[longestPassIdx].length - 1];
    return [
        longestPassLength,
        longestPassLastPSS.puzMod,
        longestPassLastPSS.words
    ];
};

export const driver = (
    props: Props,
    getBest: boolean,
    step: boolean
): Props => {
    if (!step) {
        props = initProps(
            props.wordsQty,
            props.puzHeight,
            props.puzWidth,
            props.origWords
        );
    }
    let vettedCandidates: WordCandidate[] = getVettedCandidates(
        props.puzModel,
        props.xings,
        props.words
    );
    if (!vettedCandidates.length) return { ...props };
    if (getBest) {
        [props.dispWordsQty, props.puzModel, props.words] = getBestPuzModel2(
            props,
            vettedCandidates
        );
        return { ...props };
    }
    let vetIdx = Math.floor(Math.random() * vettedCandidates.length);
    let vcWord: Word;
    while (vettedCandidates.length) {
        props.dispWordsQty++;
        vcWord = getUpdatedWord(
            vettedCandidates[vetIdx].xingWordCandidate.word,
            vettedCandidates[vetIdx].xingWordCandidate.isAcross,
            vettedCandidates[vetIdx].wordCells.map(
                (cell: PuzModelCell) => cell.coords
            )
        );
        props.words = getWordsWithUpdatedWord(vcWord, props.words);
        props.puzModel = getPuzModelWithAddedWord(vcWord, props.puzModel);
        vettedCandidates = getVettedCandidates(
            props.puzModel,
            props.xings,
            props.words
        );
        vetIdx = Math.floor(Math.random() * vettedCandidates.length);
    }
    return {
        ...props
    };
};
