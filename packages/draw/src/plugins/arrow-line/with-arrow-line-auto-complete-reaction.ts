import {
    CursorClass,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    RgbaToHEX,
    drawCircle,
    hasValidAngle,
    isSelectionMoving,
    rotateAntiPointsByElement,
    setAngleForG,
    toActivePoint,
    toActiveRectangleFromViewBoxRectangle
} from '@plait/core';
import { PlaitDrawElement } from '../../interfaces';
import { getAutoCompletePoints, getHitIndexOfAutoCompletePoint, getSelectedDrawElements } from '../../utils';
import { PRIMARY_COLOR, PlaitCommonElementRef } from '@plait/common';
import { LINE_AUTO_COMPLETE_HOVERED_DIAMETER, LINE_AUTO_COMPLETE_HOVERED_OPACITY } from '../../constants/line';
import { ArrowLineAutoCompleteGenerator } from '../../generators/arrow-line-auto-complete.generator';

export const withArrowLineAutoCompleteReaction = (board: PlaitBoard) => {
    const { pointerMove } = board;
    let reactionG: SVGGElement | null = null;
    board.pointerMove = (event: PointerEvent) => {
        reactionG?.remove();
        PlaitBoard.getBoardContainer(board).classList.remove(CursorClass.crosshair);
        const selectedElements = getSelectedDrawElements(board);
        const targetElement = selectedElements.length === 1 && selectedElements[0];
        const activePoint = toActivePoint(board, event.x, event.y);
        if (!PlaitBoard.isReadonly(board) && !isSelectionMoving(board) && targetElement && PlaitDrawElement.isShapeElement(targetElement)) {
            const points = getAutoCompletePoints(board, targetElement, true);
            const hitIndex = getHitIndexOfAutoCompletePoint(
                rotateAntiPointsByElement(board, activePoint, targetElement, true) || activePoint,
                points
            );
            const hitPoint = points[hitIndex];
            const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(targetElement);
            const lineAutoCompleteGenerator = ref.getGenerator<ArrowLineAutoCompleteGenerator>(ArrowLineAutoCompleteGenerator.key);
            lineAutoCompleteGenerator.recoverAutoCompleteG();
            if (hitPoint) {
                lineAutoCompleteGenerator?.removeAutoCompleteG(hitIndex);
                reactionG = drawCircle(PlaitBoard.getRoughSVG(board), hitPoint, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, {
                    stroke: 'none',
                    fill: RgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_HOVERED_OPACITY),
                    fillStyle: 'solid'
                });
                PlaitBoard.getActiveHost(board).append(reactionG);
                PlaitBoard.getBoardContainer(board).classList.add(CursorClass.crosshair);
                if (hasValidAngle(targetElement)) {
                    const rectangle = board.getRectangle(targetElement)!;
                    const activeRectangle = toActiveRectangleFromViewBoxRectangle(board, rectangle);
                    setAngleForG(reactionG, RectangleClient.getCenterPoint(activeRectangle), targetElement.angle!);
                }
            }
        }
        pointerMove(event);
    };

    return board;
};
