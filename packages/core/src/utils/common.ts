import { Path, PlaitElement } from '../interfaces';
import { PlaitBoard } from '../interfaces/board';
import { NodeTransforms } from '../transforms/node';
import { sortElements } from './position';

const BOARD_TO_RAF = new WeakMap<PlaitBoard, { [key: string]: number | null }>();

export interface MoveNodeOption {
    element: PlaitElement;
    newPath: Path;
}

const getTimerId = (board: PlaitBoard, key: string) => {
    const state = getRAFState(board);
    return state[key] || null;
};

const getRAFState = (board: PlaitBoard) => {
    return BOARD_TO_RAF.get(board) || {};
};

export const throttleRAF = (board: PlaitBoard, key: string, fn: () => void) => {
    const scheduleFunc = () => {
        let timerId = requestAnimationFrame(() => {
            const value = BOARD_TO_RAF.get(board) || {};
            value[key] = null;
            BOARD_TO_RAF.set(board, value);
            PlaitBoard.isAlive(board) && fn();
        });
        const state = getRAFState(board);
        state[key] = timerId;
        BOARD_TO_RAF.set(board, state);
    };
    let timerId = getTimerId(board, key);
    if (timerId !== null) {
        cancelAnimationFrame(timerId);
    }
    scheduleFunc();
};

export const debounce = <T>(func: (args?: T) => void, wait: number, options?: { leading: boolean }) => {
    let timeoutId: any = null;
    return (args?: T) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(args);
                timeoutId = null;
            }, wait);
        } else {
            if (options?.leading) {
                func(args);
            }
            timeoutId = setTimeout(() => {
                timeoutId = null;
                if (!options?.leading) {
                    func(args);
                }
            }, wait);
        }
    };
};

export const getElementsIndices = (board: PlaitBoard, elements: PlaitElement[]): number[] => {
    sortElements(board, elements);
    return elements
        .map(item => {
            return board.children.map(item => item.id).indexOf(item.id);
        })
        .filter(item => item >= 0);
};

export const getHighestIndexOfElement = (board: PlaitBoard, elements: PlaitElement[]) => {
    const indices = getElementsIndices(board, elements);
    return indices[indices.length - 1];
};

export const moveElementsToNewPath = (board: PlaitBoard, moveOptions: MoveNodeOption[]) => {
    moveOptions
        .map(item => {
            const path = PlaitBoard.findPath(board, item.element);
            const ref = board.pathRef(path);
            return () => {
                ref.current && NodeTransforms.moveNode(board, ref.current, item.newPath);
                ref.unref();
            };
        })
        .forEach(action => {
            action();
        });
};
