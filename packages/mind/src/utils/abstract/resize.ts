import { PlaitBoard, PlaitElement, Point, RectangleClient, getRectangleByElements, getSelectedElements } from '@plait/core';
import { AbstractHandlePosition, MindElement } from '../../interfaces';
import { AbstractNode, LayoutNode, MindLayoutType, isHorizontalLayout } from '@plait/layouts';
import { ABSTRACT_HANDLE_MASK_WIDTH, ABSTRACT_INCLUDED_OUTLINE_OFFSET } from '../../constants';
import { MindQueries } from '../../queries';
import { getCorrectStartEnd } from '@plait/layouts';
import { MindNodeComponent } from '../../node.component';

export const getRectangleByResizingLocation = (
    abstractRectangle: RectangleClient,
    location: number,
    activeHandlePosition: AbstractHandlePosition,
    isHorizontal: boolean
) => {
    if (isHorizontal) {
        if (activeHandlePosition === AbstractHandlePosition.start) {
            return {
                ...abstractRectangle,
                y: location,
                height: abstractRectangle.height + abstractRectangle.y - location
            };
        } else {
            return {
                ...abstractRectangle,
                height: location - abstractRectangle.y
            };
        }
    } else {
        if (activeHandlePosition === AbstractHandlePosition.start) {
            return {
                ...abstractRectangle,
                x: location,
                width: abstractRectangle.width + abstractRectangle.x - location
            };
        } else {
            return {
                ...abstractRectangle,
                width: location - abstractRectangle.x
            };
        }
    }
};

export const getLocationScope = (
    board: PlaitBoard,
    handlePosition: AbstractHandlePosition,
    parentChildren: MindElement[],
    element: MindElement,
    parent: LayoutNode,
    isHorizontal: boolean
) => {
    const node = (MindElement.getNode(element) as unknown) as LayoutNode;
    const { start, end } = getCorrectStartEnd(node.origin as AbstractNode, parent);

    const startNode = parentChildren[start];
    const endNode = parentChildren[end];

    if (handlePosition === AbstractHandlePosition.start) {
        const abstractNode = parentChildren.filter(child => AbstractNode.isAbstract(child) && child.end < element.start!);
        let minNode;

        if (abstractNode.length) {
            const index = abstractNode
                .map(node => {
                    const { end } = getCorrectStartEnd(node as AbstractNode, parent);
                    return end;
                })
                .sort((a, b) => b - a)[0];
            minNode = parentChildren[index + 1];
        } else {
            minNode = parentChildren[0];
        }

        const minNodeRectangle = getRectangleByElements(board, [minNode], true);
        const endNodeRectangle = getRectangleByElements(board, [endNode], false);

        if (isHorizontal) {
            return {
                max: endNodeRectangle.y - ABSTRACT_INCLUDED_OUTLINE_OFFSET,
                min: minNodeRectangle.y - ABSTRACT_INCLUDED_OUTLINE_OFFSET
            };
        } else {
            return {
                max: endNodeRectangle.x - ABSTRACT_INCLUDED_OUTLINE_OFFSET,
                min: minNodeRectangle.x - ABSTRACT_INCLUDED_OUTLINE_OFFSET
            };
        }
    } else {
        const abstractNode = parentChildren.filter(child => AbstractNode.isAbstract(child) && child.start > element.end!);
        let maxNode;

        if (abstractNode.length) {
            const index = abstractNode
                .map(node => {
                    const { start } = getCorrectStartEnd(node as AbstractNode, parent);
                    return start;
                })
                .sort((a, b) => a - b)[0];
            maxNode = parentChildren[index - 1];
        } else {
            const children = parentChildren.filter(child => !AbstractNode.isAbstract(child));
            maxNode = parentChildren[children.length - 1];
        }

        const maxNodeRectangle = getRectangleByElements(board, [maxNode], true);
        const startNodeRectangle = getRectangleByElements(board, [startNode], false);

        if (isHorizontal) {
            return {
                max: maxNodeRectangle.y + maxNodeRectangle.height + ABSTRACT_INCLUDED_OUTLINE_OFFSET,
                min: startNodeRectangle.y + startNodeRectangle.height + ABSTRACT_INCLUDED_OUTLINE_OFFSET
            };
        } else {
            return {
                max: maxNodeRectangle.x + maxNodeRectangle.width + ABSTRACT_INCLUDED_OUTLINE_OFFSET,
                min: startNodeRectangle.x + startNodeRectangle.width + ABSTRACT_INCLUDED_OUTLINE_OFFSET
            };
        }
    }
};

