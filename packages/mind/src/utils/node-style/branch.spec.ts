import { PlaitBoard, ThemeColorMode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { getTestingChildren } from '../../testing/data/basic';
import { getDefaultBranchColorByIndex } from './branch';
import { COLORFUL_BRANCH_COLORS, DEFAULT_BRANCH_COLORS } from '../../constants/theme';
import { MindThemeColors } from '../../interfaces/theme-color';

describe('utils node-style branch', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        const children = getTestingChildren();
        board = createTestingBoard([], children, { themeColors: MindThemeColors });
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    it('get default theme branch color by index', () => {
        const index = 3;
        const color = getDefaultBranchColorByIndex(board, index);
        expect(color).toEqual(DEFAULT_BRANCH_COLORS[index]);
    });

    it('get colorful theme branch color by index', () => {
        const index = 3;
        board.theme.themeColorMode = ThemeColorMode.colorful;
        const color = getDefaultBranchColorByIndex(board, index);
        expect(color).toEqual(COLORFUL_BRANCH_COLORS[index]);
    });
});
