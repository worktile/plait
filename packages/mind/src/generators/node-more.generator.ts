import {
    PlaitBoard,
    Point,
    createG,
    createText,
    getSelectedElements,
    isDragging,
    isMovingElements,
    isSelectedElement,
    isSelectionMoving,
    rgbaToHEX,
    setStrokeLinecap
} from '@plait/core';
import { MindElement, BaseData, PlaitMind, MindElementShape, LayoutDirection } from '../interfaces';
import { getRectangleByNode } from '../utils/position/node';
import { getShapeByElement } from '../utils/node-style/shape';
import {
    NODE_MORE_ICON_DIAMETER,
    NODE_MORE_LINE_DISTANCE,
    NODE_MORE_STROKE_WIDTH,
    NODE_ADD_CIRCLE_COLOR,
    NODE_ADD_INNER_CROSS_COLOR,
    NODE_ADD_HOVER_COLOR,
    NODE_MORE_BRIDGE_DISTANCE
} from '../constants/default';
import { MindLayoutType, isHorizontalLayout, isIndentedLayout, isTopLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getBranchColorByMindElement } from '../utils/node-style/branch';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import { buildText, DEFAULT_FONT_FAMILY, Generator, isResizing, measureElement, TRANSPARENT } from '@plait/common';
import { getChildrenCount } from '../utils/mind';
import { FontSizes } from '@plait/text-plugins';

export interface NodeMoreExtraData {
    isSelected: boolean;
    isHovered?: boolean;
    isHoveredCollapseArea?: boolean;
    isHoveredExpandArea?: boolean;
    isHoveredAddArea?: boolean;
    isShowCollapseAnimation?: boolean;
    isShowAddAnimation?: boolean;
}

export class NodeMoreGenerator extends Generator<MindElement, NodeMoreExtraData> {
    static key = 'mind-node-more';

    collapseOrAddG: SVGGElement | undefined | null;

    expandG: SVGGElement | undefined | null;

