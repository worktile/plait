import { BASE, PRIMARY_COLOR, STROKE_WIDTH } from '../../constants';
import { drawLink } from '../../draw/link';
import { DetectResult, MindElement, MindNode } from '../../interfaces';
import { MindNodeComponent } from '../../node.component';
import { getRectangleByNode } from '../graph';
import { PlaitBoard, PlaitElement, Point, drawRoundRectangle } from '@plait/core';
import { MindQueries } from '../../queries';
import {
    getNonAbstractChildren,
    isBottomLayout,
    isHorizontalLayout,
    isHorizontalLogicLayout,
    isIndentedLayout,
    isRightLayout,
    isVerticalLogicLayout,
    MindLayoutType
} from '@plait/layouts';
import { drawIndentedLink } from '../../draw/indented-link';
import { isLeftLayout, isTopLayout } from '@plait/layouts';
import { isStandardLayout } from '@plait/layouts';
import { isMixedLayout } from '../layout';

export const drawPlaceholderDropNodeG = (
    board: PlaitBoard,
    dropTarget: { target: MindElement; detectResult: DetectResult },
    fakeDropNodeG: SVGGElement | undefined
) => {
    const targetComponent = PlaitElement.getComponent(dropTarget.target) as MindNodeComponent;
    const targetRect = getRectangleByNode(targetComponent.node);
    if (dropTarget.detectResult && ['right', 'left'].includes(dropTarget.detectResult)) {
        drawStraightDropNodeG(board, targetRect, dropTarget.detectResult, targetComponent, fakeDropNodeG);
    }
    const targetParent = MindElement.findParent(targetComponent.element);
    if (targetParent && dropTarget.detectResult && ['top', 'bottom'].includes(dropTarget.detectResult)) {
        const parentComponent = PlaitElement.getComponent(targetParent) as MindNodeComponent;
        const targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);
        drawCurvePlaceholderDropNodeG(
            board,
            targetRect,
            dropTarget.detectResult,
            targetIndex,
            targetComponent,
            parentComponent,
            fakeDropNodeG
        );
    }
};

