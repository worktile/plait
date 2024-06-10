import {
    Path,
    PlaitBoard,
    PlaitNode,
    Point,
    RectangleClient,
    ResizeCursorClass,
    distanceBetweenPointAndRectangle,
    getSelectedElements
} from '@plait/core';
import { MindElement } from '../interfaces/element';
import { getRectangleByNode } from '../utils/position/node';
import { NodeSpace } from '../utils/space/node-space';
import { PlaitMindBoard } from './with-mind.board';
import { MindTransforms } from '../transforms';
import { EXTEND_OFFSET } from '../constants/default';
import { isDragging } from '../utils/dnd/common';
import { ResizeRef, ResizeState, TextManage, WithResizeOptions, getFirstTextManage, withResize } from '@plait/common';

interface TargetElementRef {
    minWidth: number;
    currentWidth: number;
    path: Path;
    textManage: TextManage;
}

export const withNodeResize = (board: PlaitBoard) => {
    let targetElementRef: TargetElementRef | null = null;
    const options: WithResizeOptions<MindElement, null> = {
        key: 'mind-node',
        canResize: () => {
            return !isDragging(board);
        },
        hitTest: (point: Point) => {
            const newTargetElement = getSelectedTarget(board as PlaitMindBoard, point);
            if (newTargetElement) {
                return {
                    element: newTargetElement,
                    handle: null,
                    cursorClass: ResizeCursorClass.ew
                };
            }
            return null;
        },
        beforeResize: (resizeRef: ResizeRef<MindElement, null>) => {
            targetElementRef = {
                minWidth: NodeSpace.getNodeResizableMinWidth(board as PlaitMindBoard, resizeRef.element),
                currentWidth: NodeSpace.getNodeDynamicWidth(board as PlaitMindBoard, resizeRef.element),
                path: PlaitBoard.findPath(board, resizeRef.element),
                textManage: getFirstTextManage(resizeRef.element)
            };
        },
        onResize: (resizeRef: ResizeRef<MindElement, null>, resizeState: ResizeState) => {
            const zoom = board.viewport.zoom;
            let resizedWidth = targetElementRef!.currentWidth + Point.getOffsetX(resizeState.startPoint, resizeState.endPoint);
            if (resizedWidth <= targetElementRef!.minWidth) {
                resizedWidth = targetElementRef!.minWidth;
            }
            const newTarget = PlaitNode.get<MindElement>(board, targetElementRef!.path);
            if (newTarget && NodeSpace.getNodeTopicMinWidth(board as PlaitMindBoard, newTarget) !== resizedWidth) {
                targetElementRef!.textManage.updateRectangleWidth(resizedWidth);
                const { height } = targetElementRef!.textManage.getSize();
                MindTransforms.setNodeManualWidth(board as PlaitMindBoard, newTarget, resizedWidth * zoom, height);
            }
        },
        afterResize: (resizeRef: ResizeRef<MindElement, null>) => {
            targetElementRef = null;
        }
    };
    withResize<MindElement, null>(board, options);
    return board;
};

export const getSelectedTarget = (board: PlaitMindBoard, point: Point) => {
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
