import { drawAbstractRoundRectangle, createG, getRectangleByElements, PlaitBoard, RectangleClient } from '@plait/core';
import { ABSTRACT_HANDLE_COLOR, ABSTRACT_HANDLE_LENGTH, ABSTRACT_INCLUDED_OUTLINE_OFFSET, PRIMARY_COLOR } from '../constants';
import { RoughSVG } from 'roughjs/bin/svg';
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { MindLayoutType, isHorizontalLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getLayoutDirection, getPointByPlacement, movePoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import { getRectangleByResizingLocation } from '../utils/abstract/resize';

export function drawAbstractIncludedOutline(
    board: PlaitBoard,
    roughSVG: RoughSVG,
    element: MindElement,
    activeHandlePosition?: AbstractHandlePosition,
    resizingLocation?: number
) {
    const abstractIncludedG = createG();

    const parentElement = MindElement.getParent(element);
    const nodeLayout = MindQueries.getCorrectLayoutByElement(element) as MindLayoutType;
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

    const startPoint1 = movePoint(startCenterPoint, -ABSTRACT_HANDLE_LENGTH / 2, linkDirection);
    const startPoint2 = movePoint(startCenterPoint, ABSTRACT_HANDLE_LENGTH / 2, linkDirection);

    const endPoint1 = movePoint(endCenterPoint, -ABSTRACT_HANDLE_LENGTH / 2, linkDirection);
    const endPoint2 = movePoint(endCenterPoint, ABSTRACT_HANDLE_LENGTH / 2, linkDirection);

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

    changeBoardClass(board, activeHandlePosition, isHorizontal);

    startHandle.setAttribute('stroke-linecap', 'round');
    endHandle.setAttribute('stroke-linecap', 'round');

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

export function changeBoardClass(board: PlaitBoard, activeHandlePosition: AbstractHandlePosition | undefined, isHorizontal: boolean) {
    if (activeHandlePosition) {
        if (isHorizontal) {
            PlaitBoard.getBoardNativeElement(board).classList.add('abstract-resizing-horizontal');
        } else {
            PlaitBoard.getBoardNativeElement(board).classList.add('abstract-resizing-vertical');
        }
    } else {
        PlaitBoard.getBoardNativeElement(board).classList.remove('abstract-resizing-horizontal');
        PlaitBoard.getBoardNativeElement(board).classList.remove('abstract-resizing-vertical');
    }
}