export const drawCurvePlaceholderDropNodeG = (
    board: PlaitBoard,
    targetRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    detectResult: DetectResult,
    targetIndex: number,
    targetComponent: MindNodeComponent,
    parentComponent: MindNodeComponent,
    fakeDropNodeG: SVGGElement | undefined
) => {
    const parentNodeLayout = MindQueries.getCorrectLayoutByElement(board, parentComponent.node.origin);
    const layout = MindQueries.getCorrectLayoutByElement(board, targetComponent.node.parent.origin);
    const strokeWidth = targetComponent.node.origin.branchWidth ? targetComponent.node.origin.branchWidth : STROKE_WIDTH;
    let fakeX = targetComponent.node.x,
        fakeY = targetRect.y - 30,
        fakeRectangleStartX = targetRect.x,
        fakeRectangleEndX = targetRect.x + 30,
        fakeRectangleStartY = fakeY,
        fakeRectangleEndY = fakeRectangleStartY + 12,
        width = 30;

    if (isLeftLayout(layout)) {
        fakeX = targetComponent.node.x + targetComponent.node.width - 30;
        fakeRectangleStartX = targetRect.x + targetRect.width - 30;
        fakeRectangleEndX = targetRect.x + targetRect.width;
    }
    if (isHorizontalLogicLayout(parentNodeLayout)) {
        fakeY = getHorizontalFakeY(detectResult as 'top' | 'bottom', targetIndex, parentComponent.node, targetRect, layout, fakeY);
        if (isStandardLayout(parentNodeLayout)) {
            const rightNodeCount = parentComponent.node.origin.rightNodeCount || 0;
            const idx = parentComponent.node.children.findIndex(x => x === targetComponent.node);
            const isLeft = idx >= rightNodeCount;
            // 标准布局的左，需要调整 x
            if (isLeft) {
                fakeX = targetComponent.node.x + targetComponent.node.width - 30;
                fakeRectangleStartX = targetRect.x + targetRect.width - 30;
                fakeRectangleEndX = targetRect.x + targetRect.width;
            }
            const isLeftFirst = idx === rightNodeCount;
            const isRightLast = idx === rightNodeCount - 1;
            // 拖拽至左第一个节点的情况
            if (detectResult === 'top' && isLeftFirst) {
                fakeY = targetRect.y - targetRect.height;
            }
            if (detectResult === 'bottom' && isRightLast) {
                fakeY = targetRect.y + targetRect.height + 30;
            }
        }
        fakeRectangleStartY = fakeY;
        fakeRectangleEndY = fakeRectangleStartY + 12;
    }

    if (isVerticalLogicLayout(layout)) {
        parentComponent = targetComponent;
        targetComponent = PlaitElement.getComponent(MindElement.getParent(targetComponent.element)) as MindNodeComponent;
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
                    const nextComponent = PlaitElement.getComponent(
                        parentComponent.node.origin.children[targetIndex + 1]
                    ) as MindNodeComponent;
                    const nextRect = getRectangleByNode(nextComponent.node);
                    fakeY = targetRect.y - Math.abs((nextRect.y + nextRect.height - targetRect.y) / 2);
                }
            }
            if (detectResult === 'bottom') {
                const isFirstNode = targetIndex === 0;
                if (isFirstNode) {
                    const parentRect = getRectangleByNode(parentComponent.node);
                    fakeY = parentRect.y - parentRect.height / 2 - BASE;
                } else {
                    const previousComponent = PlaitElement.getComponent(
                        parentComponent.node.origin.children[targetIndex + 1]
                    ) as MindNodeComponent;
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
    const fakeNode: MindNode = { ...targetComponent.node, x: fakeX, y: fakeY, width, height: 12 };
    const linkSVGG = isIndentedLayout(layout)
        ? drawIndentedLink(board, parentComponent.node, fakeNode, PRIMARY_COLOR, false)
        : drawLink(board, parentComponent.node, fakeNode, PRIMARY_COLOR, isHorizontalLayout(layout), false);
    // 构造一个矩形框坐标
    const fakeRectangleG = drawRoundRectangle(
        PlaitBoard.getRoughSVG(board),
        fakeRectangleStartX,
        fakeRectangleStartY,
        fakeRectangleEndX,
        fakeRectangleEndY,
        {
            stroke: PRIMARY_COLOR,
            strokeWidth: 2,
            fill: PRIMARY_COLOR,
            fillStyle: 'solid'
        }
    );
    fakeDropNodeG?.appendChild(linkSVGG);
    fakeDropNodeG?.appendChild(fakeRectangleG);
};

export const drawStraightDropNodeG = (
    board: PlaitBoard,
    targetRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    detectResult: DetectResult,
    targetComponent: MindNodeComponent,
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
    const strokeWidth = targetComponent.node.origin.branchWidth ? targetComponent.node.origin.branchWidth : STROKE_WIDTH;
    const pointOptions = {
        fakeX,
        fakeY,
        x,
        y,
        width,
        height,
        strokeWidth
    };
    const parentLayout = MindQueries.getCorrectLayoutByElement(
        board,
        targetComponent.node.origin.isRoot ? targetComponent.node.origin : targetComponent.node.parent.origin
    );
    const layout = MindQueries.getCorrectLayoutByElement(board, targetComponent.node.origin);
    if (!isMixedLayout(parentLayout, layout)) {
        // 构造一条直线
        let linePoints = [
            [startLinePoint, y + height / 2],
            [endLinePoint, y + height / 2]
        ] as Point[];
        if (isIndentedLayout(parentLayout)) {
            const fakePoint = getIndentedFakePoint(parentLayout, pointOptions);
            drawIndentNodeG(board, fakeDropNodeG as SVGGElement, fakePoint, targetComponent.node);
            return;
        } else if (isVerticalLogicLayout(parentLayout)) {
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
                const parentComponent = PlaitElement.getComponent(MindElement.getParent(targetComponent.element)) as MindNodeComponent;
                const targetIndex = parentComponent.node.origin.children.indexOf(targetComponent.node.origin);

                if (detectResult === 'left') {
                    let offsetX = 0;
                    const isFirstNode = targetIndex === 0;
                    if (isFirstNode) {
                        offsetX = parentComponent.node.origin.isRoot ? BASE * 8 : BASE * 3 + strokeWidth / 2;
                    } else {
                        const previousComponent = PlaitElement.getComponent(
                            parentComponent.node.origin.children[targetIndex - 1]
                        ) as MindNodeComponent;
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
                        const nextComponent = PlaitElement.getComponent(
                            parentComponent.node.origin.children[targetIndex + 1]
                        ) as MindNodeComponent;
                        const nextRect = getRectangleByNode(nextComponent.node);
                        const space = nextRect.x - (targetRect.x + targetRect.width);
                        offsetX = space / 2;
                    }
                    fakeX = targetRect.x + width + offsetX - width / 2 - Math.ceil(strokeWidth / 2);
                }
                startRectanglePointX = fakeX;
                if (isTopLayout(parentLayout)) {
                    // 因为矩形是从左上角为起点向下画的，所以需要向上偏移一个矩形的高度（-12）
                    startRectanglePointY = fakeY + height + targetComponent.node.vGap - 12;
                }
                if (isBottomLayout(parentLayout)) {
                    startRectanglePointY = fakeY + targetComponent.node.vGap;
                }
                endRectanglePointX = startRectanglePointX + 30;
                endRectanglePointY = startRectanglePointY + 12;
                const fakeNode: MindNode = { ...targetComponent.node, x: fakeX, y: fakeY, width: 30 };
                const linkSVGG = drawLink(board, parentComponent.node, fakeNode, PRIMARY_COLOR, false, false);
                fakeDropNodeG?.appendChild(linkSVGG);
            }
        } else {
            let linkSVGG = PlaitBoard.getRoughSVG(board).linearPath(linePoints, { stroke: PRIMARY_COLOR, strokeWidth });
            fakeDropNodeG?.appendChild(linkSVGG);
        }
        // 构造一个矩形框坐标
        let fakeRectangleG = drawRoundRectangle(
            PlaitBoard.getRoughSVG(board),
            startRectanglePointX,
            startRectanglePointY,
            endRectanglePointX,
            endRectanglePointY,
            {
                stroke: PRIMARY_COLOR,
                strokeWidth: 2,
                fill: PRIMARY_COLOR,
                fillStyle: 'solid'
            }
        );

        fakeDropNodeG?.appendChild(fakeRectangleG);
    } else {
        // 混合布局画线逻辑
        if (isHorizontalLogicLayout(parentLayout)) {
            if (isIndentedLayout(layout)) {
                const fakePoint = getIndentedFakePoint(layout, pointOptions);
                drawIndentNodeG(board, fakeDropNodeG as SVGGElement, fakePoint, targetComponent.node);
                return;
            }
        }
    }
};

