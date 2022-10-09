import { RoughSVG } from 'roughjs/bin/svg';
import { BASE, PRIMARY_COLOR, STROKE_WIDTH } from '../constants';
import { drawLink } from '../draw/link';
import { DetectResult, MindmapElement, MindmapNode } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { drawRoundRectangle, getRectangleByNode } from './graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { Point } from '@plait/core';
import { getCorrectLayoutByElement } from './layout';
import { isBottomLayout, isIndentedLayout, isRightLayout, MindmapLayoutType } from '@plait/layouts';
import { drawIndentedLink } from '../draw/indented-link';
import { isLeftLayout, isTopLayout } from '@plait/layouts';

export const drawPlaceholderDropNodeG = (
    dropTarget: { target: MindmapElement; detectResult: DetectResult },
    roughSVG: RoughSVG,
    fakeDropNodeG: SVGGElement | undefined
) => {
    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
    const targetRect = getRectangleByNode(targetComponent.node);
    if (dropTarget.detectResult && ['right', 'left'].includes(dropTarget.detectResult)) {
        drawStraightDropNodeG(targetRect, dropTarget.detectResult, targetComponent, roughSVG, fakeDropNodeG);
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
            fakeDropNodeG
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
    fakeDropNodeG: SVGGElement | undefined
) => {
    let fakeY = targetRect.y - 30;
    const layout = getCorrectLayoutByElement(targetComponent.node.origin);
    if (detectResult === 'top') {
        if (targetIndex > 0) {
            const previousComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
                parentComponent.node.origin.children[targetIndex - 1]
            ) as MindmapNodeComponent;
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
            const nextComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
                parentComponent.node.origin.children[targetIndex + 1]
            ) as MindmapNodeComponent;
            const nextRect = getRectangleByNode(nextComponent.node);
            const topY = targetRect.y + targetRect.height;
            fakeY = topY + (nextRect.y - topY) / 5;
        }
        // 左上、右上并且是当前分支第一个
        if (targetIndex === 0 && isTopLayout(layout)) {
            fakeY = targetRect.y + targetRect.height;
        }
    }
    let fakeX = targetComponent.node.x;
    let fakeRectangleStartX = targetRect.x,
        fakeRectangleEndX = targetRect.x + 30;
    if (isLeftLayout(layout)) {
        fakeX = targetComponent.node.x + targetComponent.node.width - 30;
        fakeRectangleStartX = targetRect.x + targetRect.width - 30;
        fakeRectangleEndX = targetRect.x + targetRect.width;
    }
    // 构造一条曲线
    const fakeNode: MindmapNode = { ...targetComponent.node, x: fakeX, y: fakeY, width: 30, height: 12 };
    const linkSVGG = isIndentedLayout(layout)
        ? drawIndentedLink(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR, false)
        : drawLink(roughSVG, parentComponent.node, fakeNode, PRIMARY_COLOR, undefined, false);
    // 构造一个矩形框坐标
    const fakeRectangleG = drawRoundRectangle(roughSVG, fakeRectangleStartX, fakeY, fakeRectangleEndX, fakeY + 12, {
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
    fakeDropNodeG: SVGGElement | undefined
) => {
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
    const layout = getCorrectLayoutByElement(targetComponent.node.origin);
    // 构造一条直线
    let linePoints = [
        [startLinePoint, y + height / 2],
        [endLinePoint, y + height / 2]
    ] as Point[];
    const strokeWidth = targetComponent.node.origin.linkLineWidth ? targetComponent.node.origin.linkLineWidth : STROKE_WIDTH;
    if (isIndentedLayout(layout)) {
        const hGap = BASE * 4;
        const vGap = BASE;
        const offsetX = hGap + strokeWidth;
        const offsetY = (vGap + strokeWidth) * 2;
        if (isLeftLayout(layout)) {
            fakeX = x - offsetX;
        }
        if (isRightLayout(layout)) {
            fakeX = x + width - offsetX;
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
