import { PlaitBoard } from '../interfaces/board';

export interface PlaitPluginOptions {
    disabled?: boolean;
}

export interface PlaitOptionsBoard extends PlaitBoard {
    getPluginOptions: <K = PlaitPluginOptions>(key: string) => K;
    setPluginOptions: <K = PlaitPluginOptions>(key: string, value: Partial<K>) => void;
}

export const withOptions = (board: PlaitBoard) => {
    const pluginOptions = new Map<string, any>();
    const newBoard = board as PlaitOptionsBoard;

    newBoard.getPluginOptions = key => {
        return pluginOptions.get(key);
    };

    newBoard.setPluginOptions = (key, options) => {
        const oldOptions = newBoard.getPluginOptions(key) || {};
        pluginOptions.set(key, { ...oldOptions, ...options });
    };

    return newBoard;
};
