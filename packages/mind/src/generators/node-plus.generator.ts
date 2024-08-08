import { PlaitBoard, PlaitOptionsBoard, createG, temporaryDisableSelection } from '@plait/core';
import { MindElement, BaseData, PlaitMind, MindElementShape, LayoutDirection } from '../interfaces';
import { getRectangleByNode } from '../utils/position/node';
import { getShapeByElement } from '../utils/node-style/shape';
import { EXTEND_DIAMETER, QUICK_INSERT_CIRCLE_COLOR, QUICK_INSERT_INNER_CROSS_COLOR } from '../constants/default';
import { MindLayoutType, isHorizontalLayout, isIndentedLayout, isTopLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { fromEvent } from 'rxjs';
import { insertMindElement } from '../utils/mind';
import { take } from 'rxjs/operators';
import { findNewChildNodePath } from '../utils/path';
import { getBranchColorByMindElement, getBranchWidthByMindElement, getNextBranchColor } from '../utils/node-style/branch';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import { AfterDraw, Generator } from '@plait/common';
import { PlaitMindBoard } from '../plugins/with-mind.board';

export class NodePlusGenerator extends Generator<MindElement> implements AfterDraw {
    canDraw(element: MindElement<BaseData>): boolean {
        if (PlaitBoard.isReadonly(this.board) || element?.isCollapsed) {
            return false;
        }
        return true;
    }

    draw(element: MindElement<BaseData>): SVGGElement {
        const plusG = createG();
        plusG.classList.add('plus');
        const node = MindElement.getNode(element);
        const layout = MindQueries.getLayoutByElement(element) as MindLayoutType;
        const isHorizontal = isHorizontalLayout(layout);
        let linkDirection = getLayoutDirection(node, isHorizontal);
        if (isIndentedLayout(layout)) {
            linkDirection = isTopLayout(layout) ? LayoutDirection.top : LayoutDirection.bottom;
        }
        const isUnderlineShape = getShapeByElement(this.board, element) === MindElementShape.underline;
        const nodeClient = getRectangleByNode(node);
        const branchWidth = getBranchWidthByMindElement(this.board, element);
        const branchColor = PlaitMind.isMind(element)
            ? getNextBranchColor(this.board, element)
            : getBranchColorByMindElement(this.board, element);
        let distance = 8;

        let placement: PointPlacement = [HorizontalPlacement.right, VerticalPlacement.middle];

        transformPlacement(placement, linkDirection);

        // underline shape and horizontal
        if (isHorizontal && isUnderlineShape && !element.isRoot) {
            placement[1] = VerticalPlacement.bottom;
        }

        let beginPoint = getPointByPlacement(nodeClient, placement);

        if (element.children.length > 0 && !element.isRoot) {
            beginPoint = moveXOfPoint(beginPoint, EXTEND_DIAMETER + 8, linkDirection);
            distance = 5;
        }

        const endPoint = moveXOfPoint(beginPoint, distance, linkDirection);
        const circleCenter = moveXOfPoint(endPoint, 8, linkDirection);

        const line = PlaitBoard.getRoughSVG(this.board).line(beginPoint[0], beginPoint[1], endPoint[0], endPoint[1], {
            stroke: branchColor,
            strokeWidth: branchWidth
        });

        const circle = PlaitBoard.getRoughSVG(this.board).circle(circleCenter[0], circleCenter[1], EXTEND_DIAMETER, {
            fill: QUICK_INSERT_CIRCLE_COLOR,
            stroke: QUICK_INSERT_CIRCLE_COLOR,
            fillStyle: 'solid'
        });

        const HLineBeginPoint = [circleCenter[0] - 5, circleCenter[1]];
        const HLineEndPoint = [circleCenter[0] + 5, circleCenter[1]];
        const VLineBeginPoint = [circleCenter[0], circleCenter[1] - 5];
        const VLineEndPoint = [circleCenter[0], circleCenter[1] + 5];

        const innerCrossHLine = PlaitBoard.getRoughSVG(this.board).line(
            HLineBeginPoint[0],
            HLineBeginPoint[1],
            HLineEndPoint[0],
            HLineEndPoint[1],
            {
                stroke: QUICK_INSERT_INNER_CROSS_COLOR,
                strokeWidth: 2
            }
        );

        const innerCrossVLine = PlaitBoard.getRoughSVG(this.board).line(
            VLineBeginPoint[0],
            VLineBeginPoint[1],
            VLineEndPoint[0],
            VLineEndPoint[1],
            {
                stroke: QUICK_INSERT_INNER_CROSS_COLOR,
                strokeWidth: 2
            }
        );
        plusG.appendChild(line);
        plusG.appendChild(circle);
        plusG.appendChild(innerCrossHLine);
        plusG.appendChild(innerCrossVLine);
        return plusG;
    }

    afterDraw(element: MindElement): void {
        if (!this.g) {
            throw new Error(`can not find quick insert g`);
        }
        fromEvent<MouseEvent>(this.g, 'pointerdown')
            .pipe(take(1))
            .subscribe(e => {
                e.preventDefault();
            });
        fromEvent<PointerEvent>(this.g, 'pointerup')
            .pipe(take(1))
            .subscribe((event: PointerEvent) => {
                // wait the event period end of pointerup to otherwise the pointerup will cause new element lose selected state
                setTimeout(() => {
                    const path = findNewChildNodePath(this.board, element);
                    insertMindElement(this.board as PlaitMindBoard, element, path);
                }, 0);
            });
    }
}
