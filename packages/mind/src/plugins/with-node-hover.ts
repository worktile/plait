import { PlaitBoard, PlaitElement, depthFirstRecursion, throttleRAF, toPoint, transformPoint } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { isHitMindElement } from '../utils/position/node';

export const withNodeHover = (board: PlaitBoard) => {
    const { mousemove, mouseleave } = board;
    let hoveredMindElement: MindElement | null = null;

    board.mousemove = (event: MouseEvent) => {
        throttleRAF(() => {
            let target: MindElement | null = null;
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            depthFirstRecursion(
                (board as unknown) as MindElement,
                element => {
                    if (target) {
                        return;
                    }
                    if (!MindElement.isMindElement(board, element)) {
                        return;
                    }
                    const isHitElement = isHitMindElement(board, point, element);
                    if (isHitElement) {
                        target = element;
                    }
                },
                node => {
                    if (PlaitBoard.isBoard(node) || board.isRecursion(node)) {
                        return true;
                    } else {
                        return false;
                    }
                }
            );
            
            if (hoveredMindElement && target && hoveredMindElement === target) {
                return;
            }

            if (hoveredMindElement) {
                removeHovered(hoveredMindElement);
            }

            if (target) {
                addHovered(target);
                hoveredMindElement = target;
            } else {
                hoveredMindElement = null;
            }
        });

        mousemove(event);
    };

    board.mouseleave = (event: MouseEvent) => {
        if (hoveredMindElement) {
            removeHovered(hoveredMindElement);
            hoveredMindElement = null;
        }
        mouseleave(event);
    }

    return board;
};

export const addHovered = (element: MindElement) => {
    const component = PlaitElement.getComponent(element);
    component.g.classList.add('hovered');
}

export const removeHovered = (element: MindElement) => {
    const component = PlaitElement.getComponent(element);
    component.g.classList.remove('hovered');
}