    canDraw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): boolean {
        if (
            ((extraData?.isHovered || extraData?.isHoveredCollapseArea || extraData?.isHoveredAddArea) && canHandleNodeMore(this.board)) ||
            (extraData?.isSelected && isLastSelectedMindElement(this.board, element) && canHandleNodeMore(this.board)) ||
            element.isCollapsed
        ) {
            return true;
        }
        return false;
    }

    draw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): SVGGElement {
        const moreGContainer = createG();
        const stroke = getBranchColorByMindElement(this.board, element);
        const layoutDirection = getNodeMoreLayoutDirection(this.board, element);
        const moreStartAndEnd = getMoreStartAndEnd(this.board, element, layoutDirection);
        const collapseOrExpandCenter = moveXOfPoint(moreStartAndEnd[1], NODE_MORE_ICON_DIAMETER / 2, layoutDirection);
        const hasChildren = element.children.length > 0;
        const isShowCollapseOrAdd =
            !element.isCollapsed &&
            (isSelectedElement(this.board, element) ||
                !!extraData?.isHovered ||
                !!extraData?.isHoveredCollapseArea ||
                !!extraData?.isHoveredAddArea);
        const isShowCollapse = isShowCollapseOrAdd && hasChildren && !PlaitMind.isMind(element);
        const isShowAdd = isShowCollapseOrAdd && !PlaitBoard.isReadonly(this.board);
        const addCenter =
            (isShowCollapseOrAdd && getAddCenterByCollapseOrExpandCenter(element, collapseOrExpandCenter, layoutDirection)) || null;
        this.toggleCollapseOrAdd(
            collapseOrExpandCenter,
            addCenter,
            stroke,
            moreGContainer,
            isShowCollapse,
            isShowAdd,
            !!extraData?.isHoveredAddArea,
            !!extraData?.isShowCollapseAnimation,
            !!extraData?.isShowAddAnimation
        );
        this.toggleExpandBadge(
            element,
            moreStartAndEnd,
            collapseOrExpandCenter,
            stroke,
            moreGContainer,
            !!element.isCollapsed,
            !!extraData?.isHoveredExpandArea
        );
        return moreGContainer;
    }

    toggleCollapseOrAdd(
        center: Point,
        addCenter: Point | null,
        stroke: string,
        parentG: SVGGElement,
        isShowCollapse: boolean,
        isShowAdd: boolean,
        isHoveredAddArea: boolean,
        isShowCollapseAnimation: boolean,
        isShowAddAnimation: boolean
    ) {
        this.collapseOrAddG?.remove();
        if (!isShowCollapse && !isShowAdd) {
            return;
        }
        this.collapseOrAddG = createG();
        if (isShowCollapse) {
            const collapseG = createG();
            this.collapseOrAddG.appendChild(collapseG);
            collapseG.classList.add('collapse-button');
            if (isShowCollapseAnimation) {
                collapseG.classList.add('animated');
            }
            const collapseCircle = PlaitBoard.getRoughSVG(this.board).circle(center[0], center[1], NODE_MORE_ICON_DIAMETER, {
                fill: '#fff',
                stroke,
                strokeWidth: NODE_MORE_STROKE_WIDTH,
                fillStyle: 'solid'
            });
            const start = moveXOfPoint(center, -NODE_MORE_BRIDGE_DISTANCE / 2);
            const end = moveXOfPoint(center, NODE_MORE_BRIDGE_DISTANCE / 2);
            const collapseLine = PlaitBoard.getRoughSVG(this.board).line(start[0], start[1], end[0], end[1], {
                fill: '#fff',
                stroke,
                strokeWidth: NODE_MORE_STROKE_WIDTH,
                fillStyle: 'solid'
            });
            collapseG.appendChild(collapseCircle);
            collapseG.appendChild(collapseLine);
            setStrokeLinecap(collapseLine, 'round');
        }
        if (isShowAdd && addCenter) {
            const addG = createG();
            this.collapseOrAddG.appendChild(addG);
            addG.classList.add('add-button');
            if (isShowAddAnimation) {
                addG.classList.add('animated');
            }
            const circle = PlaitBoard.getRoughSVG(this.board).circle(
                addCenter[0],
                addCenter[1],
                NODE_MORE_ICON_DIAMETER + NODE_MORE_STROKE_WIDTH,
                {
                    fill: isHoveredAddArea ? NODE_ADD_HOVER_COLOR : NODE_ADD_CIRCLE_COLOR,
                    stroke: TRANSPARENT,
                    fillStyle: 'solid'
                }
            );
            const hLineBeginPoint = [addCenter[0] - NODE_MORE_BRIDGE_DISTANCE / 2, addCenter[1]];
            const hLineEndPoint = [addCenter[0] + NODE_MORE_BRIDGE_DISTANCE / 2, addCenter[1]];
            const vLineBeginPoint = [addCenter[0], addCenter[1] - NODE_MORE_BRIDGE_DISTANCE / 2];
            const vLineEndPoint = [addCenter[0], addCenter[1] + NODE_MORE_BRIDGE_DISTANCE / 2];

            const innerCrossHLine = PlaitBoard.getRoughSVG(this.board).line(
                hLineBeginPoint[0],
                hLineBeginPoint[1],
                hLineEndPoint[0],
                hLineEndPoint[1],
                {
                    stroke: NODE_ADD_INNER_CROSS_COLOR,
                    strokeWidth: NODE_MORE_STROKE_WIDTH
                }
            );
            setStrokeLinecap(innerCrossHLine, 'round');
            const innerCrossVLine = PlaitBoard.getRoughSVG(this.board).line(
                vLineBeginPoint[0],
                vLineBeginPoint[1],
                vLineEndPoint[0],
                vLineEndPoint[1],
                {
                    stroke: NODE_ADD_INNER_CROSS_COLOR,
                    strokeWidth: NODE_MORE_STROKE_WIDTH
                }
            );
            setStrokeLinecap(innerCrossVLine, 'round');
            addG.appendChild(circle);
            addG.appendChild(innerCrossHLine);
            addG.appendChild(innerCrossVLine);
        }
        parentG.appendChild(this.collapseOrAddG);
    }

    toggleExpandBadge(
        element: MindElement,
        moreStartAndEnd: [Point, Point],
        center: Point,
        stroke: string,
        parentG: SVGGElement,
        isCollapsed: boolean,
        isHoveredExpandIcon: boolean
    ) {
        this.expandG?.remove();
        if (!isCollapsed) {
            return;
        }
        this.expandG = createG();
        this.expandG.classList.add('expanded-button');
        const endWithWidth = moreStartAndEnd[1];
        const moreLine = PlaitBoard.getRoughSVG(this.board).line(
            moreStartAndEnd[0][0],
            moreStartAndEnd[0][1],
            endWithWidth[0],
            endWithWidth[1],
            {
                fill: stroke,
                stroke,
                fillStyle: 'solid',
                strokeWidth: NODE_MORE_STROKE_WIDTH
            }
        );
        const backgroundColor = isHoveredExpandIcon ? rgbaToHEX(stroke, 0.4) : rgbaToHEX(stroke, 0.2);
        const badgeBackground = PlaitBoard.getRoughSVG(this.board).circle(
            center[0],
            center[1],
            NODE_MORE_ICON_DIAMETER + NODE_MORE_STROKE_WIDTH,
            {
                fill: backgroundColor,
                stroke: TRANSPARENT,
                fillStyle: 'solid'
            }
        );
        const childrenCount = getChildrenCount(element);
        let text = `${childrenCount}`;
        let y = center[1] + 4.5;
        if (childrenCount >= 99) {
            text = '...';
            y = center[1] + 1;
        }
        const { width, height } = measureElement(this.board, buildText(text), {
            fontSize: Number(FontSizes.fontSize12),
            fontFamily: DEFAULT_FONT_FAMILY
        });
        const badgeText = createText(center[0] - width / 2 + 0.5, y, stroke, `${text}`);
        badgeText.setAttribute('style', `font-size: ${Number(FontSizes.fontSize12)}px;`);
        this.expandG.appendChild(moreLine);
        this.expandG.appendChild(badgeBackground);
        this.expandG.appendChild(badgeText);
        parentG.appendChild(this.expandG);
    }
}

