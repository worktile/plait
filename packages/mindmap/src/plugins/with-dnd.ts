import {
    createG,
    distanceBetweenPointAndPoint,
    HOST_TO_ROUGH_SVG,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    BaseCursorStatus,
    updateCursorStatus,
    ELEMENT_TO_PLUGIN_COMPONENT
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
import { MindmapElement } from '../interfaces/element';
import { isPlaitMindmap, PlaitMindmap } from '../interfaces/mindmap';
import { DetectResult, MindmapNode } from '../interfaces/node';
import { MindmapNodeComponent } from '../node.component';
import {
    directionCorrector,
    directionDetector,
    drawPlaceholderDropNodeG,
    findPath,
    isChildElement,
    readjustmentDropTarget
} from '../utils';
import { getRectangleByNode, hitMindmapNode } from '../utils/graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { MindmapQueries } from '../queries';
import { PlaitMindmapComponent } from '../mindmap.component';

const DRAG_MOVE_BUFFER = 5;

export const withNodeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElement: MindmapElement | null;
    let startPoint: Point;
    let isDragging = false;
    let fakeDragNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindmapElement; detectResult: DetectResult } | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }

        // 确认是否 hit 节点
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        board.children.forEach((value: PlaitElement) => {
            if (activeElement) {
                return;
            }
            if (isPlaitMindmap(value)) {
                const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as PlaitMindmapComponent;
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (activeElement) {
                        return;
                    }
                    if (hitMindmapNode(board, point, node) && !node.origin.isRoot) {
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
            const endPoint = transformPoint(board, toPoint(event.x, event.y, board.host));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance < DRAG_MOVE_BUFFER) {
                return;
            }

            if (!isDragging) {
                isDragging = true;
                updateCursorStatus(board, BaseCursorStatus.drag);
                fakeDragNodeG = createG();
                fakeDragNodeG.classList.add('dragging', 'fake-node', 'plait-board-attached');
                fakeDropNodeG = createG();
                const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
                addActiveOnDragOrigin(activeElement);
                activeComponent.mindmapGGroup.parentElement?.appendChild(fakeDropNodeG);
                activeComponent.mindmapGGroup.parentElement?.appendChild(fakeDragNodeG);
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
            const roughSVG = HOST_TO_ROUGH_SVG.get(board.host) as RoughSVG;
            const fakeDragingNode: MindmapNode = {
                ...activeComponent.node,
                children: [],
                x: activeComponent.node.x + offsetX,
                y: activeComponent.node.y + offsetY
            };
            const { textX, textY, width, height } = getRichtextRectangleByNode(activeComponent.node);
            const fakeNodeG = drawRectangleNode(roughSVG, fakeDragingNode);
            const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
            updateForeignObject(richtextG, width + BASE * 10, height, textX + offsetX, textY + offsetY);
            fakeDragNodeG?.append(fakeNodeG);
            fakeDragNodeG?.append(richtextG);

            // drop position detect
            const { x, y } = getRectangleByNode(fakeDragingNode);
            const detectCenterPoint = [x + width / 2, y + height / 2] as Point;

            let detectResult: DetectResult[] | null = null;
            board.children.forEach((value: PlaitElement) => {
                if (detectResult) {
                    return;
                }
                if (isPlaitMindmap(value)) {
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
                let targetPath = findPath(board, targetComponent.node);
                const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(board.children[0] as PlaitMindmap) as PlaitMindmapComponent;
                const layout = MindmapQueries.getCorrectLayoutByElement(mindmapComponent?.root.origin as MindmapElement);
                targetPath = updatePathByLayoutAnddropTarget(targetPath, layout, dropTarget);
                const originPath = findPath(board, activeComponent.node);
                let newElement: Partial<MindmapElement> = { isCollapsed: false },
                    rightTargetPath = findPath(board, targetComponent.node);

                if (isStandardLayout(layout)) {
                    updateRightNodeCount(board, activeComponent, targetComponent, dropTarget.detectResult);
                }

                if (dropTarget.detectResult === 'right') {
                    if (targetComponent.node.origin.isRoot) {
                        targetPath = findPath(board, targetComponent.node);
                        targetPath.push(0);
                        const rightNodeCount = (targetComponent.node.origin.rightNodeCount as number) + 1;
                        newElement = { isCollapsed: false, rightNodeCount };
                    }
                    Transforms.setNode(board, newElement, rightTargetPath as Path);
                }

                Transforms.moveNode(board, originPath, targetPath);
            }

            if (isDragging) {
                removeActiveOnDragOrigin(activeElement);
            }
            isDragging = false;
            updateCursorStatus(board, BaseCursorStatus.select);
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

export const isValidTarget = (origin: MindmapElement, target: MindmapElement) => {
    return origin !== target && !isChildElement(origin, target);
};

export const addActiveOnDragOrigin = (activeElement: MindmapElement, isOrigin = true) => {
    const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
    if (isOrigin) {
        activeComponent.gGroup.classList.add('dragging-origin');
    } else {
        activeComponent.gGroup.classList.add('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            addActiveOnDragOrigin(child, false);
        });
};

export const removeActiveOnDragOrigin = (activeElement: MindmapElement, isOrigin = true) => {
    const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
    if (isOrigin) {
        activeComponent.gGroup.classList.remove('dragging-origin');
    } else {
        activeComponent.gGroup.classList.remove('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            removeActiveOnDragOrigin(child, false);
        });
};

const updatePathByLayoutAnddropTarget = (
    targetPath: Path,
    layout: MindmapLayoutType,
    dropTarget: { target: MindmapElement; detectResult: DetectResult }
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
    const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(board.children[0] as PlaitMindmap) as PlaitMindmapComponent;
    const activeIndex = mindmapComponent?.root.children.indexOf(activeComponent.node) as number;
    const targetIndex = mindmapComponent?.root.children.indexOf(targetComponent.node) as number;
    const isActiveOnRight = activeIndex !== -1 && activeIndex <= (activeComponent.parent.origin.rightNodeCount as number) - 1;
    const isTargetOnRight =
        targetComponent.parent && targetIndex !== -1 && targetIndex <= (targetComponent.parent.origin.rightNodeCount as number) - 1;
    const isBothOnRight = isActiveOnRight && isTargetOnRight;
    const rootChildCount = board.children[0].children?.length as number;
    const rootRightNodeCount = mindmapComponent?.root.origin.rightNodeCount as number;

    if (!isBothOnRight) {
        if (isActiveOnRight) {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootChildCount - 1 : rootRightNodeCount - 1;
            Transforms.setNode(board, { rightNodeCount }, findPath(board, activeComponent.parent));
        }

        if (isTargetOnRight && detectResult !== 'right') {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootRightNodeCount : rootRightNodeCount + 1;
            Transforms.setNode(board, { rightNodeCount }, findPath(board, targetComponent.parent));
        }

        //二级子节点拖动到根节点左侧
        if (targetComponent.node.origin.isRoot && detectResult === 'left' && activeIndex === -1) {
            rightNodeCount = rootChildCount;
            Transforms.setNode(board, { rightNodeCount }, findPath(board, targetComponent.node));
        }
    }
};