export const getHorizontalFakeY = (
    detectResult: 'top' | 'bottom',
    targetIndex: number,
    parentNode: MindNode,
    targetRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    layout: MindLayoutType,
    fakeY: number
) => {
    const childrenLength = getNonAbstractChildren(parentNode).length;

    if (detectResult === 'top') {
        if (targetIndex === 0 && isTopLayout(layout)) {
            fakeY = targetRect.y + targetRect.height;
        }
        if (targetIndex > 0) {
            const previousComponent = PlaitElement.getComponent(parentNode.origin.children[targetIndex - 1]) as MindNodeComponent;
            const previousRect = getRectangleByNode(previousComponent.node);
            const topY = previousRect.y + previousRect.height;
            fakeY = topY + (targetRect.y - topY) / 5;
        }
    }
    if (detectResult === 'bottom') {
        fakeY = targetRect.y + targetRect.height + 30;
        if (targetIndex < childrenLength - 1) {
            const nextComponent = PlaitElement.getComponent(parentNode.origin.children[targetIndex + 1]) as MindNodeComponent;
            const nextRect = getRectangleByNode(nextComponent.node);
            const topY = targetRect.y + targetRect.height;
            fakeY = topY + (nextRect.y - topY) / 5;
        }
        if (targetIndex === childrenLength - 1) {
            fakeY = targetRect.y + targetRect.height + 30;
        }
    }
    return fakeY;
};

export const getIndentedFakePoint = (
    layout: MindLayoutType,
    pointOptions: {
        fakeX: number;
        fakeY: number;
        x: number;
        y: number;
        width: number;
        height: number;
        strokeWidth: number;
    }
) => {
    let { fakeX, fakeY, x, y, width, height, strokeWidth } = pointOptions;
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
    return { fakeX, fakeY };
};

export const drawIndentNodeG = (
    board: PlaitBoard,
    fakeDropNodeG: SVGGElement,
    fakePoint: { fakeX: number; fakeY: number },
    node: MindNode
) => {
    const { fakeX, fakeY } = fakePoint;
    const fakeNode: MindNode = { ...node, x: fakeX, y: fakeY, width: 30, height: 12 };
    const linkSVGG = drawIndentedLink(board, node, fakeNode, PRIMARY_COLOR, false);

    const startRectanglePointX = fakeX,
        startRectanglePointY = fakeY,
        endRectanglePointX = fakeX + 30,
        endRectanglePointY = fakeY + 12;
    const fakeRectangleG = drawRoundRectangle(
        PlaitBoard.getRoughSVG(board),
        startRectanglePointX,
        startRectanglePointY,
        endRectanglePointX,
        endRectanglePointY,
        {
            stroke: PRIMARY_COLOR,
            strokeWidth: 2,
            fill: PRIMARY_COLOR,
            fillStyle: 'solid'
        }
    );
    fakeDropNodeG?.appendChild(linkSVGG);
    fakeDropNodeG?.appendChild(fakeRectangleG);
};
