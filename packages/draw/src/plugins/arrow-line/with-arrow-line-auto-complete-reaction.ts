import {
    CursorClass,
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    rgbaToHEX,
    drawCircle,
    hasValidAngle,
    isSelectionMoving,
    rotateAntiPointsByElement,
    setAngleForG,
    addSelectedElement,
    clearSelectedElement,
    toActivePoint,
    Transforms,
    PlaitOptionsBoard,
    toActiveRectangleFromViewBoxRectangle,
    createG,
    rotatePointsByElement,
    toHostPoint,
    toScreenPointFromActivePoint,
    toViewBoxPoint
} from '@plait/core';
import {
    createGeometryElement,
    getAutoCompletePoints,
    getHitIndexOfAutoCompletePoint,
    getSelectedDrawElements,
    handleArrowLineCreating
} from '../../utils';
import { PRIMARY_COLOR, PlaitCommonElementRef } from '@plait/common';
import {
    ArrowLineAutoCompleteOptions,
    BOARD_TO_PRELOADING_SHAPE,
    WithArrowLineAutoCompletePluginKey
} from './with-arrow-line-auto-complete';
import { DrawPointerType, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, LINE_AUTO_COMPLETE_HOVERED_OPACITY } from '../../constants';
import { ArrowLineAutoCompleteGenerator } from '../../generators';
import { getGeometryGeneratorByShape } from '../with-geometry-create';
import { ArrowLineShape, PlaitArrowLine, PlaitDrawElement, PlaitGeometry, PlaitShapeElement, TextColor } from '../../interfaces';

