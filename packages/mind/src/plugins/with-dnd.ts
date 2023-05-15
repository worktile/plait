import {
    createG,
    distanceBetweenPointAndPoint,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    ELEMENT_TO_COMPONENT,
    getSelectedElements
} from '@plait/core';
import { AbstractNode, isStandardLayout } from '@plait/layouts';
import { updateForeignObject } from '@plait/richtext';
import { BASE } from '../constants';
import { getRichtextRectangleByNode } from '../draw/richtext';
import { drawRectangleNode } from '../draw/shape';
import { MindElement, PlaitMind } from '../interfaces/element';
import { DetectResult, MindNode } from '../interfaces/node';
import { MindNodeComponent } from '../node.component';
import { directionCorrector, directionDetector, drawPlaceholderDropNodeG, findUpElement, readjustmentDropTarget } from '../utils';
import { getRectangleByNode, hitMindElement } from '../utils/graph';
import { MindQueries } from '../queries';
import { PlaitMindComponent } from '../mind.component';
import { PlaitMindBoard } from './with-extend-mind';
import {
    addActiveOnDragOrigin,
    isDragging,
    isValidTarget,
    removeActiveOnDragOrigin,
    setIsDragging,
    updateAbstractInDnd,
    updatePathByLayoutAndDropTarget,
    updateRightNodeCount
} from '../utils/drag';

const DRAG_MOVE_BUFFER = 5;

export const withDnd = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElement: MindElement | null;
    let startPoint: Point;
    let fakeDragNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindElement; detectResult: DetectResult } | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }

        // 确认是否 hit 节点
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectedElements = getSelectedElements(board);
        board.children.forEach((value: PlaitElement) => {
            if (activeElement) {
                return;
            }
            if (PlaitMind.isMind(value)) {
                const mindmapComponent = ELEMENT_TO_COMPONENT.get(value) as PlaitMindComponent;
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindNode) => {
                    if (activeElement) {
                        return;
                    }

                    const canDrag =
                        hitMindElement(board, point, node.origin) &&
                        !node.origin.isRoot &&
                        !AbstractNode.isAbstract(node.origin) &&
                        selectedElements.length <= 1;

                    if (canDrag) {
                        activeElement = node.origin;
                        startPoint = point;
                    }
                });
            }
        });

        if (activeElement) {
            event.preventDefault();
        }

        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement && startPoint) {
            const endPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance < DRAG_MOVE_BUFFER) {
                return;
            }

            if (!isDragging(board)) {
                setIsDragging(board, true);
                fakeDragNodeG = createG();
                fakeDragNodeG.classList.add('dragging', 'fake-node', 'plait-board-attached');
                fakeDropNodeG = createG();
                addActiveOnDragOrigin(activeElement);
                PlaitBoard.getHost(board).appendChild(fakeDropNodeG);
                PlaitBoard.getHost(board).appendChild(fakeDragNodeG);
            } else {
                if (fakeDragNodeG) {
                    fakeDragNodeG.innerHTML = '';
                }

                fakeDropNodeG?.childNodes.forEach(node => {
                    node.remove();
                });
            }

            // fake dragging origin node
            const offsetX = endPoint[0] - startPoint[0];
            const offsetY = endPoint[1] - startPoint[1];
            const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const fakeDraggingNode: MindNode = {
                ...activeComponent.node,
                children: [],
                x: activeComponent.node.x + offsetX,
                y: activeComponent.node.y + offsetY
            };
            const textRectangle = getRichtextRectangleByNode(board as PlaitMindBoard, activeComponent.node);
            const fakeNodeG = drawRectangleNode(board, fakeDraggingNode);
            const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
            updateForeignObject(
                richtextG,
                textRectangle.width + BASE * 10,
                textRectangle.height,
                textRectangle.x + offsetX,
                textRectangle.y + offsetY
            );
            fakeDragNodeG?.append(fakeNodeG);
            fakeDragNodeG?.append(richtextG);

            // drop position detect
            const { x, y } = getRectangleByNode(fakeDraggingNode);
            const detectCenterPoint = [x + textRectangle.width / 2, y + textRectangle.height / 2] as Point;

            let detectResult: DetectResult[] | null = null;
            board.children.forEach((value: PlaitElement) => {
                if (detectResult) {
                    return;
                }
                if (PlaitMind.isMind(value)) {
                    const mindmapComponent = ELEMENT_TO_COMPONENT.get(value) as PlaitMindComponent;
                    const root = mindmapComponent?.root;

                    (root as any).eachNode((node: MindNode) => {
                        if (detectResult) {
                            return;
                        }
                        const directions = directionDetector(node, detectCenterPoint);
                        if (directions) {
                            detectResult = directionCorrector(node, directions);
                        }
                        dropTarget = null;
                        if (detectResult && isValidTarget(activeComponent.node.origin, node.origin)) {
                            dropTarget = { target: node.origin, detectResult: detectResult[0] };
                        }
                    });
                }
            });

            if (dropTarget?.target) {
                dropTarget = readjustmentDropTarget(dropTarget);
                drawPlaceholderDropNodeG(board, dropTarget, fakeDropNodeG);
            }
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement) {
            if (dropTarget?.target) {
                const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
                const targetComponent = PlaitElement.getComponent(dropTarget.target) as MindNodeComponent;
                let targetPath = PlaitBoard.findPath(board, targetComponent.element);
                const mindmapElement = findUpElement(dropTarget.target).root;
                const mindmapComponent = ELEMENT_TO_COMPONENT.get(mindmapElement as PlaitMind) as PlaitMindComponent;
                const layout = MindQueries.getCorrectLayoutByElement(mindmapComponent?.root.origin as MindElement);
                targetPath = updatePathByLayoutAndDropTarget(targetPath, layout, dropTarget);
                const originPath = PlaitBoard.findPath(board, activeComponent.element);
                let newElement: Partial<MindElement> = { isCollapsed: false },
                    rightTargetPath = PlaitBoard.findPath(board, targetComponent.element);

                if (!Path.equals(originPath, targetPath)) {
                    updateAbstractInDnd(board, activeElement, dropTarget.target, dropTarget.detectResult);
                }

                if (isStandardLayout(layout)) {
                    updateRightNodeCount(board, activeComponent, targetComponent, dropTarget.detectResult);
                }

                if (dropTarget.detectResult === 'right') {
                    if (targetComponent.node.origin.isRoot) {
                        targetPath = PlaitBoard.findPath(board, targetComponent.element);
                        targetPath.push(0);
                        const rightNodeCount = (targetComponent.node.origin.rightNodeCount as number) + 1;
                        newElement = { isCollapsed: false, rightNodeCount };
                    }
                    Transforms.setNode(board, newElement, rightTargetPath as Path);
                }

                Transforms.moveNode(board, originPath, targetPath);
            }

            if (isDragging(board)) {
                removeActiveOnDragOrigin(activeElement);
            }
            setIsDragging(board, false);
            activeElement = null;
            fakeDragNodeG?.remove();
            fakeDragNodeG = undefined;
            fakeDropNodeG?.remove();
            fakeDropNodeG = undefined;
            dropTarget = null;
        }
        globalMouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        keydown(event);
    };

    return board;
};
