import {
    MERGING,
    PlaitBoard,
    PlaitElement,
    PlaitGroupElement,
    Point,
    RectangleClient,
    Transforms,
    getElementsInGroup,
    getHighestSelectedElements,
    getRectangleByElements
} from '@plait/core';

export const alignTop = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [0, outerRectangle.y - rectangle.y] as Point;
    }
    setOffset(board, getOffset);
};

export const alignBottom = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [0, outerRectangle.y + outerRectangle.height - (rectangle.y + rectangle.height)] as Point;
    }
    setOffset(board, getOffset);
};

export const alignLeft = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [outerRectangle.x - rectangle.x, 0] as Point;
    }
    setOffset(board, getOffset);
};

export const alignHorizontalCenter = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        const outerCenter = outerRectangle.x + outerRectangle.width / 2;
        const elementCenter = rectangle.x + rectangle.width / 2;
        return [outerCenter - elementCenter, 0] as Point;
    }
    setOffset(board, getOffset);
};

export const alignVerticalCenter = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        const outerCenter = outerRectangle.y + outerRectangle.height / 2;
        const elementCenter = rectangle.y + rectangle.height / 2;
        return [0, outerCenter - elementCenter] as Point;
    }
    setOffset(board, getOffset);
};

export const alignRight = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [outerRectangle.x + outerRectangle.width - (rectangle.x + rectangle.width), 0] as Point;
    }
    setOffset(board, getOffset);
};

function setOffset(board: PlaitBoard, getOffset: (outerRectangle: RectangleClient, rectangle: RectangleClient) => Point) {
    const elements = getHighestSelectedElements(board);
    const outerRectangle = getRectangleByElements(board, elements, false);
    elements.forEach(element => {
        if (!element.points && !PlaitGroupElement.isGroup(element)) return;
        const rectangle = board.getRectangle(element)!;
        const offset = getOffset(outerRectangle, rectangle);
        let updateElements: PlaitElement[] = [];
        if (PlaitGroupElement.isGroup(element)) {
            updateElements = getElementsInGroup(board, element, true, false);
        } else if (element.points) {
            updateElements = [element];
        }
        updateElements.forEach(item => {
            const newPoints = item.points!.map(p => [p[0] + offset[0], p[1] + offset[1]]) as Point[];
            const path = PlaitBoard.findPath(board, item);
            Transforms.setNode(
                board,
                {
                    points: newPoints
                },
                path
            );
        });
        MERGING.set(board, true);
    });
    MERGING.set(board, false);
}

export const distributeHorizontal = (board: PlaitBoard) => {
    distribute(board, true);
};

export const distributeVertical = (board: PlaitBoard) => {
    distribute(board, false);
};

const distribute = (board: PlaitBoard, isHorizontal: boolean) => {
    const axis = isHorizontal ? 'x' : 'y';
    const side = isHorizontal ? 'width' : 'height';
    const highestSelectedElements = getHighestSelectedElements(board);
    const refs = highestSelectedElements.map(element => {
        return { element, rectangle: board.getRectangle(element)! };
    });
    const outerRectangle = getRectangleByElements(board, highestSelectedElements, false);
    const minRectangleRef = refs.sort((a, b) => a.rectangle[axis] - b.rectangle[axis])[0];
    const maxRectangleRef = refs.sort((a, b) => b.rectangle[axis] + b.rectangle[side] - (a.rectangle[axis] + a.rectangle[side]))[0];
    const minIndex = refs.findIndex(ref => ref === minRectangleRef);
    const maxIndex = refs.findIndex(ref => ref === maxRectangleRef);
    let distributeRefs = refs.filter((element, index) => index !== minIndex && index !== maxIndex);
    const sum = distributeRefs.reduce((accumulator, current) => current.rectangle[side] + accumulator, 0);
    const offset =
        (outerRectangle[side] - minRectangleRef.rectangle[side] - maxRectangleRef.rectangle[side] - sum) / (distributeRefs.length + 1);
    distributeRefs = distributeRefs.sort((a, b) => a.rectangle[axis] - b.rectangle[axis]);
    let position = minRectangleRef.rectangle[axis] + minRectangleRef.rectangle[side] + offset;
    for (let i = 0; i < distributeRefs.length; i++) {
        const rectangle = distributeRefs[i].rectangle;
        const moveOffset = [0, 0];
        const moveAxis = isHorizontal ? 0 : 1;
        moveOffset[moveAxis] = position - rectangle[axis];
        const path = PlaitBoard.findPath(board, distributeRefs[i].element);
        const newPoints = distributeRefs[i].element.points!.map(p => [p[0] + moveOffset[0], p[1] + moveOffset[1]]) as Point[];
        Transforms.setNode(
            board,
            {
                points: newPoints
            },
            path
        );
        MERGING.set(board, true);
        position = position + rectangle[side] + offset;
    }
    MERGING.set(board, false);
};

export interface AlignTransform {
    alignTop: (board: PlaitBoard) => void;
    alignHorizontalCenter: (board: PlaitBoard) => void;
    alignBottom: (board: PlaitBoard) => void;
    alignLeft: (board: PlaitBoard) => void;
    alignVerticalCenter: (board: PlaitBoard) => void;
    alignRight: (board: PlaitBoard) => void;
    distributeHorizontal: (board: PlaitBoard) => void;
    distributeVertical: (board: PlaitBoard) => void;
}

export const AlignTransform: AlignTransform = {
    alignTop,
    alignHorizontalCenter,
    alignBottom,
    alignLeft,
    alignVerticalCenter,
    alignRight,
    distributeHorizontal,
    distributeVertical
};
