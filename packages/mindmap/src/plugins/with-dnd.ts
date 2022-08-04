import { isPlaitMindmap, PlaitMindmap } from '../interfaces/mindmap';
import {
    IS_TEXT_EDITABLE,
    Transforms,
    idCreator,
    toPoint,
    hotkeys,
    Path,
    PlaitBoard,
    Point,
    createSVG,
    PlaitElementContext,
    PlaitElement,
    PlaitPlugin,
    createG,
    HOST_TO_ROUGH_SVG,
    transformPoint
} from 'plait';
import { PlaitMindmapComponent } from '../mindmap.component';
import { HAS_SELECTED_MINDMAP, HAS_SELECTED_MINDMAP_ELEMENT, MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { drawRoundRectangle, getRectangleByNode, hitMindmapNode } from '../utils/graph';
import { MindmapNode } from '../interfaces/node';
import { SimpleChanges } from '@angular/core';
import { MINDMAP_TO_COMPONENT } from './weak-maps';
import { findPath } from '../utils';
import { MindmapElement } from '../interfaces/element';
import { MindmapNodeComponent } from '../node.component';
import { drawNode } from '../draw/node';
import { RoughSVG } from 'roughjs/bin/svg';
import { getRichtextRectangleByNode } from '../draw/richtext';
import { updateForeignObject } from 'richtext';
import { BASE, PRIMARY_COLOR } from '../constants';

export const withNodeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup, keydown } = board;

    let activeElement: MindmapElement | null;
    let dragStartPoint: Point;
    let isDragging = false;
    let fakeDragNodeG: SVGGElement;
    let fakeDropNodeG: SVGGElement;
    let dropTarget: { target: MindmapElement, detectResult: DetectResult }

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
                        console.log('bomb ! start 拖拽！');
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
                activeComponent.gGroup.classList.add('dragging-origin');
                activeComponent.mindmapGGroup.parentElement?.appendChild(fakeDropNodeG);
                activeComponent.mindmapGGroup.parentElement?.appendChild(fakeDragNodeG);
            } else {
                fakeDragNodeG.childNodes.forEach(node => {
                    node.remove();
                });
                fakeDropNodeG.childNodes.forEach(node => {
                    node.remove();
                })
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
            fakeDragNodeG.append(fakeNodeG);
            fakeDragNodeG.append(richtextG);

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
                        if (detectResult) {
                            dropTarget = { target: node.origin, detectResult };
                        }
                    });
                }
            });
            if (dropTarget) {
                console.log('bomp !');
                if (dropTarget.detectResult === 'right') {
                    // 构造一条直线
                    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                    const { x, y, width, height } = getRectangleByNode(targetComponent.node);
                    const lineLength = 40;
                    const linePoints = [[x + width, y + height / 2], [x + width + lineLength, y + height / 2]] as Point[];
                    const lineSVGG = roughSVG.linearPath(linePoints, { stroke: PRIMARY_COLOR, strokeWidth: 2 });
                    // 构造一个矩形框坐标
                    const fakeRectangleG = drawRoundRectangle(roughSVG, x + width + lineLength, y + height / 2 - 6, x + width + lineLength + 30, y + height / 2 - 6 + 12, { stroke: PRIMARY_COLOR, strokeWidth: 2, fill: PRIMARY_COLOR, fillStyle: 'solid' });
                    fakeDropNodeG.appendChild(lineSVGG);
                    fakeDropNodeG.appendChild(fakeRectangleG);
                }
                if (dropTarget.detectResult === 'top') {
                    // 构造一条曲线
                    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
                    const parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
                    const { x, y, width, height } = getRectangleByNode(targetComponent.node);
                    const lineLength = 40;
                    const linePoints = [[x + width, y + height / 2], [x + width + lineLength, y + height / 2]] as Point[];
                    const lineSVGG = roughSVG.linearPath(linePoints, { stroke: PRIMARY_COLOR, strokeWidth: 2 });
                    // 构造一个矩形框坐标
                    const fakeRectangleG = drawRoundRectangle(roughSVG, x + width + lineLength, y + height / 2 - 6, x + width + lineLength + 30, y + height / 2 - 6 + 12, { stroke: PRIMARY_COLOR, strokeWidth: 2, fill: PRIMARY_COLOR, fillStyle: 'solid' });
                    fakeDropNodeG.appendChild(lineSVGG);
                    fakeDropNodeG.appendChild(fakeRectangleG);
                }
            }
        }

        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (activeElement) {
            const activeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeElement) as MindmapNodeComponent;
            activeComponent.gGroup.classList.remove('dragging-origin');
            isDragging = false;
            activeElement = null;
            fakeDragNodeG.remove();
            fakeDropNodeG.remove();

            console.log('bomb ! end 拖拽！');
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
            console.log('child', (node.origin.value.children[0] as any).text);
            return 'right';    
        }
    }

    if (centerPoint[0] > xLeft && centerPoint[0] < xRight && centerPoint[1] > yTop && centerPoint[1] < yCenter) {
        return 'top';
    }
    if (centerPoint[0] > xLeft && centerPoint[0] < xRight && centerPoint[1] > yCenter && centerPoint[1] < yBottom) {
        return 'bottom';
    }

    if (centerPoint[0] > xLeft && centerPoint[0] < xRight && centerPoint[1] > yCenter && centerPoint[1] < yBottom) {
        return 'bottom';
    }

    return null;
};

export type DetectResult = 'top' | 'bottom' | 'right' | null;
