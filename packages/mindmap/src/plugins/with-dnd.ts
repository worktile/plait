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
    getSelectedElements
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
    findUpElement,
    isChildElement,
    readjustmentDropTarget
} from '../utils';
import { getRectangleByNode, hitMindmapElement } from '../utils/graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { MindmapQueries } from '../queries';
import { PlaitMindmapComponent } from '../mindmap.component';

const DRAG_MOVE_BUFFER = 5;

export const withNodeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElement: MindmapNodeElement | null;
    let startPoint: Point;
    let fakeDragNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindmapNodeElement; detectResult: DetectResult } | null = null;

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
            if (PlaitMindmap.isMindmap(value)) {
                const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as PlaitMindmapComponent;
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (activeElement) {
                        return;
                    }
                    if (hitMindmapElement(board, point, node.origin) && !node.origin.isRoot && selectedElements.length <= 1) {
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
                const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
                addActiveOnDragOrigin(activeElement);
                activeComponent.mindmapG.parentElement?.appendChild(fakeDropNodeG);
                activeComponent.mindmapG.parentElement?.appendChild(fakeDragNodeG);
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
                if (PlaitMindmap.isMindmap(value)) {
                    const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as PlaitMindmapComponent;
                    const root = mindmapComponent?.root;

                    (root as any).eachNode((node: MindmapNode) => {
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
                drawPlaceholderDropNodeG(dropTarget, roughSVG, fakeDropNodeG);
            }
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement) {
            if (dropTarget?.target) {
                const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
                const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                let targetPath = PlaitBoard.findPath(board, targetComponent.element);
                const mindmapElement = findUpElement(dropTarget.target).root;
                const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(mindmapElement as PlaitMindmap) as PlaitMindmapComponent;
                const layout = MindmapQueries.getCorrectLayoutByElement(mindmapComponent?.root.origin as MindmapNodeElement);
                targetPath = updatePathByLayoutAndDropTarget(targetPath, layout, dropTarget);
                const originPath = PlaitBoard.findPath(board, activeComponent.element);
                let newElement: Partial<MindmapNodeElement> = { isCollapsed: false },
                    rightTargetPath = PlaitBoard.findPath(board, targetComponent.element);

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
    activeComponent: MindmapNodeComponent,
    targetComponent: MindmapNodeComponent,
    detectResult: DetectResult
) => {
    let rightNodeCount;
    const mindmapElement = findUpElement(targetComponent.node.origin).root;
    const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(mindmapElement as PlaitMindmap) as PlaitMindmapComponent;
    const activeIndex = mindmapComponent?.root.children.indexOf(activeComponent.node) as number;
    const targetIndex = mindmapComponent?.root.children.indexOf(targetComponent.node) as number;
    const isActiveOnRight = activeIndex !== -1 && activeIndex <= (activeComponent.parent.origin.rightNodeCount as number) - 1;
    const isTargetOnRight =
        targetComponent.parent && targetIndex !== -1 && targetIndex <= (targetComponent.parent.origin.rightNodeCount as number) - 1;
    const isBothOnRight = isActiveOnRight && isTargetOnRight;
    const rootChildCount = mindmapComponent.root.children?.length as number;
    const rootRightNodeCount = mindmapComponent?.root.origin.rightNodeCount as number;

    if (!isBothOnRight) {
        if (isActiveOnRight) {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootChildCount - 1 : rootRightNodeCount - 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, activeComponent.parent.origin));
        }

        if (isTargetOnRight && detectResult !== 'right') {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootRightNodeCount : rootRightNodeCount + 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetComponent.parent.origin));
        }

        //二级子节点拖动到根节点左侧
        if (targetComponent.node.origin.isRoot && detectResult === 'left' && activeIndex === -1) {
            rightNodeCount = rootChildCount;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetComponent.element));
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
