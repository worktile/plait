import { drawRectangleNode } from '../../draw/shape';
import { updateForeignObject } from '@plait/richtext';
import { BASE, PRIMARY_COLOR } from '../../constants';

import { MindElement, MindNode } from '../../interfaces';
import { MindNodeComponent } from '../../node.component';
import { getRectangleByNode } from '../position/node';
import { PlaitBoard, Point, drawRoundRectangle, createG, Path, PlaitNode } from '@plait/core';
import { MindQueries } from '../../queries';
import { isHorizontalLayout, MindLayoutType } from '@plait/layouts';
import { drawIndentedLink } from '../../draw/indented-link';
import { PlaitMindBoard } from '../../plugins/with-extend-mind';
import { getTopicRectangleByNode } from '../position/topic';
import { drawLogicLink } from '../../draw/link/logic-link';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../interfaces/types';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, moveYOfPoint, transformPlacement } from '../point-placement';

export const drawFakeDragNode = (board: PlaitBoard, activeComponent: MindNodeComponent, offsetX: number, offsetY: number) => {
    const dragFakeNodeG = createG();
    dragFakeNodeG.classList.add('dragging', 'fake-node', 'plait-board-attached');

    const fakeDraggingNode: MindNode = {
        ...activeComponent.node,
        children: [],
        x: activeComponent.node.x + offsetX,
        y: activeComponent.node.y + offsetY
    };
    const textRectangle = getTopicRectangleByNode(board as PlaitMindBoard, activeComponent.node);
    const fakeNodeG = drawRectangleNode(board, fakeDraggingNode);

    const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
    updateForeignObject(
        richtextG,
        textRectangle.width + BASE * 10,
        textRectangle.height,
        textRectangle.x + offsetX,
        textRectangle.y + offsetY
    );

    dragFakeNodeG?.append(fakeNodeG);
    dragFakeNodeG?.append(richtextG);
    return dragFakeNodeG;
};

export const drawFakeDropNodeByPath = (board: PlaitBoard, path: Path) => {
    const fakeDropNodeG = createG();
    const parent = PlaitNode.get(board, Path.parent(path)) as MindElement;
    const layout = MindQueries.getLayoutByElement(parent) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(layout);
    const hasPreviousNode = path[path.length - 1] !== 0;
    const hasNextNode = path[path.length - 1] !== (parent.children?.length || 0);
    const width = 30;
    const height = 12;
    let fakeNode: MindNode;

    if (!hasPreviousNode && !hasNextNode) {
    } else if (!hasPreviousNode && hasNextNode) {
    } else if (hasPreviousNode && !hasNextNode) {
    } else {
        const previousElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
        const previousNode = MindElement.getNode(previousElement);
        const previousRect = getRectangleByNode(previousNode);

        const nextElement = PlaitNode.get(board, path) as MindElement;
        const nextNode = MindElement.getNode(nextElement);
        const nextRect = getRectangleByNode(nextNode);

        const beginPlacement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.bottom];
        const endPlacement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.top];
        const linkDirection = getLayoutDirection(previousNode, isHorizontal);

        transformPlacement(beginPlacement, linkDirection);
        transformPlacement(endPlacement, linkDirection);

        const previousPoint = getPointByPlacement(previousRect, beginPlacement);
        const nextPoint = getPointByPlacement(nextRect, endPlacement);

        const centerPoint: Point = [(previousPoint[0] + nextPoint[0]) / 2, (previousPoint[1] + nextPoint[1]) / 2];

        let cornerPoint = centerPoint,
            oppositePoint = centerPoint;

        const offsetY = isHorizontal ? height : width;
        const offsetX = isHorizontal ? width : height;

        cornerPoint = moveYOfPoint(cornerPoint, -offsetY / 2, linkDirection);

        oppositePoint = moveYOfPoint(oppositePoint, offsetY / 2, linkDirection);
        oppositePoint = moveXOfPoint(oppositePoint, offsetX, linkDirection);

        const x = Math.min(cornerPoint[0], oppositePoint[0]);
        const y = Math.min(cornerPoint[1], oppositePoint[1]);

        fakeNode = {
            ...previousNode,
            x,
            y,
            width,
            height,
            hGap: 0,
            vGap: 0
        };
    }
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
    const link = MindElement.isIndentedLayout(parent)
        ? drawIndentedLink(board, MindElement.getNode(parent), fakeNode!)
        : drawLogicLink(board, fakeNode!, MindElement.getNode(parent), isHorizontal);

    fakeDropNodeG?.appendChild(link);
    fakeDropNodeG?.appendChild(fakeRectangleG);

    return fakeDropNodeG;
};
