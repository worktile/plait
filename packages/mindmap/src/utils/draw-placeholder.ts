import { RoughSVG } from 'roughjs/bin/svg';
import { BASE, PRIMARY_COLOR, STROKE_WIDTH } from '../constants';
import { drawLink } from '../draw/link';
import { DetectResult, MindmapElement, MindmapNode } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { drawRoundRectangle, getRectangleByNode } from './graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { Point } from '@plait/core';
import { MindmapQueries } from '../queries';
import {
    isBottomLayout,
    isHorizontalLayout,
    isIndentedLayout,
    isRightLayout,
    isVerticalLogicLayout,
    MindmapLayoutType
} from '@plait/layouts';
import { drawIndentedLink } from '../draw/indented-link';
import { isLeftLayout, isTopLayout } from '@plait/layouts';
import { isStandardLayout } from '@plait/layouts';

export const drawPlaceholderDropNodeG = (
    dropTarget: { target: MindmapElement; detectResult: DetectResult },
    roughSVG: RoughSVG,
    fakeDropNodeG: SVGGElement | undefined,
    activeComponent: MindmapNodeComponent
) => {
    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
    const targetRect = getRectangleByNode(targetComponent.node);
    if (dropTarget.detectResult && ['right', 'left'].includes(dropTarget.detectResult)) {
        drawStraightDropNodeG(targetRect, dropTarget.detectResult, targetComponent, roughSVG, fakeDropNodeG, activeComponent);
    }

    if (targetComponent.parent && dropTarget.detectResult && ['top', 'bottom'].includes(dropTarget.detectResult)) {
        const parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
        const targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);
        drawCurvePlaceholderDropNodeG(
            targetRect,
            dropTarget.detectResult,
            targetIndex,
            targetComponent,
            roughSVG,
            parentComponent,
            fakeDropNodeG,
            activeComponent
        );
    }
};

