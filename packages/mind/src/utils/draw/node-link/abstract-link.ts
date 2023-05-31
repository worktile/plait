import { PlaitBoard, getRectangleByElements } from '@plait/core';
import { MindNode } from '../../../interfaces/node';
import { getRectangleByNode } from '../../position/node';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../../interfaces/types';
import {
    getLayoutDirection,
    getPointByPlacement,
    getXDistanceBetweenPoint,
    moveXOfPoint,
    transformPlacement
} from '../../point-placement';
import { getAbstractBranchColor, getAbstractBranchWidth } from '../../node-style/branch';

export function drawAbstractLink(board: PlaitBoard, node: MindNode, isHorizontal: boolean) {
    const linkPadding = 15;
    const branchWidth = getAbstractBranchWidth(board, node.origin);
    const branchColor = getAbstractBranchColor(board, node.origin);
    const parent = node.parent;
    const abstractRectangle = getRectangleByNode(node);
    let includedElements = parent.children.slice(node.origin.start, node.origin.end! + 1).map(node => {
        return node.origin;
    });
    const includedElementsRectangle = getRectangleByElements(board, includedElements, true);

    const linkDirection = getLayoutDirection(node, isHorizontal);
    const bezierBeginPlacement = [HorizontalPlacement.right, VerticalPlacement.top] as PointPlacement;
    const bezierEndPlacement = [HorizontalPlacement.right, VerticalPlacement.bottom] as PointPlacement;
    const abstractConnectorPlacement = [HorizontalPlacement.left, VerticalPlacement.middle] as PointPlacement;

    transformPlacement(bezierBeginPlacement, linkDirection);
    transformPlacement(bezierEndPlacement, linkDirection);
    transformPlacement(abstractConnectorPlacement, linkDirection);

    let bezierBeginPoint = getPointByPlacement(includedElementsRectangle, bezierBeginPlacement);
    let bezierEndPoint = getPointByPlacement(includedElementsRectangle, bezierEndPlacement);
    let abstractConnectorPoint = getPointByPlacement(abstractRectangle, abstractConnectorPlacement);
    let curveDistance = getXDistanceBetweenPoint(abstractConnectorPoint, bezierBeginPoint, isHorizontal) - linkPadding * 2;
    bezierBeginPoint = moveXOfPoint(bezierBeginPoint, linkPadding, linkDirection);
    let c1 = moveXOfPoint(bezierBeginPoint, curveDistance, linkDirection);
    bezierEndPoint = moveXOfPoint(bezierEndPoint, linkPadding, linkDirection);
    let c2 = moveXOfPoint(bezierEndPoint, curveDistance, linkDirection);
    let bezierConnectorPoint = moveXOfPoint(abstractConnectorPoint, -linkPadding, linkDirection);

    const link = PlaitBoard.getRoughSVG(board).path(
        `M${bezierBeginPoint[0]},${bezierBeginPoint[1]} Q${c1[0]},${c1[1]} ${bezierConnectorPoint[0]},${bezierConnectorPoint[1]} Q${c2[0]},${c2[1]} ${bezierEndPoint[0]},${bezierEndPoint[1]} M${abstractConnectorPoint[0]},${abstractConnectorPoint[1]} L${bezierConnectorPoint[0]},${bezierConnectorPoint[1]}`,
        {
            stroke: branchColor,
            strokeWidth: branchWidth
        }
    );
    return link;
}
