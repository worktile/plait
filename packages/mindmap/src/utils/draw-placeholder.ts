import { RoughSVG } from 'roughjs/bin/svg';
import { PRIMARY_COLOR } from '../constants';
import { drawLink } from '../draw/link';
import { DetectResult, MindmapElement, MindmapNode } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { drawRoundRectangle, getRectangleByNode } from './graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { Point } from '@plait/core';
import { getCorrectLayoutByElement } from './layout';
import { isIndentedLayout, isRightLayout, MindmapLayoutType, isStandardLayout } from '@plait/layouts';
import { drawIndentedLink } from '../draw/indented-link';
import { isLeftLayout, isTopLayout } from '@plait/layouts';

export const drawPlaceholderDropNodeG = (
    dropTarget: { target: MindmapElement; detectResult: DetectResult },
    roughSVG: RoughSVG,
    fakeDropNodeG: SVGGElement | undefined
) => {
    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(dropTarget.target) as MindmapNodeComponent;
    const targetRect = getRectangleByNode(targetComponent.node);
    console.log(dropTarget.detectResult);
    if (dropTarget.detectResult && ['right', 'left'].includes(dropTarget.detectResult)) {
        // 含左侧布局（左、左下、左上）不允许拖拽到右侧
        const layout = getCorrectLayoutByElement(targetComponent.node.origin);
        if (isLeftLayout(layout) && dropTarget.detectResult === 'right') {
            return;
        }
        if (isRightLayout(layout) && dropTarget.detectResult === 'left') {
            return;
        }
        const lastChildNodeIndex = targetComponent.node.children.length - 1;
        const lastChildNode = targetComponent.node.children[lastChildNodeIndex];
        // 没有子节点就插到左右
        if (!lastChildNode) {
            drawStraightDropNodeG(targetRect, dropTarget.detectResult, targetComponent, roughSVG, fakeDropNodeG);
            return;
        }

        // 如果有子节点，那么就插入到最后一个节点的下方
        if (targetComponent.node.children.length > 0) {
            // 标准布局，根节点
            if (targetComponent.node.origin.isRoot && isStandardLayout(layout)) {
                const rightNodeCount = targetComponent.node.origin.rightNodeCount as number;
                if (dropTarget.detectResult === 'left') {
                    // 下一个节点将插入到正左
                    if (targetComponent.node.children.length === rightNodeCount) {
                        drawStraightDropNodeG(targetRect, dropTarget.detectResult, targetComponent, roughSVG, fakeDropNodeG);
                        return;
                    }
                }
                if (dropTarget.detectResult === 'right') {
                    const rightLastChildNodeIndex = rightNodeCount > 0 ? rightNodeCount - 1 : 0;
                    const rightLastChildNode = targetComponent.node.children[rightLastChildNodeIndex];
                    const rightLastChildRect = getRectangleByNode(rightLastChildNode);
                    const rightLastChildComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
                        dropTarget.target.children[rightLastChildNodeIndex]
                    ) as MindmapNodeComponent;
                    drawCurvePlaceholderDropNodeG(
                        rightLastChildRect,
                        'bottom',
                        lastChildNodeIndex,
                        rightLastChildComponent,
                        roughSVG,
                        targetComponent,
                        fakeDropNodeG
                    );
                    return;
                }
            }

            const lastChildRect = getRectangleByNode(lastChildNode);
            const lastChildComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(
                dropTarget.target.children[dropTarget.target.children.length - 1]
            ) as MindmapNodeComponent;

            drawCurvePlaceholderDropNodeG(
                lastChildRect,
                'bottom',
                lastChildNodeIndex,
                lastChildComponent,
                roughSVG,
                targetComponent,
                fakeDropNodeG
            );
            return;
        }
        drawStraightDropNodeG(targetRect, dropTarget.detectResult, targetComponent, roughSVG, fakeDropNodeG);
    }

    if (targetComponent.parent && dropTarget.detectResult && ['top', 'bottom'].includes(dropTarget.detectResult)) {
        const parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(targetComponent.parent.origin) as MindmapNodeComponent;
        let targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);
        const rightNodeCount = targetComponent.parent.origin.rightNodeCount as number;
        // 如果是标准布局根节点的左侧，需要调整 targetIndex
        if (parentComponent.node.origin.isRoot) {
            const parentLayout = getCorrectLayoutByElement(parentComponent.node.origin);
            if (isStandardLayout(parentLayout)) {
                // 左的第一个节点
                if (targetIndex === rightNodeCount) {
                    targetIndex = dropTarget.detectResult === 'top' ? 0 : 2;
                }
                // 右的最后一个节点
                else if (targetIndex === rightNodeCount - 1) {
                    targetIndex = dropTarget.detectResult === 'top' ? rightNodeCount - 1 : rightNodeCount + 1;
                }
            }
        }
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
    let startRectanglePoint = x + width + lineLength;
    let endRectanglePoint = x + lineLength + width + 30;
    if (detectResult === 'left') {
        startLinePoint = x - lineLength;
        endLinePoint = x;
        startRectanglePoint = x - lineLength - 30;
        endRectanglePoint = x - lineLength;
    }
    // 构造一条直线
    let linePoints = [
        [startLinePoint, y + height / 2],
        [endLinePoint, y + height / 2]
    ] as Point[];
    const lineSVGG = roughSVG.linearPath(linePoints, { stroke: PRIMARY_COLOR, strokeWidth: 2 });

    // 构造一个矩形框坐标
    let fakeRectangleG = drawRoundRectangle(roughSVG, startRectanglePoint, y + height / 2 - 6, endRectanglePoint, y + height / 2 - 6 + 12, {
        stroke: PRIMARY_COLOR,
        strokeWidth: 2,
        fill: PRIMARY_COLOR,
        fillStyle: 'solid'
    });
    fakeDropNodeG?.appendChild(lineSVGG);
    fakeDropNodeG?.appendChild(fakeRectangleG);
};
