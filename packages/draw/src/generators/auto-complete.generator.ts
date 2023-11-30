import { PlaitBoard, Point, RectangleClient, createG, drawCircle, getSelectedElements, isSelectionMoving } from '@plait/core';
import { PlaitGeometry } from '../interfaces';
import { ActiveGeneratorExtraData, Generator, RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getAutoCompletePoints } from '../utils';

export class AutoCompleteGenerator extends Generator<PlaitGeometry, ActiveGeneratorExtraData> {
    autoCompleteG!: SVGGElement;
    hoverElement: SVGGElement | null = null;

    constructor(public board: PlaitBoard) {
        super(board);
    }

    canDraw(element: PlaitGeometry, data: ActiveGeneratorExtraData): boolean {
        const selectedElements = getSelectedElements(this.board);

        if (data.selected && selectedElements.length === 1 && !isSelectionMoving(this.board)) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: PlaitGeometry, data: ActiveGeneratorExtraData): SVGGElement {
        this.autoCompleteG = createG();
        const middlePoints = getAutoCompletePoints(element);
        middlePoints.forEach((point, index) => {
            const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, RESIZE_HANDLE_DIAMETER, {
                stroke: 'none',
                fill: '#6698FF4d',
                fillStyle: 'solid'
            });
            circle.classList.add(`geometry-auto-complete-${index}`);
            this.autoCompleteG.appendChild(circle);
        });
        return this.autoCompleteG;
    }

    removeAutoCompleteG(index: number) {
        this.hoverElement = this.autoCompleteG.querySelector(`.geometry-auto-complete-${index}`);
        this.hoverElement!.style.visibility = 'hidden';
    }

    recoverAutoCompleteG() {
        if (this.hoverElement) {
            this.hoverElement.style.visibility = 'visible';
            this.hoverElement = null;
        }
    }
}
