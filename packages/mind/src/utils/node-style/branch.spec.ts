import { PlaitBoard, ThemeColorMode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { getTestingChildren } from '../../testing/data/basic';
import { getDefaultBranchColorByIndex } from './branch';
import { COLORFUL_BRANCH_COLORS, DEFAULT_BRANCH_COLORS } from '../../constants/theme';
import { MindThemeColor } from '../../interfaces/theme-color';

describe('utils node-style branch', () => {
    let board: PlaitBoard;
    const index = 3;
    beforeEach(() => {
        const children = getTestingChildren();
        board = createTestingBoard([], children, { themeColors: MindThemeColor });
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    it('get default theme branch color by index', () => {
        const color = getDefaultBranchColorByIndex(board, index);
        expect(color).toEqual(DEFAULT_BRANCH_COLORS[index]);
    });

    it('get colorful theme branch color by index', () => {
        board.theme.themeColorMode = ThemeColorMode.colorful;
        const color = getDefaultBranchColorByIndex(board, index);
        expect(color).toEqual(COLORFUL_BRANCH_COLORS[index]);
    });
});
