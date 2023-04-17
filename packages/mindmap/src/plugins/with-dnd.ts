import {
    createG,
    distanceBetweenPointAndPoint,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    ELEMENT_TO_PLUGIN_COMPONENT,
    getSelectedElements,
    PlaitNode,
    NODE_TO_PARENT,
    depthFirstRecursion,
    PlaitPointerType
} from '@plait/core';
import {
    isBottomLayout,
    isHorizontalLogicLayout,
    isIndentedLayout,
    isLeftLayout,
    isRightLayout,
    isStandardLayout,
    isTopLayout,
    isVerticalLogicLayout,
    MindmapLayoutType
} from '@plait/layouts';
import { updateForeignObject } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { BASE } from '../constants';
import { getRichtextRectangleByNode } from '../draw/richtext';
import { drawRectangleNode } from '../draw/shape';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces/element';
import { DetectResult, MindmapNode } from '../interfaces/node';
import { MindmapNodeComponent } from '../node.component';
import {
    directionCorrector,
    directionDetector,
    drawPlaceholderDropNodeG,
    findMindmap,
    isChildElement,
    readjustmentDropTarget
} from '../utils';
import { getRectangleByNode, hitMindmapElement } from '../utils/graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { MindmapQueries } from '../queries';
import { PlaitMindmapComponent } from '../mindmap.component';

const DRAG_MOVE_BUFFER = 5;

