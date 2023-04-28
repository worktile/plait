import {
    IS_TEXT_EDITABLE,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Transforms,
    getRectangleByElements,
    getSelectedElements,
    toPoint,
    transformPoint
} from '@plait/core';
import { MindmapNodeComponent } from '../node.component';
import { AbstractNode, MindmapLayoutType, isHorizontalLayout } from '@plait/layouts';
import { getRectangleByNode } from '../utils';
import { MindmapQueries } from '../queries';
import { MindmapNode } from '../interfaces/node';
import { abstractHandlePosition } from '../interfaces/abstract';
import { MindElement } from '../interfaces';

export const withAbstract: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, globalMousemove, globalMouseup } = board;

    let abstractComponent: MindmapNodeComponent;
    let abstractElement: MindElement;
    let abstractParentNode: MindmapNode;
    let handleSide: abstractHandlePosition;
    let movePosition: number;
    let isClickHandle: boolean = false;
    let isHorizontal: boolean = false;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }
        const selectElements = getSelectedElements(board);
        event.stopPropagation();
        event.preventDefault();

        const outerG = (event.target as HTMLElement).closest('.abstract-includeG');
        abstractComponent = selectElements
            .map(element => {
                return PlaitElement.getComponent(element) as MindmapNodeComponent;
            })
            .filter(element => {
                return element.abstractIncludeG === outerG;
            })[0];

        if (abstractComponent) {
            isClickHandle = true;
            abstractElement = abstractComponent.element;
            abstractParentNode = abstractComponent.parent;
            const startHandle = (event.target as HTMLElement).closest('.abstract-start-handle-mask');
            const endHandle = (event.target as HTMLElement).closest('.abstract-end-handle-mask');
            const nodeLayout = MindmapQueries.getCorrectLayoutByElement(abstractElement) as MindmapLayoutType;
            isHorizontal = !isHorizontalLayout(nodeLayout);
            if (startHandle) {
                handleSide = abstractHandlePosition.start;
            }
            if (endHandle) {
                handleSide = abstractHandlePosition.end;
            }
        }
        mousedown(event);
    };

    board.globalMousemove = (event: MouseEvent) => {
        if (isClickHandle) {
            const includeElements = abstractParentNode.children.slice(abstractElement.start, abstractElement.end! + 1);
            const includeOrigin = includeElements.map(element => {
                return element.origin;
            });
            let { x, y, width, height } = getRectangleByElements(board, includeOrigin, true);
            x -= 3.5;
            y -= 3.5;
            width += 7;
            height += 7;

            if (handleSide === abstractHandlePosition.start) {
                const abstractNode = abstractParentNode.children
                    .filter(child => AbstractNode.isAbstract(child.origin))
                    .find(abstract => {
                        return abstract.origin.end! < abstractElement.start!;
                    });
                const maxNode = abstractNode ? abstractParentNode.children[abstractNode.origin.end! + 1] : abstractParentNode.children[0];

                const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
                const maxBorder = getRectangleByNode(maxNode)[isHorizontal ? 'x' : 'y'] - 3.5;
                const minBorder = getRectangleByNode(abstractParentNode.children[abstractElement.end!])[isHorizontal ? 'x' : 'y'] - 3.5;

                movePosition = Math.max(maxBorder, Math.min(minBorder, isHorizontal ? movedTarget[0] : movedTarget[1]));

                if (isHorizontal) {
                    abstractComponent.updateAbstractActiveG(movePosition, y, x - movePosition + width, height);
                } else {
                    abstractComponent.updateAbstractActiveG(x, movePosition, width, y - movePosition + height);
                }
            }
            if (handleSide === abstractHandlePosition.end) {
                const childrenLength = abstractParentNode.children.filter(child => {
                    return !AbstractNode.isAbstract(child.origin);
                }).length;
                const abstractNode = abstractParentNode.children
                    .filter(child => AbstractNode.isAbstract(child.origin))
                    .find(abstract => abstract.origin.start! > abstractElement.end!);
                const maxNode = abstractNode
                    ? abstractParentNode.children[abstractNode.origin.start! - 1]
                    : abstractParentNode.children[childrenLength - 1];
                const minEndRec = getRectangleByNode(abstractParentNode.children[abstractElement.start!]);
                const maxEndRec = getRectangleByElements(board, [maxNode.origin], true);
                const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));

                const minBorder = minEndRec[isHorizontal ? 'x' : 'y'] + minEndRec[isHorizontal ? 'width' : 'height'] + 3.5;
                const maxBorder = maxEndRec[isHorizontal ? 'x' : 'y'] + maxEndRec[isHorizontal ? 'width' : 'height'] + 3.5;

                movePosition = Math.max(minBorder, Math.min(maxBorder, isHorizontal ? movedTarget[0] : movedTarget[1]));

                if (isHorizontal) {
                    abstractComponent.updateAbstractActiveG(x, y, movePosition - x, height);
                } else {
                    abstractComponent.updateAbstractActiveG(x, y, width, movePosition - y);
                }
            }
        }
        globalMousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (abstractComponent) {
            const recArray = abstractParentNode.children
                .filter(child => {
                    return !AbstractNode.isAbstract(child.origin);
                })
                .map(child => {
                    return getRectangleByNode(child);
                });
            let element: { end: number } | { start: number } = { start: abstractElement.start! };

            if (handleSide === abstractHandlePosition.start) {
                let index: number;
                index = recArray.findIndex((rec, index) => {
                    const recXOrY = isHorizontal ? rec.x : rec.y;
                    const recWidthOrHeight = isHorizontal ? rec.width : rec.height;
                    if (index === 0) {
                        return movePosition >= recXOrY - 3.5 && movePosition <= recXOrY + recWidthOrHeight / 2;
                    } else {
                        return (
                            movePosition <= recXOrY + recWidthOrHeight / 2 &&
                            movePosition >=
                                recArray[index - 1][isHorizontal ? 'x' : 'y'] + recArray[index - 1][isHorizontal ? 'width' : 'height'] / 2
                        );
                    }
                });
                element = { start: index! };
            }
            if (handleSide === abstractHandlePosition.end) {
                let index: number;

                index = recArray.findIndex((rec, index) => {
                    const recXOrY = isHorizontal ? rec.x : rec.y;
                    const recWidthOrHeight = isHorizontal ? rec.width : rec.height;
                    if (index === recArray.length - 1) {
                        return movePosition <= recXOrY + recWidthOrHeight + 3.5 && movePosition >= recXOrY + recWidthOrHeight / 2;
                    } else {
                        return (
                            movePosition >= recXOrY + recWidthOrHeight / 2 &&
                            movePosition <=
                                recArray[index + 1][isHorizontal ? 'x' : 'y'] + recArray[index + 1][isHorizontal ? 'width' : 'height'] / 2
                        );
                    }
                });
                element = { end: index };
            }

            const path = PlaitBoard.findPath(board, abstractElement);
            Transforms.setNode(board, element, path);
        }
        isClickHandle = false;
        globalMouseup(event);
    };
    return board;
};
