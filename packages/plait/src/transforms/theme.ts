import { SetThemeOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { PlaitTheme } from '../interfaces';

export function setTheme(board: PlaitBoard, themeColorMode: PlaitTheme) {
    const operation: SetThemeOperation = { type: 'set_theme', properties: board.theme, newProperties: themeColorMode };
    board.apply(operation);
}

export interface ThemeTransforms {
    setTheme: (board: PlaitBoard, themeColorMode: PlaitTheme) => void;
}

export const ViewportTransforms: ThemeTransforms = {
    setTheme
};
