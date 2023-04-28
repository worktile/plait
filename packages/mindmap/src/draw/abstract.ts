import { drawAbstractRoundRectangle, createG, getRectangleByElements, PlaitBoard } from '@plait/core';
import { ABSTRACT_HANDLE_COLOR, ABSTRACT_HANDLE_LENGTH, ABSTRACT_INCLUDED_OUTLINE_OFFSET, PRIMARY_COLOR } from '../constants';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNode } from '../interfaces';
import { MindmapLayoutType, isHorizontalLayout } from '@plait/layouts';
import { MindmapQueries } from '../queries';
import { getLayoutDirection, getPointByPlacement, movePoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';

export function drawAbstractIncludedOutline(board: PlaitBoard, roughSVG: RoughSVG, parent: MindmapNode, node: MindmapNode) {
    const abstractIncludedG = createG();
    let rectangle: SVGGElement;

    const element = node.origin;
    const nodeLayout = MindmapQueries.getCorrectLayoutByElement(element) as MindmapLayoutType;
    const isHorizontal = isHorizontalLayout(nodeLayout);

    const includedOrigin = parent.children.slice(element.start!, element.end! + 1).map(element => {
        return element.origin;
    });
    let { x, y, width, height } = getRectangleByElements(board, includedOrigin, true);

    x -= ABSTRACT_INCLUDED_OUTLINE_OFFSET;
    y -= ABSTRACT_INCLUDED_OUTLINE_OFFSET;
    width += ABSTRACT_INCLUDED_OUTLINE_OFFSET * 2;
    height += ABSTRACT_INCLUDED_OUTLINE_OFFSET * 2;

    rectangle = drawAbstractRoundRectangle(roughSVG, x, y, x + width, y + height, isHorizontal, {
        stroke: PRIMARY_COLOR,
        strokeWidth: 1,
        fillStyle: 'solid'
    });

    const handleOptions = {
        stroke: ABSTRACT_HANDLE_COLOR,
        strokeWidth: 3,
        fillStyle: 'solid'
    };

    const startPlacement = [HorizontalPlacement.center, VerticalPlacement.top] as PointPlacement;
    const endPlacement = [HorizontalPlacement.center, VerticalPlacement.bottom] as PointPlacement;

    const linkDirection = getLayoutDirection(node, isHorizontal);

    transformPlacement(startPlacement, linkDirection);
    transformPlacement(endPlacement, linkDirection);

    const rect = { x, y, width, height };
    let startCenterPoint = getPointByPlacement(rect, startPlacement);
    let endCenterPoint = getPointByPlacement(rect, endPlacement);

    const startPoint1 = movePoint(startCenterPoint, -ABSTRACT_HANDLE_LENGTH / 2, linkDirection);
    const startPoint2 = movePoint(startCenterPoint, ABSTRACT_HANDLE_LENGTH / 2, linkDirection);

    const endPoint1 = movePoint(endCenterPoint, -ABSTRACT_HANDLE_LENGTH / 2, linkDirection);
    const endPoint2 = movePoint(endCenterPoint, ABSTRACT_HANDLE_LENGTH / 2, linkDirection);

    const startHandle = roughSVG.line(startPoint1[0], startPoint1[1], startPoint2[0], startPoint2[1], handleOptions);
    const endHandle = roughSVG.line(endPoint1[0], endPoint1[1], endPoint2[0], endPoint2[1], handleOptions);

    abstractIncludedG.append(startHandle);
    abstractIncludedG.append(endHandle);
    abstractIncludedG.append(rectangle);

    return abstractIncludedG;
}