export const getCollapseAndAddCenterPoint = (board: PlaitBoard, element: MindElement) => {
    const layoutDirection = getNodeMoreLayoutDirection(board, element);
    const [startPoint, endPoint] = getMoreStartAndEnd(board, element, layoutDirection);
    const collapseCenter = moveXOfPoint(endPoint, NODE_MORE_ICON_DIAMETER / 2, layoutDirection);
    const addCenter = getAddCenterByCollapseOrExpandCenter(element, collapseCenter, layoutDirection);
    return { collapseCenter, addCenter };
};

export const getAddCenterByCollapseOrExpandCenter = (
    target: MindElement,
    collapseOrExpandCenter: Point,
    layoutDirection: LayoutDirection
) => {
    let addCenter = collapseOrExpandCenter;
    if (target.children?.length > 0 && !PlaitMind.isMind(target)) {
        addCenter = moveXOfPoint(addCenter, NODE_MORE_LINE_DISTANCE + NODE_MORE_ICON_DIAMETER, layoutDirection);
    }
    return addCenter;
};

export const getNodeMoreLayoutDirection = (board: PlaitBoard, element: MindElement) => {
    const node = MindElement.getNode(element);
    const layout = MindQueries.getLayoutByElement(element) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(layout);
    let layoutDirection = getLayoutDirection(node, isHorizontal);
    if (isIndentedLayout(layout)) {
        layoutDirection = isTopLayout(layout) ? LayoutDirection.top : LayoutDirection.bottom;
    }
    return layoutDirection;
};

export const getMoreStartAndEnd = (board: PlaitBoard, element: MindElement, linkLineDirection: LayoutDirection) => {
    const node = MindElement.getNode(element);
    const isUnderlineShape = getShapeByElement(board, element) === MindElementShape.underline;
    const nodeClient = getRectangleByNode(node);
    let placement: PointPlacement = [HorizontalPlacement.right, VerticalPlacement.middle];
    transformPlacement(placement, linkLineDirection);
    // underline shape and horizontal
    const layout = MindQueries.getLayoutByElement(element) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(layout);
    if (isHorizontal && isUnderlineShape && !element.isRoot) {
        placement[1] = VerticalPlacement.bottom;
    }
    let startPoint = getPointByPlacement(nodeClient, placement);
    const endPoint = moveXOfPoint(startPoint, NODE_MORE_LINE_DISTANCE, linkLineDirection);
    return [startPoint, endPoint] as [Point, Point];
};

export const isLastSelectedMindElement = (board: PlaitBoard, element: MindElement) => {
    const selectedElements = getSelectedElements(board);
    const selectedMindElements = selectedElements.filter((element) => MindElement.isMindElement(board, element)).reverse();
    return selectedMindElements[selectedMindElements.length - 1] === element;
};

export const canHandleNodeMore = (board: PlaitBoard) => {
    return !isResizing(board) && !isSelectionMoving(board) && !isDragging(board) && !isMovingElements(board);
};