export const drawCurvePlaceholderDropNodeG = (
    targetRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    detectResult: DetectResult,
    targetIndex: number,
    targetComponent: MindmapNodeComponent,
    roughSVG: RoughSVG,
    parentComponent: MindmapNodeComponent,
    fakeDropNodeG: SVGGElement | undefined,
    activeComponent: MindmapNodeComponent
) => {
    let fakeY = targetRect.y - 30;
    const layout = MindmapQueries.getCorrectLayoutByElement(targetComponent.node.origin);
    const strokeWidth = targetComponent.node.origin.linkLineWidth ? targetComponent.node.origin.linkLineWidth : STROKE_WIDTH;
    const previousComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
        parentComponent.node.origin.children[targetIndex - 1]
    ) as MindmapNodeComponent;
    const nextComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(parentComponent.node.origin.children[targetIndex + 1]) as MindmapNodeComponent;
    if (targetComponent === activeComponent) {
        return;
    }
    if (isIndentedLayout(layout)) {
        if (isTopLayout(layout)) {
            if (detectResult === 'bottom' && previousComponent === activeComponent) {
                return;
            }
            if (detectResult === 'top' && nextComponent === activeComponent) {
                return;
            }
        }
        if (isBottomLayout(layout)) {
            if (detectResult === 'top' && previousComponent === activeComponent) {
                return;
            }
            if (detectResult === 'bottom' && nextComponent === activeComponent) {
                return;
            }
        }
    } else {
        if (detectResult === 'top' && previousComponent === activeComponent) {
            return;
        }
        if (detectResult === 'bottom' && nextComponent === activeComponent) {
            return;
        }
    }

    if (detectResult === 'top') {
        if (targetIndex > 0) {
            const previousRect = getRectangleByNode(previousComponent.node);
            const topY = previousRect.y + previousRect.height;
            fakeY = topY + (targetRect.y - topY) / 5;
        }
        // 左下、右下、下布局且是最上面的节点
        if (targetIndex === 0) {
            if (layout === MindmapLayoutType.leftBottomIndented || layout === MindmapLayoutType.rightBottomIndented) {
                fakeY = targetRect.y;
            }
        }
        // 左上、右上、上布局且是最上面的节点
        if (targetIndex === parentComponent.node.origin.children.length - 1) {
            if (isTopLayout(layout)) {
                fakeY = targetRect.y - targetRect.height;
            }
        }
    }
    if (detectResult === 'bottom') {
        fakeY = targetRect.y + targetRect.height + 30;
        if (targetIndex < parentComponent.node.origin.children.length - 1) {
            const nextRect = getRectangleByNode(nextComponent.node);
            const topY = targetRect.y + targetRect.height;
            fakeY = topY + (nextRect.y - topY) / 5;
        }
        // 左上、右上并且是当前分支第一个
        if (targetIndex === 0 && isTopLayout(layout)) {
            fakeY = targetRect.y + targetRect.height;
        }
    }
    const parentNodeLayout = MindmapQueries.getCorrectLayoutByElement(parentComponent.node.origin);
    if (isStandardLayout(parentNodeLayout)) {
        const rightNodeCount = parentComponent.node.origin.rightNodeCount as number;
        if (detectResult === 'top') {
            const isLeftFirst = parentComponent.node.children[rightNodeCount] === targetComponent.node;
            // 拖拽至左第一个节点的情况
            if (isLeftFirst) {
                fakeY = targetRect.y - targetRect.height;
            }
        } else {
            const isRightLast = parentComponent.node.children[rightNodeCount - 1] === targetComponent.node;
            // 拖拽至最后一个节点的下方或右侧的最后一个节点的下方
            if (isRightLast) {
                fakeY = targetRect.y + targetRect.height + 30;
            }
        }
    }
    let fakeX = targetComponent.node.x;
    let fakeRectangleStartX = targetRect.x,
        fakeRectangleEndX = targetRect.x + 30,
        fakeRectangleStartY = fakeY,
        fakeRectangleEndY = fakeRectangleStartY + 12,
        width = 30;
    if (isLeftLayout(layout)) {
        fakeX = targetComponent.node.x + targetComponent.node.width - 30;
        fakeRectangleStartX = targetRect.x + targetRect.width - 30;
        fakeRectangleEndX = targetRect.x + targetRect.width;
    }
    if (isVerticalLogicLayout(layout)) {
        parentComponent = targetComponent;
        targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
        fakeX = parentComponent.node.x;
        width = parentComponent.node.width;
        const vGap = BASE * 6 + strokeWidth;
        if (isTopLayout(layout) && detectResult === 'top') {
            fakeY = targetRect.y - vGap;
            fakeRectangleStartY = fakeY - vGap + strokeWidth;
        }
        if (isBottomLayout(layout) && detectResult === 'bottom') {
            fakeY = targetRect.y + targetRect.height + vGap;
            fakeRectangleStartY = fakeY + vGap - strokeWidth;
        }
        fakeRectangleStartX = fakeX + Math.ceil(parentComponent.node.width / 2) - parentComponent.node.hGap - Math.ceil(strokeWidth / 2);
        fakeRectangleEndX = fakeRectangleStartX + 30;
        fakeRectangleEndY = fakeRectangleStartY + 12;
    }
    if (isIndentedLayout(layout)) {
        // 偏移一个 Gap
        if (isLeftLayout(layout)) {
            fakeX -= BASE * 4;
        }
        if (isRightLayout(layout)) {
            fakeX += BASE * 4;
        }
        if (isTopLayout(layout)) {
            if (detectResult === 'top') {
                const isLastNode = targetIndex === parentComponent.node.origin.children.length - 1;
                if (isLastNode) {
                    fakeY = targetRect.y - targetRect.height - BASE;
                } else {
                    const nextRect = getRectangleByNode(nextComponent.node);
                    fakeY = targetRect.y - Math.abs((nextRect.y + nextRect.height - targetRect.y) / 2);
                }
            }
            if (detectResult === 'bottom') {
                const isFirstNode = targetIndex === 0;
                if (isFirstNode) {
                    const parentRect = getRectangleByNode(parentComponent.node);
                    fakeY = parentRect.y - Math.abs((targetRect.y + targetRect.height - parentRect.y) / 2);
                } else {
                    const previousRect = getRectangleByNode(previousComponent.node);
                    fakeY = previousRect.y - Math.abs((targetRect.y + targetRect.height - previousRect.y) / 2);
                }
            }
        }
        fakeRectangleStartX = fakeX;
        fakeRectangleEndX = fakeRectangleStartX + 30;
        fakeRectangleStartY = fakeY;
        fakeRectangleEndY = fakeRectangleStartY + 12;
    }

    // 构造一条曲线
    const fakeNode: MindmapNode = { ...targetComponent.node, x: fakeX, y: fakeY, width, height: 12 };
    const linkSVGG = isIndentedLayout(layout)
        ? drawIndentedLink(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR, false)
        : drawLink(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR, isHorizontalLayout(layout), false);
    // 构造一个矩形框坐标
    const fakeRectangleG = drawRoundRectangle(roughSVG, fakeRectangleStartX, fakeRectangleStartY, fakeRectangleEndX, fakeRectangleEndY, {
        stroke: PRIMARY_COLOR,
        strokeWidth: 2,
        fill: PRIMARY_COLOR,
        fillStyle: 'solid'
    });
    fakeDropNodeG?.appendChild(linkSVGG);
    fakeDropNodeG?.appendChild(fakeRectangleG);
};
export const drawStraightDropNodeG = (
    targetRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    detectResult: DetectResult,
    targetComponent: MindmapNodeComponent,
    roughSVG: RoughSVG,
    fakeDropNodeG: SVGGElement | undefined,
    activeComponent: MindmapNodeComponent
) => {
    const parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
    const targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);
    const previousComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
        parentComponent.node.origin.children[targetIndex - 1]
    ) as MindmapNodeComponent;
    const nextComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(parentComponent.node.origin.children[targetIndex + 1]) as MindmapNodeComponent;
    if (targetComponent === activeComponent) {
        return;
    }
    if (detectResult === 'left' && previousComponent === activeComponent) {
        return;
    }
    if (detectResult === 'right' && nextComponent === activeComponent) {
        return;
    }
    const { x, y, width, height } = targetRect;
    const lineLength = 40;
    let startLinePoint = x + width;
    let endLinePoint = x + width + lineLength;
    let startRectanglePointX = x + width + lineLength;
    let endRectanglePointX = x + lineLength + width + 30;
    let startRectanglePointY = y + height / 2 - 6;
    let endRectanglePointY = y + height / 2 - 6 + 12;

    if (detectResult === 'left') {
        startLinePoint = x - lineLength;
        endLinePoint = x;
        startRectanglePointX = x - lineLength - 30;
        endRectanglePointX = x - lineLength;
    }
    let fakeY = targetComponent.node.y;
    let fakeX = targetRect.x;
    const layout = MindmapQueries.getCorrectLayoutByElement(targetComponent.node.origin);
    // 构造一条直线
    let linePoints = [
        [startLinePoint, y + height / 2],
        [endLinePoint, y + height / 2]
    ] as Point[];
    const strokeWidth = targetComponent.node.origin.linkLineWidth ? targetComponent.node.origin.linkLineWidth : STROKE_WIDTH;
    if (isIndentedLayout(layout)) {
        const hGap = BASE * 4;
        const vGap = BASE * 6;
        const offsetX = hGap + width / 2 + strokeWidth;
        const offsetY = vGap + height / 2 + strokeWidth;
        if (isLeftLayout(layout)) {
            fakeX = x - offsetX;
        }
        if (isRightLayout(layout)) {
            fakeX = x + offsetX;
        }
        if (isTopLayout(layout)) {
            fakeY = y - offsetY;
        }
        if (isBottomLayout(layout)) {
            fakeY = y + height + offsetY;
        }
        startRectanglePointX = fakeX;
        startRectanglePointY = fakeY;
        endRectanglePointX = startRectanglePointX + 30;
        endRectanglePointY = startRectanglePointY + 12;
        const fakeNode: MindmapNode = { ...targetComponent.node, x: fakeX, y: fakeY, width: 30, height: 12 };
        const linkSVGG = drawIndentedLink(roughSVG, targetComponent.node, fakeNode, PRIMARY_COLOR, false);
        fakeDropNodeG?.appendChild(linkSVGG);
    } else if (isVerticalLogicLayout(layout)) {
        if (!targetComponent.node.origin.isRoot) {
            /**
             * 计算逻辑：
             *  1. 移动到左侧：当前节点 startX - 偏移值，偏移值计算如下：
             *      a. 第一个节点： 固定值（来源于 getMainAxle，第二级节点：BASE * 8，其他 BASE * 3 + strokeWidth / 2）；
             *      b. 第二个节点到最后一个节点之间：上一个节点到当前节点间距的一半（(当前节点 startX - 上一个节点的 endX) / 2)，endX = 当前节点的 startX + width;
             *  2. 移动到右侧：当前节点 x + width + 偏移值，偏移值计算如下：
             *      a. 第二个节点到最后一个节点之间的右侧：当前节点到下一个节点间距的一半（(下一个节点 startX - 当前节点的 endX) / 2)，endX = 当前节点的 startX + width;
             *      b. 最后一个节点的右侧：固定值（来源于 getMainAxle，第二级节点：BASE * 8，其他 BASE * 3 + strokeWidth / 2）；
             */
            fakeY = targetComponent.node.y;

            if (detectResult === 'left') {
                let offsetX = 0;
                const isFirstNode = targetIndex === 0;
                if (isFirstNode) {
                    offsetX = parentComponent.node.origin.isRoot ? BASE * 8 : BASE * 3 + strokeWidth / 2;
                } else {
                    const previousRect = getRectangleByNode(previousComponent.node);
                    const space = targetRect.x - (previousRect.x + previousRect.width);
                    offsetX = space / 2;
                }
                fakeX = targetRect.x - offsetX - width / 2 - Math.ceil(strokeWidth / 2);
            }
            if (detectResult === 'right') {
                let offsetX = 0;
                const isLastNode = targetIndex === parentComponent.node.origin.children.length - 1;
                if (isLastNode) {
                    offsetX = parentComponent.node.origin.isRoot ? BASE * 8 : BASE * 3 + strokeWidth / 2;
                } else {
                    const nextRect = getRectangleByNode(nextComponent.node);
                    const space = nextRect.x - (targetRect.x + targetRect.width);
                    offsetX = space / 2;
                }
                fakeX = targetRect.x + width + offsetX - width / 2 - Math.ceil(strokeWidth / 2);
            }
            startRectanglePointX = fakeX;
            if (isTopLayout(layout)) {
                // 因为矩形是从左上角为起点向下画的，所以需要向上偏移一个矩形的高度（-12）
                startRectanglePointY = fakeY + height + targetComponent.node.vGap - 12;
            }
            if (isBottomLayout(layout)) {
                startRectanglePointY = fakeY + targetComponent.node.vGap;
            }
            endRectanglePointX = startRectanglePointX + 30;
            endRectanglePointY = startRectanglePointY + 12;
            const fakeNode: MindmapNode = { ...targetComponent.node, x: fakeX, y: fakeY, width: 30 };
            const linkSVGG = drawLink(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR, false, false);
            fakeDropNodeG?.appendChild(linkSVGG);
        }
    } else {
        let linkSVGG = roughSVG.linearPath(linePoints, { stroke: PRIMARY_COLOR, strokeWidth });
        fakeDropNodeG?.appendChild(linkSVGG);
    }

    // 构造一个矩形框坐标
    let fakeRectangleG = drawRoundRectangle(roughSVG, startRectanglePointX, startRectanglePointY, endRectanglePointX, endRectanglePointY, {
        stroke: PRIMARY_COLOR,
        strokeWidth: 2,
        fill: PRIMARY_COLOR,
        fillStyle: 'solid'
    });

    fakeDropNodeG?.appendChild(fakeRectangleG);
};
