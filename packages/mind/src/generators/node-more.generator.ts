import { PlaitBoard, Point, createG, createText, isSelectedElement, setStrokeLinecap } from '@plait/core';
import { MindElement, BaseData, PlaitMind, MindElementShape, LayoutDirection } from '../interfaces';
import { getRectangleByNode } from '../utils/position/node';
import { getShapeByElement } from '../utils/node-style/shape';
import { NODE_MORE_ICON_DIAMETER, NODE_MORE_LINE_DISTANCE, NODE_MORE_STROKE_WIDTH } from '../constants/default';
import { MindLayoutType, isHorizontalLayout, isIndentedLayout, isTopLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getBranchColorByMindElement } from '../utils/node-style/branch';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import { buildText, DEFAULT_FONT_FAMILY, Generator, measureElement } from '@plait/common';
import { getChildrenCount } from '../utils/mind';
import { FontSizes } from '@plait/text-plugins';

export interface NodeMoreExtraData {
    isSelected: boolean;
    isHovered?: boolean;
    isHoveredCollapseArea?: boolean;
    isHoveredExpandArea?: boolean;
    isShowCollapseAnimation?: boolean;
}

export class NodeMoreGenerator extends Generator<MindElement, NodeMoreExtraData> {
    static key = 'mind-node-more';

    canDraw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): boolean {
        if (
            !PlaitMind.isMind(element) &&
            element.children.length &&
            (extraData?.isSelected || extraData?.isHovered || extraData?.isHoveredCollapseArea || element.isCollapsed)
        ) {
            return true;
        }
        return false;
    }

    draw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): SVGGElement {
        const moreGContainer = createG();
        const stroke = getBranchColorByMindElement(this.board, element);
        const collapseOrExpandCenter = getCollapseOrExpandCenterPoint(this.board, element);
        const isDisplayCollapse =
            !element.isCollapsed &&
            (isSelectedElement(this.board, element) || !!extraData?.isHovered || !!extraData?.isHoveredCollapseArea);
        this.toggleCollapse(collapseOrExpandCenter, stroke, moreGContainer, isDisplayCollapse, !!extraData?.isShowCollapseAnimation);
        this.toggleExpandBadge(
            element,
            collapseOrExpandCenter,
            stroke,
            moreGContainer,
            !!element.isCollapsed,
            !!extraData?.isHoveredExpandArea
        );
        return moreGContainer;
    }

    collapsedIcon: SVGGElement | undefined | null;
    expandedIcon: SVGGElement | undefined | null;

    toggleCollapse(center: Point, stroke: string, parentG: SVGGElement, isDisplay: boolean, isAnimated: boolean) {
        this.collapsedIcon?.remove();
        if (!isDisplay) {
            return;
        }
        this.collapsedIcon = createG();
        this.collapsedIcon.classList.add('collapsed-icon');
        if (isAnimated) {
            this.collapsedIcon.classList.add('animated');
        }
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

    toggleExpandBadge(
        element: MindElement,
        center: Point,
        stroke: string,
        parentG: SVGGElement,
        isCollapsed: boolean,
        isHoveredExpandIcon: boolean
    ) {
        this.expandedIcon?.remove();
        if (!isCollapsed) {
            return;
        }
        this.expandedIcon = createG();
        this.expandedIcon.classList.add('expanded-icon');
        const badgeBackground = PlaitBoard.getRoughSVG(this.board).circle(center[0], center[1], NODE_MORE_ICON_DIAMETER, {
            fill: stroke,
            stroke,
            fillStyle: 'solid'
        });
        if (isHoveredExpandIcon) {
            console.log('isHoveredExpandIcon', isHoveredExpandIcon);
            badgeBackground.setAttribute('style', `opacity: 0.4`);
        } else {
            badgeBackground.setAttribute('style', `opacity: 0.2`);
        }
        const childrenCount = getChildrenCount(element);
        let text = `${childrenCount}`;
        if (childrenCount >= 99) {
            text = '...';
        }
        const { width, height } = measureElement(this.board, buildText(text), {
            fontSize: Number(FontSizes.fontSize12),
            fontFamily: DEFAULT_FONT_FAMILY
        });
        const badgeText = createText(center[0] - width / 2 + 0.5, center[1] + 4.5, stroke, `${text}`);
        badgeText.setAttribute('style', `font-size: ${Number(FontSizes.fontSize12)}px;`);
        // handle vertical alignment for ...
        if (childrenCount > 99) {
            badgeText.setAttribute('style', 'dominant-baseline: ideographic');
        }
        this.expandedIcon.appendChild(badgeBackground);
        this.expandedIcon.appendChild(badgeText);
        parentG.appendChild(this.expandedIcon);
    }
}

export const getCollapseOrExpandCenterPoint = (board: PlaitBoard, element: MindElement) => {
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
