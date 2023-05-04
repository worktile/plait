import { PlaitBoard, RectangleClient, getRectangleByElements } from '@plait/core';
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';

export const getRectangleByResizingLocation = (
    abstractRectangle: RectangleClient,
    location: number,
    handlePosition: AbstractHandlePosition,
    isHorizontal: boolean
) => {
    if (isHorizontal) {
        if (handlePosition === AbstractHandlePosition.start) {
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
        if (handlePosition === AbstractHandlePosition.start) {
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
        const endNodeRectangle = getRectangleByElements(board, [endNode], false);

        if (isHorizontal) {
            return { max: endNodeRectangle.y, min: minNodeRectangle.y };
        } else {
            return { max: endNodeRectangle.x, min: minNodeRectangle.x };
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
        const startNodeRectangle = getRectangleByElements(board, [startNode], false);

        if (isHorizontal) {
            return {
                max: maxNodeRectangle.y + maxNodeRectangle.height,
                min: startNodeRectangle.y + startNodeRectangle.height
            };
        } else {
            return {
                max: maxNodeRectangle.x + maxNodeRectangle.width,
                min: startNodeRectangle.x + startNodeRectangle.width
            };
        }
    }
};
