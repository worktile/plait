import {
    MERGING,
    PRESS_AND_MOVE_BUFFER,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitNode,
    Point,
    RectangleClient,
    ResizeCursorClass,
    distanceBetweenPointAndPoint,
    distanceBetweenPointAndRectangle,
    getSelectedElements,
    throttleRAF,
    toPoint,
    transformPoint
} from '@plait/core';
import { MindElement } from '../interfaces/element';
import { getRectangleByNode } from '../utils/position/node';
import { NodeSpace } from '../utils/space/node-space';
import { PlaitMindBoard } from './with-mind.board';
import { MindNodeComponent } from '../node.component';
import { MindTransforms } from '../transforms';
import { TextManage } from '@plait/text';
import { isDragging } from '../utils/dnd/common';
import { EXTEND_OFFSET } from '../constants/default';

interface TargetElementRef {
    minWidth: number;
    currentWidth: number;
    path: Path;
    textManage: TextManage;
}

export const withNodeResize = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup } = board;
    let targetElement: MindElement | null = null;
    let targetElementRef: TargetElementRef | null = null;
    let startPoint: Point | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (targetElement) {
            startPoint = [event.x, event.y];
            return;
        }

        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board) || PlaitBoard.hasBeenTextEditing(board)) {
            mousemove(event);
            return;
        }

        if (startPoint && targetElement && !isMindNodeResizing(board)) {
            // prevent text from being selected
            event.preventDefault();
            const endPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance > PRESS_AND_MOVE_BUFFER) {
                addResizing(board, targetElement);
                targetElementRef = {
                    minWidth: NodeSpace.getNodeResizableMinWidth(board as PlaitMindBoard, targetElement),
                    currentWidth: NodeSpace.getNodeDynamicWidth(board as PlaitMindBoard, targetElement),
                    path: PlaitBoard.findPath(board, targetElement),
                    textManage: (PlaitElement.getComponent(targetElement) as MindNodeComponent).textManage
                };
                MERGING.set(board, true);
            }
        }

        if (isMindNodeResizing(board) && startPoint && targetElementRef) {
            // prevent text from being selected
            event.preventDefault();
            throttleRAF(() => {
                if (!startPoint) {
                    return;
                }

                const endPoint = [event.x, event.y];
                const offsetX = endPoint[0] - startPoint![0];
                const zoom = board.viewport.zoom;
                let resizedWidth = targetElementRef!.currentWidth + offsetX / zoom;
                if (resizedWidth <= targetElementRef!.minWidth) {
                    resizedWidth = targetElementRef!.minWidth;
                }

                const newTarget = PlaitNode.get<MindElement>(board, targetElementRef!.path);
                if (newTarget && NodeSpace.getNodeTopicMinWidth(board as PlaitMindBoard, newTarget) !== resizedWidth) {
                    targetElementRef!.textManage.updateWidth(resizedWidth);
                    const { height } = targetElementRef!.textManage.getSize();
                    MindTransforms.setNodeManualWidth(board as PlaitMindBoard, newTarget, resizedWidth * zoom, height);
                }
            });
            return;
        } else {
            // press and start drag when node is non selected
            if (!isDragging(board)) {
                const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
                const newTargetElement = getTargetElement(board as PlaitMindBoard, point);
                if (newTargetElement) {
                    PlaitBoard.getBoardContainer(board).classList.add(ResizeCursorClass['ew-resize']);
                } else {
                    PlaitBoard.getBoardContainer(board).classList.remove(ResizeCursorClass['ew-resize']);
                }
                targetElement = newTargetElement;
            }
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        globalMouseup(event);

        if (isMindNodeResizing(board) || targetElement) {
            targetElement && removeResizing(board, targetElement);
            targetElementRef = null;
            targetElement = null;
            startPoint = null;
            MERGING.set(board, false);
        }
    };

    return board;
};

export const IS_MIND_NODE_RESIZING = new WeakMap<PlaitBoard, boolean>();

export const isMindNodeResizing = (board: PlaitBoard) => {
    return !!IS_MIND_NODE_RESIZING.get(board);
};

export const addResizing = (board: PlaitBoard, element: MindElement) => {
    PlaitBoard.getBoardContainer(board).classList.add('mind-node-resizing');
    const component = PlaitElement.getComponent(element);
    component.g.classList.add('resizing');
    IS_MIND_NODE_RESIZING.set(board, true);
};

export const removeResizing = (board: PlaitBoard, element: MindElement) => {
    PlaitBoard.getBoardContainer(board).classList.remove('mind-node-resizing');
    PlaitBoard.getBoardContainer(board).classList.remove(ResizeCursorClass['ew-resize']);
    const component = PlaitElement.getComponent(element);
    if (component && component.g) {
        component.g.classList.remove('resizing');
    }
    IS_MIND_NODE_RESIZING.set(board, false);
};

export const getTargetElement = (board: PlaitMindBoard, point: Point) => {
    const selectedElements = getSelectedElements(board).filter(value => MindElement.isMindElement(board, value)) as MindElement[];
    if (selectedElements.length > 0) {
        const target = selectedElements.find(value => {
            const rectangle = getResizeActiveRectangle(board, value);
            return distanceBetweenPointAndRectangle(point[0], point[1], rectangle) <= 0;
        });
        return target ? target : null;
    }

    return null;
};

export const getResizeActiveRectangle = (board: PlaitBoard, element: MindElement): RectangleClient => {
    const node = MindElement.getNode(element);
    const rectangle = getRectangleByNode(node);
    return { x: rectangle.x + rectangle.width - EXTEND_OFFSET, y: rectangle.y, width: EXTEND_OFFSET * 2, height: rectangle.height };
};