export const withArrowLineAutoCompleteReaction = (board: PlaitBoard) => {
    const { pointerMove, globalPointerUp } = board;
    let reactionG: SVGGElement | null = null;
    let temporaryElement: PlaitArrowLine | null;
    let autoCompletePoint: Point | null = null;
    let sourceElement: PlaitShapeElement | null;
    let lineShapeG: SVGGElement | null = null;
    let geometryShapeG: SVGGElement | null = null;
    let hitIndex: number = -1;
    let selectedElements: ReturnType<typeof getSelectedDrawElements>;
    let shapeEl: any;
    const OFFSET = 100;
    const ARROW_OFFSET = 80;

    board.pointerMove = (event: PointerEvent) => {
        reactionG?.remove();
        PlaitBoard.getBoardContainer(board).classList.remove(CursorClass.crosshair);
        selectedElements = getSelectedDrawElements(board);
        lineShapeG?.remove();
        geometryShapeG?.remove();
        const targetElement = selectedElements.length === 1 && selectedElements[0];
        const activePoint = toActivePoint(board, event.x, event.y);
        if (!PlaitBoard.isReadonly(board) && !isSelectionMoving(board) && targetElement && PlaitDrawElement.isShapeElement(targetElement)) {
            const points = getAutoCompletePoints(board, targetElement, true);
            hitIndex = getHitIndexOfAutoCompletePoint(
                rotateAntiPointsByElement(board, activePoint, targetElement, true) || activePoint,
                points
            );
            // 0上 1右 2下 3左
            const hitPoint = points[hitIndex];
            const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(targetElement);
            const lineAutoCompleteGenerator = ref.getGenerator<ArrowLineAutoCompleteGenerator>(ArrowLineAutoCompleteGenerator.key);
            lineAutoCompleteGenerator.recoverAutoCompleteG();
            if (hitPoint) {
                reactionG = drawCircle(PlaitBoard.getRoughSVG(board), hitPoint, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, {
                    stroke: 'none',
                    strokeWidth: 2,
                    fill: rgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_HOVERED_OPACITY),
                    fillStyle: 'solid'
                });
                const screenPoint = toScreenPointFromActivePoint(board, hitPoint);
                autoCompletePoint = toViewBoxPoint(board, toHostPoint(board, screenPoint[0], screenPoint[1]));
                sourceElement = targetElement;
                let sourcePoint = autoCompletePoint;
                let movingPoint;
                const pointer = PlaitBoard.getPointer(board) as DrawPointerType;

                const geometryGenerator = getGeometryGeneratorByShape(board, pointer);
                const [coordinates1, coordinates2] = selectedElements[0].points;
                const W = Math.abs(coordinates2[0] - coordinates1[0]);
                const H = Math.abs(coordinates2[1] - coordinates1[1]);
                let [topLeftX, topLeftY] = coordinates1;
                let [bottomRightX, bottomRightY] = coordinates2;
                const offsetMap: Record<number, any[]> = {
                    0: [0, -H - OFFSET, 0, -H - OFFSET, 0, -ARROW_OFFSET],
                    1: [W + OFFSET, 0, W + OFFSET, 0, ARROW_OFFSET, 0],
                    2: [0, H + OFFSET, 0, H + OFFSET, 0, ARROW_OFFSET],
                    3: [-W - OFFSET, 0, -W - OFFSET, 0, -ARROW_OFFSET, 0]
                };
                const [dx1, dy1, dx2, dy2, arrowDx, arrowDy] = offsetMap[hitIndex] || [0, 0, 0, 0, 0, 0];
                topLeftX += dx1;
                topLeftY += dy1;
                bottomRightX += dx2;
                bottomRightY += dy2;
                const topLeftCorner = [topLeftX, topLeftY];
                const bottomLeftCorner = [bottomRightX, bottomRightY];
                movingPoint = toViewBoxPoint(board, toHostPoint(board, hitPoint[0] + arrowDx, hitPoint[1] + arrowDy));

                lineShapeG = createG();
                geometryShapeG = createG();
                const rotatedSourcePoint = rotatePointsByElement(sourcePoint, sourceElement) || sourcePoint;
                temporaryElement = handleArrowLineCreating(
                    board,
                    ArrowLineShape.elbow,
                    rotatedSourcePoint,
                    movingPoint,
                    sourceElement,
                    lineShapeG,
                    {
                        strokeColor: TextColor.gray
                    }
                );
                shapeEl = createGeometryElement(selectedElements[0].shape, [topLeftCorner, bottomLeftCorner] as [Point, Point], '', {
                    strokeColor: TextColor.gray
                });
                // arrow bound geometry
                const connectionMap: Record<number, [number, number]> = {
                    0: [0.5, 1],
                    1: [0, 0.5],
                    2: [0.5, 0],
                    3: [1, 0.5]
                };
                temporaryElement.target.boundId = shapeEl.id;
                temporaryElement.target.connection = connectionMap[hitIndex] || [0.1, 0];
                geometryGenerator.processDrawing(shapeEl as PlaitGeometry, geometryShapeG);
                PlaitBoard.getElementTopHost(board).append(geometryShapeG);
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
    board.globalPointerUp = (event: PointerEvent) => {
        if (hitIndex >= 0 && temporaryElement) {
            temporaryElement.strokeColor = TextColor.nomal;
            // temporaryElement.strokeWidth = 2;
            shapeEl.strokeColor = selectedElements[0]?.strokeColor;
            shapeEl.fill = selectedElements[0]?.fill;

            BOARD_TO_PRELOADING_SHAPE.set(board, { tempArrow: temporaryElement, drawElement: shapeEl });

            clearSelectedElement(board);
            addSelectedElement(board, temporaryElement);
            const afterComplete = (board as PlaitOptionsBoard).getPluginOptions<ArrowLineAutoCompleteOptions>(
                WithArrowLineAutoCompletePluginKey
            )?.afterComplete;
            afterComplete && afterComplete(temporaryElement);
        } else {
            BOARD_TO_PRELOADING_SHAPE.delete(board);
        }
        lineShapeG?.remove();
        lineShapeG = null;
        sourceElement = null;
        temporaryElement = null;
        geometryShapeG?.remove();
        geometryShapeG = null;
        shapeEl = null;
        globalPointerUp(event);
    };
    return board;
};
