import { PlaitBoard, RgbaToHEX, createG, drawCircle, getSelectedElements, isSelectionMoving } from '@plait/core';
import { PlaitGeometry } from '../interfaces';
import { ActiveGeneratorExtraData, Generator, PRIMARY_COLOR } from '@plait/common';
import { getAutoCompletePoints } from '../utils';

const AUTO_COMPLETE_DIAMETER = 6;

export class LineAutoCompleteGenerator extends Generator<PlaitGeometry, ActiveGeneratorExtraData> {
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

    draw(element: PlaitGeometry, data: ActiveGeneratorExtraData): SVGGElement {
        this.autoCompleteG = createG();
        const middlePoints = getAutoCompletePoints(element);
        middlePoints.forEach((point, index) => {
            const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, AUTO_COMPLETE_DIAMETER, {
                stroke: 'none',
                fill: RgbaToHEX(PRIMARY_COLOR, 0.3),
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
