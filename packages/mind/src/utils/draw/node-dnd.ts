import { drawRoundRectangleByNode } from './node-shape';
import { updateForeignObject } from '@plait/richtext';
import { BASE, PRIMARY_COLOR, STROKE_WIDTH } from '../../constants';
import { DetectResult, LayoutDirection, MindElement, MindNode, PlaitMind } from '../../interfaces';
import { MindNodeComponent } from '../../node.component';
import { getRectangleByNode } from '../position/node';
import { PlaitBoard, Point, drawRoundRectangle, createG, Path, PlaitNode, PlaitElement } from '@plait/core';
import { MindQueries } from '../../queries';
import { isHorizontalLayout, isIndentedLayout, isStandardLayout, isTopLayout, MindLayoutType } from '@plait/layouts';
import { getTopicRectangleByNode } from '../position/topic';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../interfaces/types';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, moveYOfPoint, transformPlacement } from '../point-placement';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { hasPreviousOrNextOfDropPath } from '../dnd/common';
import { drawLink } from './node-link/draw-link';
import { getEmojiForeignRectangle } from '../position/emoji';

export const drawFakeDragNode = (board: PlaitBoard, element: MindElement, offsetX: number, offsetY: number) => {
    const activeComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    const dragFakeNodeG = createG();
    dragFakeNodeG.classList.add('dragging', 'fake-node', 'plait-board-attached');

    const fakeDraggingNode: MindNode = {
        ...activeComponent.node,
        children: [],
        x: activeComponent.node.x + offsetX,
        y: activeComponent.node.y + offsetY
    };
    const textRectangle = getTopicRectangleByNode(board as PlaitMindBoard, activeComponent.node);
    const fakeNodeG = drawRoundRectangleByNode(board, fakeDraggingNode);

    const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
    updateForeignObject(richtextG, textRectangle.width, textRectangle.height, textRectangle.x + offsetX, textRectangle.y + offsetY);

    dragFakeNodeG?.append(fakeNodeG);
    dragFakeNodeG?.append(richtextG);

    // draw emojis
    if (MindElement.hasEmojis(element)) {
        const fakeEmojisG = (activeComponent.emojisDrawer.g as SVGGElement).cloneNode(true) as SVGGElement;
        const foreignRectangle = getEmojiForeignRectangle(board as PlaitMindBoard, element);
        updateForeignObject(
            fakeEmojisG,
            foreignRectangle.width,
            foreignRectangle.height,
            foreignRectangle.x + offsetX,
            foreignRectangle.y + offsetY
        );
        dragFakeNodeG?.append(fakeEmojisG);
    }
    return dragFakeNodeG;
};

