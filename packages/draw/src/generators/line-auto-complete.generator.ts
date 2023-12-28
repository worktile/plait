import { PlaitBoard, RgbaToHEX, createG, drawCircle, getSelectedElements, isSelectionMoving } from '@plait/core';
import { PlaitGeometry, PlaitShape } from '../interfaces';
import { ActiveGeneratorExtraData, Generator, PRIMARY_COLOR } from '@plait/common';
import { getAutoCompletePoints } from '../utils';
import { LINE_AUTO_COMPLETE_DIAMETER, LINE_AUTO_COMPLETE_OPACITY } from '../constants/line';
import { LINE_AUTO_COMPLETE } from '../constants';

export class LineAutoCompleteGenerator extends Generator<PlaitShape, ActiveGeneratorExtraData> {
    autoCompleteG!: SVGGElement;
    hoverElement: SVGGElement | null = null;

    constructor(public board: PlaitBoard) {
        super(board);
    }

    canDraw(element: PlaitShape, data: ActiveGeneratorExtraData): boolean {
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
            const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, LINE_AUTO_COMPLETE_DIAMETER, {
                stroke: 'none',
                fill: RgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_OPACITY),
                fillStyle: 'solid'
            });
            circle.classList.add(`${LINE_AUTO_COMPLETE}-${index}`);
            this.autoCompleteG.appendChild(circle);
        });
        return this.autoCompleteG;
    }

    removeAutoCompleteG(index: number) {
        this.hoverElement = this.autoCompleteG.querySelector(`.${LINE_AUTO_COMPLETE}-${index}`);
        this.hoverElement!.style.visibility = 'hidden';
    }

    recoverAutoCompleteG() {
        if (this.hoverElement) {
            this.hoverElement.style.visibility = 'visible';
            this.hoverElement = null;
        }
    }
}