export const withDND: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElement: MindmapNodeElement | null;
    let startPoint: Point;
    let fakeDragNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindmapNodeElement; detectResult: DetectResult } | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (
            PlaitBoard.isReadonly(board) ||
            PlaitBoard.hasBeenTextEditing(board) ||
            event.button === 2 ||
            board.pointer === PlaitPointerType.hand
        ) {
            mousedown(event);
            return;
        }
        const selectedElements = getSelectedElements(board);
        if (selectedElements.length > 0) {
            mousedown(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        board.children
            .filter(value => PlaitMindmap.isPlaitMindmap(value))
            .forEach(mindmap => {
                depthFirstRecursion<MindmapNodeElement>(mindmap as MindmapNodeElement, node => {
                    if (!activeElement && hitMindmapElement(board, point, node) && !node.isRoot) {
                        activeElement = node.origin;
                        startPoint = point;
                    }
                });
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
                const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
                addActiveOnDragOrigin(activeElement);
                // activeComponent.mindmapG.parentElement?.appendChild(fakeDropNodeG);
                // activeComponent.mindmapG.parentElement?.appendChild(fakeDragNodeG);
            } else {
                fakeDragNodeG?.childNodes.forEach(node => {
                    node.remove();
                });
                fakeDropNodeG?.childNodes.forEach(node => {
                    node.remove();
                });
            }

            // fake dragging origin node
            const offsetX = endPoint[0] - startPoint[0];
            const offsetY = endPoint[1] - startPoint[1];
            const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const fakeDraggingNode: MindmapNode = {
                ...activeComponent.node,
                children: [],
                x: activeComponent.node.x + offsetX,
                y: activeComponent.node.y + offsetY
            };
            const { textX, textY, width, height } = getRichtextRectangleByNode(activeComponent.node);
            const fakeNodeG = drawRectangleNode(board, fakeDraggingNode);
            const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
            updateForeignObject(richtextG, width + BASE * 10, height, textX + offsetX, textY + offsetY);
            fakeDragNodeG?.append(fakeNodeG);
            fakeDragNodeG?.append(richtextG);

            // drop position detect
            const { x, y } = getRectangleByNode(fakeDraggingNode);
            const detectCenterPoint = [x + width / 2, y + height / 2] as Point;

            let detectResult: DetectResult[] | null = null;
            board.children.forEach((value: PlaitElement) => {
                if (detectResult) {
                    return;
                }
                if (PlaitMindmap.isPlaitMindmap(value)) {
                    const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as PlaitMindmapComponent;
                    const root = mindmapComponent?.root;

                    (root as any).eachNode((node: MindmapNode) => {
                        if (detectResult) {
                            return;
                        }
                        const directions = directionDetector(node, detectCenterPoint);
                        if (directions) {
                            detectResult = directionCorrector(board, node, directions);
                        }
                        dropTarget = null;
                        if (detectResult && isValidTarget(activeComponent.node.origin, node.origin)) {
                            dropTarget = { target: node.origin, detectResult: detectResult[0] };
                        }
                    });
                }
            });

            if (dropTarget?.target) {
                dropTarget = readjustmentDropTarget(board, dropTarget);
                drawPlaceholderDropNodeG(board, dropTarget, roughSVG, fakeDropNodeG);
            }
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement) {
            if (dropTarget?.target) {
                let targetPath = PlaitBoard.findPath(board, dropTarget.target);
                const rightTargetPath = [...targetPath];
                const mindmapElement = findMindmap(board, dropTarget.target) as PlaitMindmap;
                const layout = MindmapQueries.getCorrectLayoutByElement(board, mindmapElement);
                targetPath = updatePathByLayoutAndDropTarget(targetPath, layout, dropTarget);
                const actionElementPath = PlaitBoard.findPath(board, activeElement);
                let newElement: Partial<MindmapNodeElement> = { isCollapsed: false };

                if (isStandardLayout(layout)) {
                    updateRightNodeCount(board, activeElement, dropTarget.target, dropTarget.detectResult);
                }

                if (dropTarget.detectResult === 'right') {
                    if (dropTarget.target.isRoot) {
                        targetPath = PlaitBoard.findPath(board, dropTarget.target);
                        targetPath.push(0);
                        const rightNodeCount = (dropTarget.target.rightNodeCount as number) + 1;
                        newElement = { isCollapsed: false, rightNodeCount };
                    }
                    Transforms.setNode(board, newElement, rightTargetPath as Path);
                }

                Transforms.moveNode(board, actionElementPath, targetPath);
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

export const isValidTarget = (origin: MindmapNodeElement, target: MindmapNodeElement) => {
    return origin !== target && !isChildElement(origin, target);
};

export const addActiveOnDragOrigin = (activeElement: MindmapNodeElement, isOrigin = true) => {
    const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
    if (isOrigin) {
        activeComponent.g.classList.add('dragging-origin');
    } else {
        activeComponent.g.classList.add('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            addActiveOnDragOrigin(child, false);
        });
};

export const removeActiveOnDragOrigin = (activeElement: MindmapNodeElement, isOrigin = true) => {
    const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
    if (isOrigin) {
        activeComponent.g.classList.remove('dragging-origin');
    } else {
        activeComponent.g.classList.remove('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            removeActiveOnDragOrigin(child, false);
        });
};

const updatePathByLayoutAndDropTarget = (
    targetPath: Path,
    layout: MindmapLayoutType,
    dropTarget: { target: MindmapNodeElement; detectResult: DetectResult }
) => {
    // 上下布局：左右是兄弟节点，上下是子节点
    if (isVerticalLogicLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath.push(dropTarget.target.children.length);
        }
        // 如果是左，位置不变，右则插入到下一个兄弟节点
        if (dropTarget.detectResult === 'right') {
            targetPath = Path.next(targetPath);
        }
    }
    // 水平布局/标准布局：上下是兄弟节点，左右是子节点
    if (isHorizontalLogicLayout(layout)) {
        if (dropTarget.detectResult === 'right') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (dropTarget.detectResult === 'left') {
            targetPath.push(dropTarget.target.children.length);
        }
        // 如果是上，位置不变，下插入到下一个兄弟节点
        if (dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
    }
    // 缩进布局：上下是兄弟节点，左右是子节点，但上（左上/右上），探测到上是子节点，下则位置不变，反之同理。
    if (isIndentedLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath = Path.next(targetPath);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
        if (isLeftLayout(layout) && dropTarget.detectResult === 'left') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (isRightLayout(layout) && dropTarget.detectResult === 'right') {
            targetPath.push(dropTarget.target.children.length);
        }
    }
    return targetPath;
};

export const updateRightNodeCount = (
    board: PlaitBoard,
    activeElement: MindmapNodeElement,
    targetElement: MindmapNodeElement,
    detectResult: DetectResult
) => {
    let rightNodeCount;
    const targetMindmap = findMindmap(board, targetElement) as PlaitMindmap;
    const activeMindmap = findMindmap(board, activeElement) as PlaitMindmap;
    const targetParent = NODE_TO_PARENT.get(targetElement);
    const activeIndex = activeMindmap.children.indexOf(activeElement);
    const targetIndex = targetMindmap.children.indexOf(targetElement);
    const isActiveOnRight = activeIndex !== -1 && activeIndex <= ((targetParent as PlaitMindmap).rightNodeCount as number) - 1;
    const isTargetOnRight =
        targetParent && targetIndex !== -1 && targetIndex <= ((targetParent as PlaitMindmap).rightNodeCount as number) - 1;
    const isBothOnRight = isActiveOnRight && isTargetOnRight;
    const rootChildCount = targetMindmap.children?.length as number;
    const rootRightNodeCount = targetMindmap.rightNodeCount as number;

    if (!isBothOnRight) {
        if (isActiveOnRight) {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootChildCount - 1 : rootRightNodeCount - 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, activeMindmap));
        }

        if (isTargetOnRight && detectResult !== 'right') {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootRightNodeCount : rootRightNodeCount + 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetMindmap));
        }

        //二级子节点拖动到根节点左侧
        if (targetElement.isRoot && detectResult === 'left' && activeIndex === -1) {
            rightNodeCount = rootChildCount;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetElement));
        }
    }
};

const IS_DRAGGING = new WeakMap<PlaitBoard, boolean>();

export const isDragging = (board: PlaitBoard) => {
    return !!IS_DRAGGING.get(board);
};

export const setIsDragging = (board: PlaitBoard, state: boolean) => {
    IS_DRAGGING.set(board, state);
};
