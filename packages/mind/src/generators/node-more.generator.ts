import {
    Direction,
    PlaitBoard,
    Point,
    RectangleClient,
    createG,
    createText,
    getSelectedElements,
    isDragging,
    isMovingElements,
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
import { getLayoutDirection, getPointByPlacement, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import {
    buildText,
    DEFAULT_FONT_FAMILY,
    Generator,
    isResizing,
    measureElement,
    moveXOfPoint,
    moveYOfPoint,
    TRANSPARENT
} from '@plait/common';
import { getChildrenCount } from '../utils/mind';
import { FontSizes } from '@plait/text-plugins';

export interface NodeMoreExtraData {
    isSelected: boolean;
    isHit?: boolean;
    isHitAwarenessRectangle?: boolean | null;
    isHitCollapseArea?: boolean;
    isHitExpandArea?: boolean;
    isHitAddArea?: boolean;
    isShowCollapseAnimation?: boolean;
    isShowAddAnimation?: boolean;
    isHitStandardLeftAddArea?: boolean;
    isHitStandardLeftAwarenessRectangle?: boolean;
}

export class NodeMoreGenerator extends Generator<MindElement, NodeMoreExtraData> {
    static key = 'mind-node-more';

    collapseOrAddG: SVGGElement | undefined | null;

    expandG: SVGGElement | undefined | null;

    canDraw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): boolean {
        const selectedElements = getSelectedElements(this.board);
        if (
            ((extraData?.isHit || extraData?.isHitAwarenessRectangle || extraData?.isHitStandardLeftAwarenessRectangle) &&
                canHandleNodeMore(this.board)) ||
            (extraData?.isSelected && selectedElements.length === 1 && canHandleNodeMore(this.board)) ||
            element.isCollapsed
        ) {
            return true;
        }
        return false;
    }

    draw(element: MindElement<BaseData>, extraData: NodeMoreExtraData): SVGGElement {
        const moreGContainer = createG();
        const stroke = getBranchColorByMindElement(this.board, element);
        const {
            startPoint,
            endPoint,
            hasCollapsedIcon,
            hasExpandedIcon,
            hasAddIcon,
            collapsedIconCenter,
            expandedIconCenter,
            addCenter,
            hasLeftAddIcon,
            standardRef
        } = getNodeMoreKeyPosition(this.board, element);
        this.toggleCollapseAndAdd(
            collapsedIconCenter!,
            addCenter,
            standardRef?.addCenter,
            stroke,
            moreGContainer,
            hasCollapsedIcon,
            hasAddIcon,
            hasLeftAddIcon,
            !!extraData?.isHitAddArea,
            !!extraData?.isHitStandardLeftAddArea,
            !!extraData?.isShowCollapseAnimation,
            !!extraData?.isShowAddAnimation
        );
        this.toggleExpandBadge(
            element,
            [startPoint, endPoint],
            expandedIconCenter!,
            stroke,
            moreGContainer,
            !!hasExpandedIcon,
            !!extraData?.isHitExpandArea
        );
        return moreGContainer;
    }

    toggleCollapseAndAdd(
        center: Point,
        addCenter: Point | null,
        standardLeftAddCenter: Point | null | undefined,
        stroke: string,
        parentG: SVGGElement,
        isShowCollapse: boolean,
        isShowAdd: boolean,
        isShowStandardLeftAdd: boolean,
        isHitAddArea: boolean,
        isHitStandardLeftAdd: boolean,
        isShowCollapseAnimation: boolean,
        isShowAddAnimation: boolean
    ) {
        this.collapseOrAddG?.remove();
        if (!isShowCollapse && !isShowAdd && !isShowStandardLeftAdd) {
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
        const createAddIcon = (collapseOrAddG: SVGGElement, addCenter: Point, isHit: boolean) => {
            const addG = createG();
            collapseOrAddG.appendChild(addG);
            addG.classList.add('add-button');
            if (isShowAddAnimation) {
                addG.classList.add('animated');
            }
            const circle = PlaitBoard.getRoughSVG(this.board).circle(
                addCenter[0],
                addCenter[1],
                NODE_MORE_ICON_DIAMETER + NODE_MORE_STROKE_WIDTH,
                {
                    fill: isHit ? NODE_ADD_HOVER_COLOR : NODE_ADD_CIRCLE_COLOR,
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
        };
        if (isShowAdd && addCenter) {
            createAddIcon(this.collapseOrAddG, addCenter, isHitAddArea);
        }
        if (isShowStandardLeftAdd && standardLeftAddCenter) {
            createAddIcon(this.collapseOrAddG, standardLeftAddCenter, isHitStandardLeftAdd);
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
        const badgeText = createText(center[0] - width / 2, y, stroke, `${text}`);
        badgeText.setAttribute('style', `font-size: ${Number(FontSizes.fontSize12)}px;`);
        this.expandG.appendChild(moreLine);
        this.expandG.appendChild(badgeBackground);
        this.expandG.appendChild(badgeText);
        parentG.appendChild(this.expandG);
    }
}

export const getNodeMoreKeyPosition = (board: PlaitBoard, element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const hasLeftAddIcon = isMind && element.layout === MindLayoutType.standard;
    const layoutDirection = getNodeMoreLayoutDirection(board, element);
    const startPoint = getNodeMoreStartPoint(board, element, layoutDirection);
    const endPoint = moveXOfPoint(startPoint, NODE_MORE_LINE_DISTANCE, layoutDirection as unknown as Direction);
    const hasCollapsedIcon = element.children?.length > 0 && !isMind && !element.isCollapsed;
    const hasExpandedIcon = element.children?.length > 0 && !isMind && element.isCollapsed;
    const hasAddIcon = !hasExpandedIcon;
    const firstIconCenter = moveXOfPoint(endPoint, NODE_MORE_ICON_DIAMETER / 2, layoutDirection as unknown as Direction);
    const collapsedIconCenter = hasCollapsedIcon ? firstIconCenter : null;
    const expandedIconCenter = hasExpandedIcon ? firstIconCenter : null;
    let addCenter = null;
    if (hasAddIcon) {
        addCenter = hasCollapsedIcon
            ? moveXOfPoint(firstIconCenter, NODE_MORE_LINE_DISTANCE + NODE_MORE_ICON_DIAMETER, layoutDirection as unknown as Direction)
            : firstIconCenter;
    }
    let awarenessRectangle = null;
    if (hasAddIcon) {
        const addIconEndPoint = moveXOfPoint(addCenter!, NODE_MORE_ICON_DIAMETER / 2, layoutDirection as unknown as Direction);
        awarenessRectangle = RectangleClient.getRectangleByPoints([
            moveYOfPoint(startPoint, -NODE_MORE_ICON_DIAMETER / 2, layoutDirection as unknown as Direction),
            moveYOfPoint(addIconEndPoint, NODE_MORE_ICON_DIAMETER / 2, layoutDirection as unknown as Direction)
        ]);
    } else if (hasExpandedIcon) {
        const expandedIconEndPoint = moveXOfPoint(
            expandedIconCenter!,
            NODE_MORE_ICON_DIAMETER / 2,
            layoutDirection as unknown as Direction
        );
        awarenessRectangle = RectangleClient.getRectangleByPoints([
            moveYOfPoint(startPoint, -NODE_MORE_ICON_DIAMETER / 2, layoutDirection as unknown as Direction),
            moveYOfPoint(expandedIconEndPoint, NODE_MORE_ICON_DIAMETER / 2, layoutDirection as unknown as Direction)
        ]);
    }

    let standardRef: { addCenter: Point; awarenessRectangle: RectangleClient } | null = null;
    if (hasLeftAddIcon) {
        const leftStartPoint = getNodeMoreStartPoint(board, element, layoutDirection, true);
        const leftAddCenter = [leftStartPoint[0] - NODE_MORE_LINE_DISTANCE - NODE_MORE_ICON_DIAMETER / 2, leftStartPoint[1]] as Point;
        const leftAwarenessRectangle = RectangleClient.getRectangleByPoints([
            [leftStartPoint[0] - NODE_MORE_ICON_DIAMETER - NODE_MORE_LINE_DISTANCE, leftStartPoint[1] - NODE_MORE_ICON_DIAMETER / 2],
            [leftStartPoint[0], leftStartPoint[1] + NODE_MORE_ICON_DIAMETER / 2]
        ]);
        standardRef = {
            addCenter: leftAddCenter,
            awarenessRectangle: leftAwarenessRectangle
        };
    }
    return {
        startPoint,
        endPoint,
        hasCollapsedIcon,
        hasExpandedIcon,
        hasAddIcon,
        collapsedIconCenter,
        expandedIconCenter,
        addCenter,
        awarenessRectangle,
        hasLeftAddIcon,
        standardRef
    };
};

export const getNodeMoreLayoutDirection = (board: PlaitBoard, element: MindElement) => {
    const node = MindElement.getNode(element);
    const layout = MindQueries.getCorrectLayoutByElement(board, element) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(layout);
    let layoutDirection = getLayoutDirection(node, isHorizontal);
    if (isIndentedLayout(layout)) {
        layoutDirection = isTopLayout(layout) ? LayoutDirection.top : LayoutDirection.bottom;
    }
    return layoutDirection;
};

export const getNodeMoreStartPoint = (board: PlaitBoard, element: MindElement, linkLineDirection: LayoutDirection, isLeft = false) => {
    const node = MindElement.getNode(element);
    const isUnderlineShape = getShapeByElement(board, element) === MindElementShape.underline;
    const nodeClient = getRectangleByNode(node);
    let placement: PointPlacement = [HorizontalPlacement.right, VerticalPlacement.middle];
    if (isLeft) {
        placement[0] = HorizontalPlacement.left;
    }
    transformPlacement(placement, linkLineDirection);
    // underline shape and horizontal
    const layout = MindQueries.getLayoutByElement(element) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(layout);
    if (isHorizontal && isUnderlineShape && !PlaitMind.isMind(element)) {
        placement[1] = VerticalPlacement.bottom;
    }
    let startPoint = getPointByPlacement(nodeClient, placement);
    return startPoint as Point;
};

export const canHandleNodeMore = (board: PlaitBoard) => {
    return !isResizing(board) && !isSelectionMoving(board) && !isDragging(board) && !isMovingElements(board);
};