export const getHitAbstractHandle = (board: PlaitBoard, element: MindElement, point: Point) => {
    const nodeLayout = MindQueries.getCorrectLayoutByElement(element) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(nodeLayout);

    const parentElement = MindElement.getParent(element);
    const includedElements = parentElement.children.slice(element.start!, element.end! + 1);
    let abstractRectangle = getRectangleByElements(board, includedElements, true);
    abstractRectangle = RectangleClient.getOutlineRectangle(abstractRectangle, -ABSTRACT_INCLUDED_OUTLINE_OFFSET);

    const startHandleRec = getAbstractHandleRectangle(abstractRectangle, isHorizontal, AbstractHandlePosition.start);
    const endHandleRec = getAbstractHandleRectangle(abstractRectangle, isHorizontal, AbstractHandlePosition.end);

    const pointRec = RectangleClient.toRectangleClient([point, point]);
    if (RectangleClient.isHit(pointRec, startHandleRec)) return AbstractHandlePosition.start;
    if (RectangleClient.isHit(pointRec, endHandleRec)) return AbstractHandlePosition.end;
    return null;
};

export const getAbstractHandleRectangle = (rectangle: RectangleClient, isHorizontal: boolean, position: AbstractHandlePosition) => {
    let result;
    if (position === AbstractHandlePosition.start) {
        const location = isHorizontal ? rectangle.y : rectangle.x;

        result = getRectangleByResizingLocation(
            rectangle,
            location + ABSTRACT_HANDLE_MASK_WIDTH / 2,
            AbstractHandlePosition.end,
            isHorizontal
        );
        result = getRectangleByResizingLocation(result, location - ABSTRACT_HANDLE_MASK_WIDTH / 2, position, isHorizontal);
    } else {
        const location = isHorizontal ? rectangle.y + rectangle.height : rectangle.x + rectangle.width;

        result = getRectangleByResizingLocation(
            rectangle,
            location - ABSTRACT_HANDLE_MASK_WIDTH / 2,
            AbstractHandlePosition.start,
            isHorizontal
        );
        result = getRectangleByResizingLocation(result, location + ABSTRACT_HANDLE_MASK_WIDTH / 2, position, isHorizontal);
    }
    return result;
};

export function findLocationLeftIndex(board: PlaitBoard, parentChildren: MindElement[], location: number, isHorizontal: boolean) {
    const children = parentChildren.filter(child => {
        return !AbstractNode.isAbstract(child);
    });
    const recArray = children.map(child => {
        return getRectangleByElements(board, [child], false);
    });

    const firstRec = getRectangleByElements(board, [children[0]], true);
    const fakeLeftRec = {
        x: firstRec.x - firstRec.width,
        y: firstRec.y - firstRec.height,
        width: firstRec.width,
        height: firstRec.height
    };
    const lastRec = getRectangleByElements(board, [children[children.length - 1]], true);
    const fakeRightRec = {
        x: lastRec.x + lastRec.width,
        y: lastRec.y + lastRec.height,
        width: lastRec.width,
        height: lastRec.height
    };

    recArray.push(fakeRightRec);
    recArray.unshift(fakeLeftRec);

    for (let i = 0; i < recArray.length - 1; i++) {
        const recXOrY = isHorizontal ? recArray[i].y : recArray[i].x;
        const recWidthOrHeight = isHorizontal ? recArray[i].height : recArray[i].width;

        if (
            location >= recXOrY + recWidthOrHeight / 2 &&
            location <= recArray[i + 1][isHorizontal ? 'y' : 'x'] + recArray[i + 1][isHorizontal ? 'height' : 'width'] / 2
        ) {
            return i - 1;
        }
    }
    return 0;
}

export function changeTouchedAbstract(board: PlaitBoard, touchedAbstract: PlaitElement | undefined, endPoint: Point) {
    let touchedHandle;
    const abstract = getSelectedElements(board)
        .filter(element => AbstractNode.isAbstract(element))
        .find(element => {
            touchedHandle = getHitAbstractHandle(board, element as MindElement, endPoint);
            return touchedHandle;
        });

    if (touchedAbstract === abstract) {
        return touchedAbstract;
    }

    if (touchedAbstract) {
        const component = PlaitElement.getComponent(touchedAbstract!) as MindNodeComponent;
        component.updateAbstractIncludedOutline();
        touchedAbstract = undefined;
    }

    if (abstract) {
        touchedAbstract = abstract;
        const component = PlaitElement.getComponent(touchedAbstract!) as MindNodeComponent;
        component.updateAbstractIncludedOutline(touchedHandle);
    }

    return touchedAbstract;
}
