import { PlaitBoard, PlaitPointerType, Point, Transforms, createG, createText, drawLinearPath } from '@plait/core';
import { MindElement, BaseData, PlaitMind, MindElementShape, LayoutDirection } from '../interfaces';
import { AfterDraw, BaseDrawer } from '../base/base.drawer';
import { getRectangleByNode } from '../utils/position/node';
import { getShapeByElement } from '../utils/node-style/shape';
import { EXTEND_OFFSET, EXTEND_DIAMETER } from '../constants/default';
import { MindLayoutType, isHorizontalLayout, isIndentedLayout, isTopLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { fromEvent } from 'rxjs';
import { getChildrenCount } from '../utils/mind';
import { filter, take } from 'rxjs/operators';
import { getBranchColorByMindElement, getBranchWidthByMindElement } from '../utils/node-style/branch';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, moveYOfPoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';

export class CollapseDrawer extends BaseDrawer implements AfterDraw {
    canDraw(element: MindElement<BaseData>): boolean {
        if (element.children.length && !PlaitMind.isMind(element)) {
            return true;
        }
        return false;
    }

    baseDraw(element: MindElement<BaseData>): SVGGElement {
        const collapseG = createG();
        this.g = collapseG;

        collapseG.classList.add('collapse-container');

        const node = MindElement.getNode(element);
        const stroke = getBranchColorByMindElement(this.board, element);
        const branchWidth = getBranchWidthByMindElement(this.board, element);
        const layout = MindQueries.getLayoutByElement(element) as MindLayoutType;
        const isUnderlineShape = getShapeByElement(this.board, element) === MindElementShape.underline;
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
        const endPoint = moveXOfPoint(startPoint, EXTEND_OFFSET, linkDirection);
        const circleCenter = moveXOfPoint(endPoint, EXTEND_DIAMETER / 2, linkDirection);

        const arrowPoints = this.getArrowPoints(circleCenter, linkDirection);

        const arrowLine = drawLinearPath(arrowPoints, {
            stroke,
            strokeWidth: 2
        });

        const extendLine = PlaitBoard.getRoughSVG(this.board).line(startPoint[0], startPoint[1], endPoint[0], endPoint[1], {
            strokeWidth: branchWidth,
            stroke
        });

        const badge = PlaitBoard.getRoughSVG(this.board).circle(circleCenter[0], circleCenter[1], EXTEND_DIAMETER, {
            fill: stroke,
            stroke,
            fillStyle: 'solid'
        });

        const hideCircleG = PlaitBoard.getRoughSVG(this.board).circle(circleCenter[0], circleCenter[1], EXTEND_DIAMETER, {
            fill: '#fff',
            stroke,
            strokeWidth: branchWidth > 3 ? 3 : branchWidth,
            fillStyle: 'solid'
        });

        if (element.isCollapsed) {
            let numberOffset = 0;
            if (getChildrenCount(element) >= 10) numberOffset = -2;
            if (getChildrenCount(element) === 1) numberOffset = 1;

            const badgeText = createText(circleCenter[0] - 4 + numberOffset, circleCenter[1] + 4, stroke, `${getChildrenCount(element)}`);
            badge.setAttribute('style', 'opacity: 0.15');
            badgeText.setAttribute('style', 'font-size: 12px');
            collapseG.appendChild(badge);
            collapseG.appendChild(badgeText);
            collapseG.appendChild(extendLine);
        } else {
            collapseG.appendChild(hideCircleG);
            collapseG.appendChild(arrowLine);
        }

        collapseG.appendChild(extendLine);
        return collapseG;
    }

    afterDraw(element: MindElement): void {
        if (!this.g) {
            throw new Error(`can not find quick insert g`);
        }

        fromEvent<PointerEvent>(this.g, 'pointerdown')
            .pipe(
                filter(() => !PlaitBoard.isPointer(this.board, PlaitPointerType.hand) || !!PlaitBoard.isReadonly(this.board)),
                take(1)
            )
            .subscribe((event: PointerEvent) => {
                event.preventDefault();
                const isCollapsed = !element.isCollapsed;
                const newElement: Partial<MindElement> = { isCollapsed };
                const path = PlaitBoard.findPath(this.board, element);
                Transforms.setNode(this.board, newElement, path);
            });
    }

    private getArrowPoints(circleCenter: Point, linkDirection: LayoutDirection) {
        let arrowTopPoint = moveXOfPoint(circleCenter, 2, linkDirection);
        arrowTopPoint = moveYOfPoint(arrowTopPoint, 4, linkDirection);
        const arrowMiddlePoint = moveXOfPoint(circleCenter, -2, linkDirection);
        let arrowBottomPoint = moveXOfPoint(circleCenter, 2, linkDirection);
        arrowBottomPoint = moveYOfPoint(arrowBottomPoint, -4, linkDirection);

        return [arrowTopPoint, arrowMiddlePoint, arrowBottomPoint];
    }
}
