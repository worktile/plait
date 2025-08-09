import {
    CursorClass,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    rgbaToHEX,
    drawCircle,
    hasValidAngle,
    isSelectionMoving,
    rotateAntiPointsByElement,
    setAngleForG,
    toActivePoint,
    toActiveRectangleFromViewBoxRectangle,
    createG,
    rotatePointsByElement,
    isHorizontalDirection,
    idCreator,
    Point
} from '@plait/core';
import { getAutoCompletePoints, getHitConnection, getHitIndexOfAutoCompletePoint, getSelectedDrawElements, handleArrowLineCreating } from '../../utils';
import { PRIMARY_COLOR, PlaitCommonElementRef, getDirectionByIndex, getXDistanceBetweenPoint, moveXOfPoint } from '@plait/common';
import { BOARD_TO_PRE_COMMIT } from './with-arrow-line-auto-complete';
import { DrawPointerType, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, LINE_AUTO_COMPLETE_HOVERED_OPACITY } from '../../constants';
import { ArrowLineAutoCompleteGenerator } from '../../generators';
import { getGeometryGeneratorByShape } from '../with-geometry-create';
import { ArrowLineShape, PlaitArrowLine, PlaitDrawElement, PlaitGeometry } from '../../interfaces';

const PREVIEW_ARROW_LINE_DISTANCE = 100;

export const withArrowLineAutoCompleteReaction = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave, globalPointerUp } = board;
    let reactionG: SVGGElement | null = null;
    let temporaryArrowLineElement: PlaitArrowLine | null = null;
    let temporaryShapeElement: PlaitGeometry | null = null;
    let temporaryArrowLineG: SVGGElement | null = null;
    let temporaryShapeG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        reactionG?.remove();
        PlaitBoard.getBoardContainer(board).classList.remove(CursorClass.crosshair);
        const selectedElements = getSelectedDrawElements(board);
        temporaryArrowLineG?.remove();
        temporaryShapeG?.remove();
        const originElement = selectedElements.length === 1 && selectedElements[0];
        const activePoint = toActivePoint(board, event.x, event.y);
        if (!PlaitBoard.isReadonly(board) && !isSelectionMoving(board) && originElement && PlaitDrawElement.isShapeElement(originElement)) {
            const points = getAutoCompletePoints(board, originElement, true);
            const hitIndex = getHitIndexOfAutoCompletePoint(
                rotateAntiPointsByElement(board, activePoint, originElement, true) || activePoint,
                points
            );
            const hitPoint = points[hitIndex];
            const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(originElement);
            const lineAutoCompleteGenerator = ref.getGenerator<ArrowLineAutoCompleteGenerator>(ArrowLineAutoCompleteGenerator.key);
            lineAutoCompleteGenerator.recoverAutoCompleteG();
            if (hitPoint) {
                reactionG = drawCircle(PlaitBoard.getRoughSVG(board), hitPoint, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, {
                    stroke: 'none',
                    fill: rgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_HOVERED_OPACITY),
                    fillStyle: 'solid'
                });
                const originRect = RectangleClient.getRectangleByPoints(originElement.points);
                let arrowLineStartPoint = RectangleClient.getEdgeCenterPoints(originRect)[hitIndex];
                const arrowLineDirection = getDirectionByIndex(hitIndex);
                let arrowLineEndPoint = moveXOfPoint(arrowLineStartPoint, PREVIEW_ARROW_LINE_DISTANCE, arrowLineDirection);
                const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
                const geometryGenerator = getGeometryGeneratorByShape(board, pointer);
                const temporaryShapePoints = originElement.points.map((point) =>
                    moveXOfPoint(
                        point,
                        PREVIEW_ARROW_LINE_DISTANCE +
                            getXDistanceBetweenPoint(
                                originElement.points[0],
                                originElement.points[1],
                                isHorizontalDirection(arrowLineDirection)
                            ),
                        arrowLineDirection
                    )
                );
                temporaryArrowLineG = createG();
                temporaryShapeG = createG();
                temporaryArrowLineG.style.opacity = '0.6';
                temporaryShapeG.style.opacity = '0.6';
                temporaryShapeElement = {
                    ...(originElement as PlaitGeometry),
                    points: temporaryShapePoints as [Point, Point],
                    id: idCreator()
                };
                const rotatedArrowLineStartPoint = rotatePointsByElement(arrowLineStartPoint, originElement) || arrowLineStartPoint;
                const rotatedArrowLineEndPoint = rotatePointsByElement(arrowLineEndPoint, temporaryShapeElement) || arrowLineEndPoint;
                temporaryArrowLineElement = handleArrowLineCreating(
                    board,
                    ArrowLineShape.elbow,
                    rotatedArrowLineStartPoint,
                    rotatedArrowLineEndPoint,
                    originElement,
                    temporaryArrowLineG
                );
                BOARD_TO_PRE_COMMIT.set(board, { temporaryArrowLineElement, temporaryShapeElement });
                const connectionInfo = getHitConnection(board, rotatedArrowLineEndPoint, temporaryShapeElement);
                temporaryArrowLineElement.target.boundId = temporaryShapeElement.id;
                temporaryArrowLineElement.target.connection = connectionInfo;
                geometryGenerator.processDrawing(temporaryShapeElement as PlaitGeometry, temporaryShapeG);
                PlaitBoard.getElementTopHost(board).append(temporaryShapeG);
                PlaitBoard.getActiveHost(board).append(reactionG);
                PlaitBoard.getBoardContainer(board).classList.add(CursorClass.crosshair);
                if (hasValidAngle(originElement)) {
                    const rectangle = board.getRectangle(originElement)!;
                    const activeRectangle = toActiveRectangleFromViewBoxRectangle(board, rectangle);
                    setAngleForG(reactionG, RectangleClient.getCenterPoint(activeRectangle), originElement.angle!);
                }
                return;
            }
        }
        BOARD_TO_PRE_COMMIT.delete(board);
        pointerMove(event);
    };

    board.pointerLeave = (pointer: PointerEvent) => {
        clearRef();
        pointerLeave(pointer);
    };

    const clearRef = () => {
        if (reactionG) {
            reactionG?.remove();
            PlaitBoard.getBoardContainer(board).classList.remove(CursorClass.crosshair);
            temporaryArrowLineG?.remove();
            temporaryShapeG?.remove();
        }
        if (BOARD_TO_PRE_COMMIT.get(board)) {
            BOARD_TO_PRE_COMMIT.delete(board);
        }
    }

    board.globalPointerUp = (event: PointerEvent) => {
        globalPointerUp(event);
        clearRef();
    }

    return board;
};
