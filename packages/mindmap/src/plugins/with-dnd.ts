import { isPlaitMindmap } from '../interfaces/mindmap';
import {
    IS_TEXT_EDITABLE,
    Transforms,
    toPoint,
    Path,
    PlaitBoard,
    Point,
    PlaitElement,
    PlaitPlugin,
    createG,
    HOST_TO_ROUGH_SVG,
    transformPoint
} from 'plait';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { drawRoundRectangle, getRectangleByNode, hitMindmapNode } from '../utils/graph';
import { MindmapNode } from '../interfaces/node';
import { MINDMAP_TO_COMPONENT } from './weak-maps';
import { findPath, isChildElement } from '../utils';
import { MindmapElement } from '../interfaces/element';
import { MindmapNodeComponent } from '../node.component';
import { drawNode } from '../draw/node';
import { RoughSVG } from 'roughjs/bin/svg';
import { getRichtextRectangleByNode } from '../draw/richtext';
import { updateForeignObject } from 'richtext';
import { BASE, PRIMARY_COLOR } from '../constants';
import { drawLine } from '../draw/line';

export const withNodeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup, keydown } = board;

    let activeElement: MindmapElement | null;
    let dragStartPoint: Point;
    let isDragging = false;
    let fakeDragNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindmapElement; detectResult: DetectResult } | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (IS_TEXT_EDITABLE.get(board)) {
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
                const mindmapComponent = MINDMAP_TO_COMPONENT.get(value);
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (activeElement) {
                        return;
                    }
                    if (hitMindmapNode(board, point, node) && !node.origin.isRoot) {
                        activeElement = node.origin;
                        dragStartPoint = point;
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
        if (activeElement && dragStartPoint) {
            if (!isDragging) {
                isDragging = true;
                fakeDragNodeG = createG();
                fakeDragNodeG.classList.add('dragging-fake-node');
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
            const end = transformPoint(board, toPoint(event.x, event.y, board.host));
            const offsetX = end[0] - dragStartPoint[0];
            const offsetY = end[1] - dragStartPoint[1];
            const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
            const roughSVG = HOST_TO_ROUGH_SVG.get(board.host) as RoughSVG;
            const fakeDragingNode: MindmapNode = {
                ...activeComponent.node,
                children: [],
                x: activeComponent.node.x + offsetX,
                y: activeComponent.node.y + offsetY
            };
            const { textX, textY, width, height } = getRichtextRectangleByNode(activeComponent.node);
            const fakeNodeG = drawNode(roughSVG, fakeDragingNode);
            const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
            updateForeignObject(richtextG, width + BASE * 10, height, textX + offsetX, textY + offsetY);
            fakeDragNodeG?.append(fakeNodeG);
            fakeDragNodeG?.append(richtextG);

            // drop position detect
            const detectCenterPoint = [
                fakeDragingNode.x + fakeDragingNode.width / 2,
                fakeDragingNode.y + fakeDragingNode.height / 2
            ] as Point;

            let detectResult: DetectResult = null;
            board.children.forEach((value: PlaitElement) => {
                if (detectResult) {
                    return;
                }
                if (isPlaitMindmap(value)) {
                    const mindmapComponent = MINDMAP_TO_COMPONENT.get(value);
                    const root = mindmapComponent?.root;
                    (root as any).eachNode((node: MindmapNode) => {
                        if (detectResult) {
                            return;
                        }
                        detectResult = dropDetector(node, detectCenterPoint);
                        if (detectResult && isValidTarget(activeComponent.node.origin, node.origin)) {
                            dropTarget = { target: node.origin, detectResult };
                        }
                    });
                }
            });

            if (dropTarget) {
                if (dropTarget.detectResult === 'right') {
                    // 构造一条直线
                    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                    const { x, y, width, height } = getRectangleByNode(targetComponent.node);
                    const lineLength = 40;
                    const linePoints = [
                        [x + width, y + height / 2],
                        [x + width + lineLength, y + height / 2]
                    ] as Point[];
                    const lineSVGG = roughSVG.linearPath(linePoints, { stroke: PRIMARY_COLOR, strokeWidth: 2 });
                    // 构造一个矩形框坐标
                    const fakeRectangleG = drawRoundRectangle(
                        roughSVG,
                        x + width + lineLength,
                        y + height / 2 - 6,
                        x + width + lineLength + 30,
                        y + height / 2 - 6 + 12,
                        { stroke: PRIMARY_COLOR, strokeWidth: 2, fill: PRIMARY_COLOR, fillStyle: 'solid' }
                    );
                    fakeDropNodeG?.appendChild(lineSVGG);
                    fakeDropNodeG?.appendChild(fakeRectangleG);
                }
                if (dropTarget.detectResult === 'top') {
                    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                    const targetRect = getRectangleByNode(targetComponent.node);
                    const parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
                    const targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);
                    let fakeY = targetRect.y - 30;
                    if (targetIndex > 0) {
                        const previousComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
                            parentComponent.node.origin.children[targetIndex - 1]
                        ) as MindmapNodeComponent;
                        const previousRect = getRectangleByNode(previousComponent.node);
                        const topY = previousRect.y + previousRect.height;
                        fakeY = topY + (targetRect.y - topY) / 5;
                    }
                    // 构造一条曲线
                    const fakeNode: MindmapNode = { ...targetComponent.node, y: fakeY, width: 30, height: 12 };
                    const linkSVGG = drawLine(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR);
                    // 构造一个矩形框坐标
                    const fakeRectangleG = drawRoundRectangle(roughSVG, targetRect.x, fakeY, targetRect.x + 30, fakeY + 12, {
                        stroke: PRIMARY_COLOR,
                        strokeWidth: 2,
                        fill: PRIMARY_COLOR,
                        fillStyle: 'solid'
                    });
                    fakeDropNodeG?.appendChild(linkSVGG);
                    fakeDropNodeG?.appendChild(fakeRectangleG);
                }
                if (dropTarget.detectResult === 'bottom') {
                    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                    const targetRect = getRectangleByNode(targetComponent.node);
                    const parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
                    const targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);
                    let fakeY = targetRect.y + targetRect.height + 30;
                    if (targetIndex < parentComponent.node.origin.children.length - 1) {
                        const nextComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
                            parentComponent.node.origin.children[targetIndex + 1]
                        ) as MindmapNodeComponent;
                        const nextRect = getRectangleByNode(nextComponent.node);
                        const topY = targetRect.y + targetRect.height;
                        fakeY = topY + (nextRect.y - topY) / 5;
                    }
                    // 构造一条曲线
                    const fakeNode: MindmapNode = { ...targetComponent.node, y: fakeY, width: 30, height: 12 };
                    const linkSVGG = drawLine(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR);
                    // 构造一个矩形框坐标
                    const fakeRectangleG = drawRoundRectangle(roughSVG, targetRect.x, fakeY, targetRect.x + 30, fakeY + 12, {
                        stroke: PRIMARY_COLOR,
                        strokeWidth: 2,
                        fill: PRIMARY_COLOR,
                        fillStyle: 'solid'
                    });
                    fakeDropNodeG?.appendChild(linkSVGG);
                    fakeDropNodeG?.appendChild(fakeRectangleG);
                }
            }
        }

        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (activeElement) {
            if (dropTarget) {
                const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
                const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                let targetPath = findPath(board, targetComponent.node);
                if (dropTarget.detectResult === 'right') {
                    targetPath.push(dropTarget.target.children.length);
                }
                if (dropTarget.detectResult === 'bottom') {
                    targetPath = Path.next(targetPath);
                }
                const originPath = findPath(board, activeComponent.node);
                if (dropTarget.detectResult === 'right') {
                    const newElement: Partial<MindmapElement> = { isCollapsed: false };
                    Transforms.setNode(board, newElement, findPath(board, targetComponent.node));
                }
                Transforms.moveNode(board, originPath, targetPath);
            }
            if (isDragging) {
                removeActiveOnDragOrigin(activeElement);
            }
            isDragging = false;
            activeElement = null;
            fakeDragNodeG?.remove();
            fakeDragNodeG = undefined;
            fakeDropNodeG?.remove();
            fakeDropNodeG = undefined;
            dropTarget = null;
        }
        mouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        keydown(event);
    };

    return board;
};

export const dropDetector = (node: MindmapNode, centerPoint: Point): DetectResult => {
    const { x, y, width, height } = getRectangleByNode(node);
    const yTop = node.y;
    const yBottom = node.y + node.height;
    const yCenter = node.y + node.height / 2;
    const xLeft = node.x;
    const xRight = x + width;
    if (node.origin.children.length === 0 || node.origin.isCollapsed) {
        if (centerPoint[0] > xRight && centerPoint[1] < node.x + node.width && centerPoint[1] > y && centerPoint[1] < y + height) {
            return 'right';
        }
    }
    if (centerPoint[0] > xLeft && centerPoint[0] < xRight && centerPoint[1] > yTop && centerPoint[1] < yCenter && !node.origin.isRoot) {
        return 'top';
    }
    if (centerPoint[0] > xLeft && centerPoint[0] < xRight && centerPoint[1] > yCenter && centerPoint[1] < yBottom && !node.origin.isRoot) {
        return 'bottom';
    }
    return null;
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
    activeElement.children.forEach(child => {
        removeActiveOnDragOrigin(child, false);
    });
};

export type DetectResult = 'top' | 'bottom' | 'right' | null;
