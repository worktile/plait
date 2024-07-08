import { PlaitBoard } from './board';

export type PlaitPlugin = (board: PlaitBoard) => PlaitBoard;

export interface WithPluginOptions {
    disabled?: boolean;
}

export interface WithSelectionPluginOptions extends WithPluginOptions {
    isMultipleSelection: boolean;
    isDisabledSelection: boolean;
    isPreventClearSelection: boolean; // is clear selection on click outside of board container
}

export enum PlaitPluginKey {
    'withSelection' = 'withSelection'
}
