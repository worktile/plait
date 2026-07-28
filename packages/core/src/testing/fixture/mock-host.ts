import { RoughSVG } from 'roughjs/bin/svg';
import { PlaitBoard } from '../../interfaces/board';
import { createG, createSVG } from '../../utils/dom/common';
import { BOARD_TO_ELEMENT_HOST, BOARD_TO_HOST, BOARD_TO_ROUGH_SVG } from '../../utils/weak-maps';

export const fakeBoardElementHost = (board: PlaitBoard) => {
    const elementHost = {
        lowerHost: createG(),
        host: createG(),
        upperHost: createG(),
        topHost: createG(),
        activeHost: createG(),
        container: document.createElement('div'),
        viewportContainer: document.createElement('div')
    };
    BOARD_TO_ELEMENT_HOST.set(board, elementHost);
    return elementHost;
};

export const clearBoardElementHost = (board: PlaitBoard) => {
    BOARD_TO_ELEMENT_HOST.delete(board);
};

export const fakeBoardHost = (board: PlaitBoard) => {
    const host = createSVG();
    host.setAttribute('viewBox', '0 0 1000 1000');
    Object.defineProperty(host, 'getBoundingClientRect', {
        value: () =>
            ({
                x: 0,
                y: 0,
                width: 1000,
                height: 1000,
                top: 0,
                right: 1000,
                bottom: 1000,
                left: 0
            } as DOMRect)
    });
    BOARD_TO_HOST.set(board as PlaitBoard, host);
    return host;
};

export const clearBoardHost = (board: PlaitBoard) => {
    BOARD_TO_HOST.delete(board);
};

export const createTestingRoughSVG = () => {
    return new RoughSVG(createSVG());
};

export const fakeBoardRoughSVG = (board: PlaitBoard) => {
    const roughSVG = createTestingRoughSVG();
    BOARD_TO_ROUGH_SVG.set(board, roughSVG);
    return roughSVG;
};

export const clearBoardRoughSVG = (board: PlaitBoard) => {
    BOARD_TO_ROUGH_SVG.delete(board);
};
