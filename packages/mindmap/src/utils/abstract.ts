import { PlaitBoard, RectangleClient, getRectangleByElements } from '@plait/core';
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { ABSTRACT_INCLUDED_OUTLINE_OFFSET } from '../constants';

export const getRectangleByOffset = (
    abstractRectangle: RectangleClient,
    offset: number,
    handlePosition: AbstractHandlePosition,
    isHorizontal: boolean
) => {
    const rectangle = RectangleClient.getOutlineRectangle(abstractRectangle, -ABSTRACT_INCLUDED_OUTLINE_OFFSET);
    return isHorizontal
        ? handlePosition === AbstractHandlePosition.start
            ? {
                  ...rectangle,
                  y: offset + rectangle.y,
                  height: rectangle.height - offset
              }
            : {
                  ...rectangle,
                  height: rectangle.height + offset
              }
        : handlePosition === AbstractHandlePosition.start
        ? {
              ...rectangle,
              x: offset + rectangle.x,
              width: rectangle.width - offset
          }
        : {
              ...rectangle,
              width: rectangle.width + offset
          };
};

export const abstractOffsetHandle = (
    board: PlaitBoard,
    handlePosition: AbstractHandlePosition,
    parent: MindElement,
    element: MindElement,
    isHorizontal: boolean,
    offset: number
) => {
    const scope = getLimitedScope(board, handlePosition, parent, element, isHorizontal);
    return Math.min(scope.max, Math.max(scope.min, offset));
};

export const getLimitedScope = (
    board: PlaitBoard,
    handlePosition: AbstractHandlePosition,
    parent: MindElement,
    element: MindElement,
    isHorizontal: boolean
) => {
    const startNode = parent.children[element.start!];
    const endNode = parent.children[element.end!];

    if (handlePosition === AbstractHandlePosition.start) {
        const abstractNode = parent.children.filter(child => AbstractNode.isAbstract(child) && child.end < element.start!);
        let minNode;

        if (abstractNode.length) {
            const index = abstractNode.map(node => node.end!).sort((a, b) => b - a)[0];
            minNode = parent.children[index + 1];
        } else {
            minNode = parent.children[0];
        }

        const minNodeRectangle = getRectangleByElements(board, [minNode], true);
        const startNodeRectangle = getRectangleByElements(board, [startNode], true);
        const endNodeRectangle = getRectangleByElements(board, [endNode], false);

        if (isHorizontal) {
            return { max: endNodeRectangle.y - startNodeRectangle.y, min: minNodeRectangle.y - startNodeRectangle.y };
        } else {
            return { max: endNodeRectangle.x - startNodeRectangle.x, min: minNodeRectangle.x - startNodeRectangle.x };
        }
    } else {
        const abstractNode = parent.children.filter(child => AbstractNode.isAbstract(child) && child.start > element.end!);
        let maxNode;

        if (abstractNode.length) {
            const index = abstractNode.map(node => node.end!).sort((a, b) => a - b)[0];
            maxNode = parent.children[index - 1];
        } else {
            const children = parent.children.filter(child => !AbstractNode.isAbstract(child));
            maxNode = parent.children[children.length - 1];
        }

        const maxNodeRectangle = getRectangleByElements(board, [maxNode], true);
        const endNodeRectangle = getRectangleByElements(board, [endNode], true);
        const startNodeRectangle = getRectangleByElements(board, [startNode], false);

        if (isHorizontal) {
            return {
                max: maxNodeRectangle.y + maxNodeRectangle.height - (endNodeRectangle.y + endNodeRectangle.height),
                min: startNodeRectangle.y + startNodeRectangle.height - (endNodeRectangle.y + endNodeRectangle.height)
            };
        } else {
            return {
                max: maxNodeRectangle.x + maxNodeRectangle.width - (endNodeRectangle.x + endNodeRectangle.width),
                min: startNodeRectangle.x + startNodeRectangle.width - (endNodeRectangle.x + endNodeRectangle.width)
            };
        }
    }
};
