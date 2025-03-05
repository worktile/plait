import { PlaitBoard } from '../interfaces/board';

export interface PlaitI18nBoard extends PlaitBoard {
    getI18nValue: (key: string) => string | null;
}

export const withI18n = (board: PlaitBoard) => {
    const newBoard = board as PlaitI18nBoard;

    newBoard.getI18nValue = (key) => {
        console.warn(`I18n key "${key}" is not found.`);
        return null;
    };

    return newBoard;
};

export const getI18nValue = (board: PlaitBoard, key: string, defaultValue = '') => {
    const i18nBoard = board as PlaitI18nBoard;
    return i18nBoard.getI18nValue(key) || defaultValue;
};
