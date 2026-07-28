import { PlaitBoard, PlaitBoardOptions, PlaitElement, PlaitPlugin } from '../../interfaces';
import { createBoard } from '../../plugins/create-board';
import { cacheSelectedElements, findElements, getSelectedElements, KEY_TO_ELEMENT_MAP } from '../../utils';
import { BOARD_TO_SELECTED_ELEMENT, IS_BOARD_ALIVE } from '../../utils/weak-maps';
import {
    clearBoardElementHost,
    clearBoardHost,
    clearBoardRoughSVG,
    fakeBoardElementHost,
    fakeBoardHost,
    fakeBoardRoughSVG
} from './mock-host';
import { clearNodeWeakMapByNodes, fakeNodeWeakMap } from './mock-weak-map';

export interface TestingBoardFixture {
    board: PlaitBoard;
    destroy: () => void;
}

/**
 * 1.create board instance
 * 2.build fake node weak map
 */
export const createTestingBoard = (
    plugins: PlaitPlugin[],
    children: PlaitElement[],
    options: PlaitBoardOptions = { readonly: false, hideScrollbar: true, disabledScrollOnNonFocus: false }
) => {
    let board = createBoard(children, options);
    plugins.forEach((plugin) => {
        board = plugin(board);
    });
    KEY_TO_ELEMENT_MAP.set(board, new Map());
    return board;
};

export interface SetupTestingBoardOptions {
    boardOptions?: PlaitBoardOptions;
    selectedElements?: any[];
    withNodeWeakMap?: boolean;
    withElementHost?: boolean;
    withHost?: boolean;
    withRoughSVG?: boolean;
    alive?: boolean;
}

export const setupTestingBoard = (
    plugins: PlaitPlugin[],
    children: PlaitElement[],
    options: SetupTestingBoardOptions = {}
): TestingBoardFixture => {
    const {
        boardOptions,
        selectedElements,
        withNodeWeakMap = true,
        withElementHost = true,
        withHost = true,
        withRoughSVG = false,
        alive = true
    } = options;

    const board = createTestingBoard(plugins as PlaitPlugin[], children as PlaitElement[], boardOptions);
    const mappedNodes = new Set<PlaitElement>();

    if (withNodeWeakMap) {
        fakeNodeWeakMap(board, mappedNodes);
    }
    if (withElementHost) {
        fakeBoardElementHost(board);
    }
    if (withHost) {
        fakeBoardHost(board);
    }
    if (withRoughSVG) {
        fakeBoardRoughSVG(board);
    }
    if (selectedElements) {
        cacheSelectedElements(board, selectedElements as PlaitElement[]);
    }
    if (alive) {
        IS_BOARD_ALIVE.set(board, true);
    }

    const { apply } = board;
    board.apply = (operation) => {
        apply(operation);
        refreshNodeWeakMapsAndSelection(board, mappedNodes, withNodeWeakMap);
    };

    const destroy = () => {
        if (withNodeWeakMap) {
            clearNodeWeakMapByNodes([...mappedNodes]);
        }
        if (withElementHost) {
            clearBoardElementHost(board);
        }
        if (withHost) {
            clearBoardHost(board);
        }
        if (withRoughSVG) {
            clearBoardRoughSVG(board);
        }
        if (alive) {
            IS_BOARD_ALIVE.delete(board);
        }
        KEY_TO_ELEMENT_MAP.delete(board);
        BOARD_TO_SELECTED_ELEMENT.delete(board);
    };

    return { board, destroy };
};

const refreshNodeWeakMapsAndSelection = (board: PlaitBoard, mappedNodes: Set<PlaitElement>, withNodeWeakMap: boolean) => {
    if (withNodeWeakMap) {
        fakeNodeWeakMap(board, mappedNodes);
    }

    const selectedElementIds = new Set(getSelectedElements(board).map((element) => element.id));
    if (selectedElementIds.size > 0) {
        const selectedElements = findElements(board, {
            match: (element) => selectedElementIds.has(element.id),
            recursion: () => true
        });
        cacheSelectedElements(board, selectedElements);
    }
};
