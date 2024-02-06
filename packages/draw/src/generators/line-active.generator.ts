import { Point, createG, drawRectangle, getSelectedElements } from '@plait/core';
import { LineShape, PlaitLine } from '../interfaces';
import { Generator, PRIMARY_COLOR, drawFillPrimaryHandle, drawPrimaryHandle } from '@plait/common';
import { getMiddlePoints } from '../utils/line/line-basic';
import { DefaultGeometryActiveStyle } from '../constants';
import { getNextRenderPoints } from '../utils/line/elbow';
import { isUpdatedHandleIndex } from '../utils/line';
import { getHitPointIndex } from '../utils/position/line';

export interface ActiveData {
    selected: boolean;
    linePoints: Point[];
}

export class LineActiveGenerator extends Generator<PlaitLine, ActiveData> {
    canDraw(element: PlaitLine, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    draw(element: PlaitLine, data: ActiveData): SVGGElement {
        const activeG = createG();
        const selectedElements = getSelectedElements(this.board);
        const isSingleSelection = selectedElements.length === 1;
        if (isSingleSelection) {
            activeG.classList.add('active');
            activeG.classList.add('line-handle');
            const points = PlaitLine.getPoints(this.board, element);
            let updatePoints = [...points];
            let elbowNextRenderPoints: Point[] = [];
            if (element.shape === LineShape.elbow) {
                updatePoints = points.slice(0, 1).concat(points.slice(-1));
                elbowNextRenderPoints = getNextRenderPoints(this.board, element, data.linePoints);
            }
            updatePoints.forEach(point => {
                const updateHandle = drawPrimaryHandle(this.board, point);
                activeG.appendChild(updateHandle);
            });
            const middlePoints = getMiddlePoints(this.board, element);
            for (let i = 0; i < middlePoints.length; i++) {
                const point = middlePoints[i];
                if (element.shape === LineShape.elbow && elbowNextRenderPoints.length) {
                    const handleIndex = getHitPointIndex(middlePoints, point);
                    const isUpdateHandleIndex = isUpdatedHandleIndex(this.board, element, [...points], elbowNextRenderPoints, handleIndex);
                    if (isUpdateHandleIndex) {
                        const updateHandle = drawPrimaryHandle(this.board, point);
                        activeG.appendChild(updateHandle);
                        continue;
                    }
                }
                const circle = drawFillPrimaryHandle(this.board, point);
                activeG.appendChild(circle);
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
                    strokeWidth: DefaultGeometryActiveStyle.selectionStrokeWidth
                });
                strokeG.style.opacity = opacity;
                activeG.appendChild(strokeG);
            }
        }
        return activeG;
    }
}