export const drawFakeDropNode = (
    board: PlaitBoard,
    dropTarget: {
        target: MindElement;
        detectResult: DetectResult;
    },
    path: Path
) => {
    const target = dropTarget.target;
    const fakeDropNodeG = createG();
    const parent = PlaitNode.get(board, Path.parent(path)) as MindElement;
    const layout = MindQueries.getLayoutByElement(parent) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(layout);
    const { hasNextNode, hasPreviousNode } = hasPreviousOrNextOfDropPath(parent, dropTarget, path);

    const width = 30;
    const height = 12;
    let fakeNode: MindNode, centerPoint: Point, basicNode: MindNode, linkDirection: LayoutDirection;

    if (!hasPreviousNode && !hasNextNode) {
        const parentNode = MindElement.getNode(parent);
        const parentRect = getRectangleByNode(parentNode);

        linkDirection = getLayoutDirection(parentNode, isHorizontal);
        basicNode = parentNode;

        if (PlaitMind.isMind(target) && isStandardLayout(layout)) {
            if (dropTarget.detectResult === 'left') {
                linkDirection = LayoutDirection.left;
                basicNode.left = true;
            } else {
                linkDirection = LayoutDirection.right;
                basicNode.left = false;
            }
        }

        const placement: PointPlacement = [HorizontalPlacement.right, VerticalPlacement.middle];
        transformPlacement(placement, linkDirection);
        const parentCenterPoint = getPointByPlacement(parentRect, placement);

        if (isIndentedLayout(layout)) {
            const placement: PointPlacement = [
                HorizontalPlacement.center,
                isTopLayout(layout) ? VerticalPlacement.top : VerticalPlacement.bottom
            ];
            const parentCenterPoint = getPointByPlacement(parentRect, placement);

            centerPoint = moveXOfPoint(parentCenterPoint, height, linkDirection);
            centerPoint[1] = isTopLayout(layout) ? centerPoint[1] - height : centerPoint[1] + height;
        } else {
            centerPoint = moveXOfPoint(parentCenterPoint, width, linkDirection);
        }
    } else if (!hasPreviousNode && hasNextNode) {
        const nextElement = PlaitNode.get(board, path) as MindElement;
        basicNode = MindElement.getNode(nextElement);
        const nextRect = getRectangleByNode(basicNode);
        linkDirection = getLayoutDirection(basicNode, isHorizontal);

        const placement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.top];

        transformPlacement(placement, linkDirection);

        let offset = -height;
        if (MindElement.isIndentedLayout(parent)) {
            offset = isTopLayout(layout) ? offset / 2 + basicNode.height - basicNode.vGap : 0;
        }

        centerPoint = getPointByPlacement(nextRect, placement);
        centerPoint = moveYOfPoint(centerPoint, offset, linkDirection);
    } else if (hasPreviousNode && !hasNextNode) {
        const previousElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
        basicNode = MindElement.getNode(previousElement);
        const previousRect = getRectangleByNode(basicNode);
        linkDirection = getLayoutDirection(basicNode, isHorizontal);

        const placement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.bottom];

        transformPlacement(placement, linkDirection);

        let offset = height;
        if (MindElement.isIndentedLayout(parent)) {
            offset = isTopLayout(layout) ? -offset - (basicNode.height - basicNode.vGap) : offset;
        }
        centerPoint = getPointByPlacement(previousRect, placement);
        centerPoint = moveYOfPoint(centerPoint, offset, linkDirection);
    } else {
        const previousElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
        basicNode = MindElement.getNode(previousElement);
        const previousRect = getRectangleByNode(basicNode);

        const nextElement = PlaitNode.get(board, path) as MindElement;
        const nextNode = MindElement.getNode(nextElement);
        const nextRect = getRectangleByNode(nextNode);

        const beginPlacement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.bottom];
        const endPlacement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.top];
        linkDirection = getLayoutDirection(basicNode, isHorizontal);

        transformPlacement(beginPlacement, linkDirection);
        transformPlacement(endPlacement, linkDirection);

        const previousPoint = getPointByPlacement(previousRect, beginPlacement);
        const nextPoint = getPointByPlacement(nextRect, endPlacement);

        centerPoint = [(previousPoint[0] + nextPoint[0]) / 2, (previousPoint[1] + nextPoint[1]) / 2];
    }

    let cornerPoint = centerPoint,
        oppositePoint = centerPoint;

    const offsetY = isHorizontal ? height : width;
    const offsetX = isHorizontal ? width : height;

    cornerPoint = moveYOfPoint(cornerPoint, -offsetY / 2, linkDirection!);

    oppositePoint = moveYOfPoint(oppositePoint, offsetY / 2, linkDirection!);
    oppositePoint = moveXOfPoint(oppositePoint, offsetX, linkDirection!);

    const x = Math.min(cornerPoint[0], oppositePoint[0]);
    const y = Math.min(cornerPoint[1], oppositePoint[1]);

    fakeNode = {
        ...basicNode!,
        x,
        y,
        width,
        height,
        hGap: MindElement.isIndentedLayout(parent) ? BASE * 4 + (basicNode.origin.strokeWidth || STROKE_WIDTH) : 0,
        vGap: MindElement.isIndentedLayout(parent) ? BASE : 0
    };

    const fakeRectangleG = drawRoundRectangle(
        PlaitBoard.getRoughSVG(board),
        fakeNode!.x,
        fakeNode!.y,
        fakeNode!.x + width,
        fakeNode!.y + height,
        {
            stroke: PRIMARY_COLOR,
            strokeWidth: 2,
            fill: PRIMARY_COLOR,
            fillStyle: 'solid'
        }
    );

    const link = drawLink(board, MindElement.getNode(parent), fakeNode, isHorizontal, false, PRIMARY_COLOR, STROKE_WIDTH);
    fakeDropNodeG?.appendChild(link);
    fakeDropNodeG?.appendChild(fakeRectangleG);

    return fakeDropNodeG;
};
