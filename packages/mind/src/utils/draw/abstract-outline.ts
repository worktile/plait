import { createG, getRectangleByElements, PlaitBoard, RectangleClient, setStrokeLinecap } from '@plait/core';
import { PRIMARY_COLOR } from '../../constants';
import { ABSTRACT_HANDLE_COLOR, ABSTRACT_HANDLE_LENGTH, ABSTRACT_INCLUDED_OUTLINE_OFFSET } from '../../constants/abstract-node';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindElement } from '../../interfaces';
import { MindLayoutType, isHorizontalLayout } from '@plait/layouts';
import { MindQueries } from '../../queries';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, transformPlacement } from '../point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../interfaces/types';
import { getRectangleByResizingLocation } from '../abstract/resize';
import { AbstractHandlePosition } from '../../plugins/with-abstract-resize.board';
import { Options } from 'roughjs/bin/core';

export function drawAbstractIncludedOutline(
    board: PlaitBoard,
    roughSVG: RoughSVG,
    element: MindElement,
    activeHandlePosition?: AbstractHandlePosition,
    resizingLocation?: number
) {
    const abstractIncludedG = createG();

    const parentElement = MindElement.getParent(element);
    const nodeLayout = MindQueries.getCorrectLayoutByElement(board, element) as MindLayoutType;
    const isHorizontal = isHorizontalLayout(nodeLayout);

    const includedElements = parentElement.children.slice(element.start!, element.end! + 1);
    let abstractRectangle = getRectangleByElements(board, includedElements, true);
    abstractRectangle = RectangleClient.getOutlineRectangle(abstractRectangle, -ABSTRACT_INCLUDED_OUTLINE_OFFSET);

    if (resizingLocation) {
        abstractRectangle = getRectangleByResizingLocation(abstractRectangle, resizingLocation, activeHandlePosition!, isHorizontal);
    }

    const rectangle = drawAbstractRoundRectangle(
        roughSVG,
        abstractRectangle.x,
        abstractRectangle.y,
        abstractRectangle.x + abstractRectangle.width,
        abstractRectangle.y + abstractRectangle.height,
        isHorizontal,
        {
            stroke: PRIMARY_COLOR,
            strokeWidth: 1,
            fillStyle: 'solid'
        }
    );

    const startPlacement = [HorizontalPlacement.center, VerticalPlacement.top] as PointPlacement;
    const endPlacement = [HorizontalPlacement.center, VerticalPlacement.bottom] as PointPlacement;

    const linkDirection = getLayoutDirection(MindElement.getNode(element), isHorizontal);

    transformPlacement(startPlacement, linkDirection);
    transformPlacement(endPlacement, linkDirection);

    let startCenterPoint = getPointByPlacement(abstractRectangle, startPlacement);
    let endCenterPoint = getPointByPlacement(abstractRectangle, endPlacement);

    const startPoint1 = moveXOfPoint(startCenterPoint, -ABSTRACT_HANDLE_LENGTH / 2, linkDirection);
    const startPoint2 = moveXOfPoint(startCenterPoint, ABSTRACT_HANDLE_LENGTH / 2, linkDirection);

    const endPoint1 = moveXOfPoint(endCenterPoint, -ABSTRACT_HANDLE_LENGTH / 2, linkDirection);
    const endPoint2 = moveXOfPoint(endCenterPoint, ABSTRACT_HANDLE_LENGTH / 2, linkDirection);

    const startHandle = roughSVG.line(
        startPoint1[0],
        startPoint1[1],
        startPoint2[0],
        startPoint2[1],
        getHandleOption(activeHandlePosition === AbstractHandlePosition.start)
    );

    const endHandle = roughSVG.line(
        endPoint1[0],
        endPoint1[1],
        endPoint2[0],
        endPoint2[1],
        getHandleOption(activeHandlePosition === AbstractHandlePosition.end)
    );

    handleBoardClass(board, activeHandlePosition, isHorizontal);

    setStrokeLinecap(startHandle, 'round');
    setStrokeLinecap(endHandle, 'round');

    abstractIncludedG.append(startHandle);
    abstractIncludedG.append(endHandle);
    abstractIncludedG.append(rectangle);

    return abstractIncludedG;
}

export function getHandleOption(isHover: boolean) {
    return isHover
        ? {
              stroke: PRIMARY_COLOR,
              strokeWidth: 4,
              fillStyle: 'solid'
          }
        : {
              stroke: ABSTRACT_HANDLE_COLOR,
              strokeWidth: 3,
              fillStyle: 'solid'
          };
}

function handleBoardClass(board: PlaitBoard, activeHandlePosition: AbstractHandlePosition | undefined, isHorizontal: boolean) {
    if (activeHandlePosition) {
        if (isHorizontal) {
            PlaitBoard.getBoardContainer(board).classList.add('abstract-resizing-horizontal');
        } else {
            PlaitBoard.getBoardContainer(board).classList.add('abstract-resizing-vertical');
        }
    } else {
        PlaitBoard.getBoardContainer(board).classList.remove('abstract-resizing-horizontal');
        PlaitBoard.getBoardContainer(board).classList.remove('abstract-resizing-vertical');
    }
}

export function drawAbstractRoundRectangle(
    rs: RoughSVG,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    isHorizontal: boolean,
    options: Options
) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    const radius = 5;
    const handleGap = 4;
    const handleLength = 10;

    const handleSpace = handleLength + handleGap * 2;

    if (isHorizontal) {
        const handleSideLine = (width - handleSpace - radius * 2) / 2;
        const sideLine = height - radius * 2;
        return rs.path(
            `M${x1 + radius},${y1}
            l${handleSideLine},0
            m${handleSpace},0
            l${handleSideLine},0
            a${radius},${radius},0,0,1,${radius},${radius}
            l0,${sideLine}
            a${radius},${radius},0,0,1,-${radius},${radius}
            l-${handleSideLine},0
            m-${handleSpace},0
            l-${handleSideLine},0
            a${radius},${radius},0,0,1,-${radius},-${radius}
            l0,-${sideLine}
            a${radius},${radius},0,0,1,${radius},-${radius}`,
            options
        );
    } else {
        const handleSideLine = (height - handleSpace - radius * 2) / 2;
        const sideLine = width - radius * 2;
        return rs.path(
            `M${x1 + radius},${y1}
            l${sideLine},0
            a${radius},${radius},0,0,1,${radius},${radius}
            l0,${handleSideLine}
            m0,${handleSpace}
            l0,${handleSideLine}
            a${radius},${radius},0,0,1,-${radius},${radius}
            l-${sideLine},0
            a${radius},${radius},0,0,1,-${radius},-${radius}
            l0,-${handleSideLine}
            m0,-${handleSpace}
            l0,-${handleSideLine}
            a${radius},${radius},0,0,1,${radius},-${radius}`,
            options
        );
    }
}
