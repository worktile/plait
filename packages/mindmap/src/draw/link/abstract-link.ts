import { PlaitBoard, getRectangleByElements } from '@plait/core';
import { MindmapNode } from '../../interfaces/node';
import { getRectangleByNode } from '../../utils/graph';
import { GRAY_COLOR } from '../../constants/default';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../interfaces/types';
import { getLinkDirection, getPointByPlacement, movePoint, transformPlacement } from '../../utils/point-placement';

export function drawAbstractLink(board: PlaitBoard, node: MindmapNode, isHorizontal: boolean) {
    const linkPadding = 15;
    const parent = node.parent;
    const abstractRectangle = getRectangleByNode(node);
    let includedElements = parent.children.slice(node.origin.start, node.origin.end! + 1).map(node => {
        return node.origin;
    });
    const includedElementsRectangle = getRectangleByElements(board, includedElements, true);
    const linkDirection = getLinkDirection(node, isHorizontal);
    const bezierBeginPlacement = [HorizontalPlacement.right, VerticalPlacement.top] as PointPlacement;
    const bezierEndPlacement = [HorizontalPlacement.right, VerticalPlacement.bottom] as PointPlacement;
    const abstractConnectorPlacement = [HorizontalPlacement.left, VerticalPlacement.middle] as PointPlacement;
    transformPlacement(bezierBeginPlacement, linkDirection);
    transformPlacement(bezierEndPlacement, linkDirection);
    transformPlacement(abstractConnectorPlacement, linkDirection);
    let bezierBeginPoint = getPointByPlacement(includedElementsRectangle, bezierBeginPlacement);
    let bezierEndPoint = getPointByPlacement(includedElementsRectangle, bezierEndPlacement);
    let abstractConnectorPoint = getPointByPlacement(abstractRectangle, abstractConnectorPlacement);
    let curveDistance = 0
    if (isHorizontal) {
        curveDistance = Math.abs(abstractConnectorPoint[0] - bezierBeginPoint[0]) - linkPadding * 2;
    } else {
        curveDistance = Math.abs(abstractConnectorPoint[1] - bezierBeginPoint[1]) - linkPadding * 2;
    }
    bezierBeginPoint = movePoint(bezierBeginPoint, linkPadding, linkDirection);
    let c1 = movePoint(bezierBeginPoint, curveDistance, linkDirection);
    bezierEndPoint = movePoint(bezierEndPoint, linkPadding, linkDirection);
    let c2 = movePoint(bezierEndPoint, curveDistance, linkDirection);
    let bezierConnectorPoint = movePoint(abstractConnectorPoint, -linkPadding, linkDirection);
    const link = PlaitBoard.getRoughSVG(board).path(
        `M${bezierBeginPoint[0]},${bezierBeginPoint[1]} Q${c1[0]},${c1[1]} ${bezierConnectorPoint[0]},${bezierConnectorPoint[1]} Q${c2[0]},${c2[1]} ${bezierEndPoint[0]},${bezierEndPoint[1]} M${abstractConnectorPoint[0]},${abstractConnectorPoint[1]} L${bezierConnectorPoint[0]},${bezierConnectorPoint[1]}`,
        {
            stroke: GRAY_COLOR,
            strokeWidth: 2
        }
    );
    return link;
}
