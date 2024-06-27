import { PlaitBoard, Point, createG, drawRectangle, getSelectedElements } from '@plait/core';
import { ArrowLineShape, PlaitArrowLine } from '../interfaces';
import { Generator, PRIMARY_COLOR, drawFillPrimaryHandle, drawPrimaryHandle } from '@plait/common';
import { getMiddlePoints } from '../utils/arrow-line/arrow-line-basic';
import { getNextRenderPoints } from '../utils/arrow-line/elbow';
import { isUpdatedHandleIndex } from '../utils/arrow-line';
import { getHitPointIndex } from '../utils/position/arrow-line';
import { DefaultDrawActiveStyle } from '../constants';

export interface ActiveData {
    selected: boolean;
    linePoints: Point[];
}

export class ArrowLineActiveGenerator extends Generator<PlaitArrowLine, ActiveData> {
    onlySelectedCurrentLine = false;

    canDraw(element: PlaitArrowLine, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    draw(element: PlaitArrowLine, data: ActiveData): SVGGElement {
        const activeG = createG();
        const selectedElements = getSelectedElements(this.board);
        this.onlySelectedCurrentLine = selectedElements.length === 1;
        if (this.onlySelectedCurrentLine) {
            activeG.classList.add('active');
            activeG.classList.add('line-handle');
            const points = PlaitArrowLine.getPoints(this.board, element);
            let updatePoints = [...points];
            let elbowNextRenderPoints: Point[] = [];
            if (element.shape === ArrowLineShape.elbow) {
                updatePoints = points.slice(0, 1).concat(points.slice(-1));
                elbowNextRenderPoints = getNextRenderPoints(this.board, element, data.linePoints);
            }
            updatePoints.forEach(point => {
                const updateHandle = drawPrimaryHandle(this.board, point);
                activeG.appendChild(updateHandle);
            });
            const middlePoints = getMiddlePoints(this.board, element);
            if (!PlaitBoard.hasBeenTextEditing(this.board)) {
                for (let i = 0; i < middlePoints.length; i++) {
                    const point = middlePoints[i];
                    if (element.shape === ArrowLineShape.elbow && elbowNextRenderPoints.length) {
                        const handleIndex = getHitPointIndex(middlePoints, point);
                        const isUpdateHandleIndex = isUpdatedHandleIndex(
                            this.board,
                            element,
                            [...points],
                            elbowNextRenderPoints,
                            handleIndex
                        );
                        if (isUpdateHandleIndex) {
                            const updateHandle = drawPrimaryHandle(this.board, point);
                            activeG.appendChild(updateHandle);
                            continue;
                        }
                    }
                    const circle = drawFillPrimaryHandle(this.board, point);
                    activeG.appendChild(circle);
                }
            }
        } else {
            const activeRectangle = this.board.getRectangle(element);
            if (activeRectangle) {
                let opacity = '0.5';
                if (activeRectangle.height === 0 || activeRectangle.width === 0) {
                    opacity = '0.8';
                }
                const strokeG = drawRectangle(this.board, activeRectangle, {
                    stroke: PRIMARY_COLOR,
                    strokeWidth: DefaultDrawActiveStyle.selectionStrokeWidth
                });
                strokeG.style.opacity = opacity;
                activeG.appendChild(strokeG);
            }
        }
        return activeG;
    }

    needUpdate() {
        const selectedElements = getSelectedElements(this.board);
        const onlySelectedCurrentLine = selectedElements.length === 1;
        return onlySelectedCurrentLine !== this.onlySelectedCurrentLine;
    }
}
