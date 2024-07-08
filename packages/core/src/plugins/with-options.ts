import { PlaitBoard } from '../interfaces/board';
import { WithPluginOptions } from '../interfaces/plugin';

export interface PlaitOptionsBoard extends PlaitBoard {
    getPluginOptions: <K = WithPluginOptions>(key: string) => K;
    setPluginOptions: <K = WithPluginOptions>(key: string, value: Partial<K>) => void;
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
