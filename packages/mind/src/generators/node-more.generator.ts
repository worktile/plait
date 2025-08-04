import { PlaitBoard, Point, createG, isSelectedElement, setStrokeLinecap } from '@plait/core';
import { MindElement, BaseData, PlaitMind, MindElementShape, LayoutDirection } from '../interfaces';
import { getRectangleByNode } from '../utils/position/node';
import { getShapeByElement } from '../utils/node-style/shape';
import { NODE_MORE_ICON_DIAMETER, NODE_MORE_LINE_DISTANCE, NODE_MORE_STROKE_WIDTH } from '../constants/default';
import { MindLayoutType, isHorizontalLayout, isIndentedLayout, isTopLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getBranchColorByMindElement, getBranchWidthByMindElement } from '../utils/node-style/branch';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, moveYOfPoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import { Generator } from '@plait/common';

export interface NodeMoreExtraData {
    isSelected: boolean;
    isHovered?: boolean;
    isHoveredCollapsedIcon?: boolean;
}

export class NodeMoreGenerator extends Generator<MindElement, NodeMoreExtraData> {
    static key = 'mind-node-more';

    canDraw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): boolean {
        if (
            !PlaitMind.isMind(element) &&
            element.children.length &&
            (extraData?.isSelected || extraData?.isHovered || extraData?.isHoveredCollapsedIcon)
        ) {
            return true;
        }
        return false;
    }

    draw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): SVGGElement {
        const moreGContainer = createG();
        const stroke = getBranchColorByMindElement(this.board, element);
        const collapsedIconCenter = getCollapsedCenterPoint(this.board, element);
        const isDisplayCollapsedIcon =
            !element.isCollapsed &&
            (isSelectedElement(this.board, element) || !!extraData?.isHovered || !!extraData?.isHoveredCollapsedIcon);
        this.toggleCollapsedIcon(collapsedIconCenter, stroke, moreGContainer, isDisplayCollapsedIcon);
        // this.toggleExpandedBadge(collapsedIconCenter, stroke, moreGContainer, !!element.isCollapsed);
        return moreGContainer;
    }

    collapsedIcon: SVGGElement | undefined | null;

    toggleCollapsedIcon(center: Point, stroke: string, parentG: SVGGElement, isDisplay: boolean) {
        this.collapsedIcon?.remove();
        if (!isDisplay) {
            return;
        }
        this.collapsedIcon = createG();
        const collapsedIconCircle = PlaitBoard.getRoughSVG(this.board).circle(center[0], center[1], NODE_MORE_ICON_DIAMETER, {
            fill: '#fff',
            stroke,
            strokeWidth: NODE_MORE_STROKE_WIDTH,
            fillStyle: 'solid'
        });
        const start = moveXOfPoint(center, -NODE_MORE_ICON_DIAMETER / 4);
        const end = moveXOfPoint(center, NODE_MORE_ICON_DIAMETER / 4);
        const collapsedIconLine = PlaitBoard.getRoughSVG(this.board).line(start[0], start[1], end[0], end[1], {
            fill: '#fff',
            stroke,
            strokeWidth: NODE_MORE_STROKE_WIDTH,
            fillStyle: 'solid'
        });
        this.collapsedIcon.appendChild(collapsedIconCircle);
        this.collapsedIcon.appendChild(collapsedIconLine);
        setStrokeLinecap(collapsedIconLine, 'round');
        parentG.appendChild(this.collapsedIcon);
    }

    collapsedIconBadge: SVGGElement | undefined | null;

    toggleExpandedBadge(center: Point, stroke: string, parentG: SVGGElement, isCollapsed: boolean) {
        if (!isCollapsed) {
            this.collapsedIconBadge?.remove();
            return;
        }
        this.collapsedIconBadge = createG();
        const badgeBackground = PlaitBoard.getRoughSVG(this.board).circle(center[0], center[1], NODE_MORE_ICON_DIAMETER, {
            fill: stroke,
            stroke,
            fillStyle: 'solid'
        });
        this.collapsedIconBadge.appendChild(badgeBackground);
        parentG.appendChild(this.collapsedIconBadge);
    }
}

export const getCollapsedCenterPoint = (board: PlaitBoard, element: MindElement) => {
    const node = MindElement.getNode(element);
    const layout = MindQueries.getLayoutByElement(element) as MindLayoutType;
    const isUnderlineShape = getShapeByElement(board, element) === MindElementShape.underline;
    const isHorizontal = isHorizontalLayout(layout);
    const nodeClient = getRectangleByNode(node);
    let linkDirection = getLayoutDirection(node, isHorizontal);
    if (isIndentedLayout(layout)) {
        linkDirection = isTopLayout(layout) ? LayoutDirection.top : LayoutDirection.bottom;
    }
    let placement: PointPlacement = [HorizontalPlacement.right, VerticalPlacement.middle];
    transformPlacement(placement, linkDirection);
    // underline shape and horizontal
    if (isHorizontal && isUnderlineShape && !element.isRoot) {
        placement[1] = VerticalPlacement.bottom;
    }
    let startPoint = getPointByPlacement(nodeClient, placement);
    const endPoint = moveXOfPoint(startPoint, NODE_MORE_LINE_DISTANCE, linkDirection);
    return moveXOfPoint(endPoint, NODE_MORE_ICON_DIAMETER / 2, linkDirection);
};
