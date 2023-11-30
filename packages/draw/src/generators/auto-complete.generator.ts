import { PlaitBoard, PlaitElement, RectangleClient, createG, drawCircle, getSelectedElements, isSelectionMoving } from '@plait/core';
import { RESIZE_HANDLE_DIAMETER } from '../../../common/src/constants/default';
import { ActiveGenerator, ActiveGeneratorOptions } from '../../../common/src/generators/active.generator';
// 抽取 AutoCompleteGenerator
// 修改 (12 + RESIZE_HANDLE_DIAMETER / 2) * 2 + 1
export interface ActiveGeneratorExtraData {
    selected: boolean;
}

export class AutoCompleteGenerator<T extends PlaitElement = PlaitElement> extends ActiveGenerator<T> {
    hasResizeHandle = false;
    autoCompleteG!: SVGGElement;

    constructor(public board: PlaitBoard, public options: ActiveGeneratorOptions<T>) {
        super(board, options);
    }

    canDraw(element: T, data: ActiveGeneratorExtraData): boolean {
        if (data.selected && this.options.hasResizeHandle()) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: T, data: ActiveGeneratorExtraData): SVGGElement {
        this.autoCompleteG = createG();
        const selectedElements = getSelectedElements(this.board);
        let rectangle = this.options.getRectangle(element);
        if (selectedElements.length === 1 && !isSelectionMoving(this.board)) {
            rectangle = RectangleClient.inflate(rectangle, (12 + RESIZE_HANDLE_DIAMETER / 2) * 2 + 1);
            const middlePoints = RectangleClient.getEdgeCenterPoints(rectangle);
            middlePoints.forEach((point, index) => {
                const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, RESIZE_HANDLE_DIAMETER, {
                    stroke: 'none',
                    fill: '#6698FF4d',
                    fillStyle: 'solid'
                });
                circle.classList.add(`geometry-auto-complete-${index}`);
                this.autoCompleteG.appendChild(circle);
            });
        }
        return this.autoCompleteG;
    }

    removeAutoCompleteG(index: number) {
        const style = (this.autoCompleteG.childNodes[index] as HTMLElement).style;
        style.visibility = 'hidden';
    }

    recoverAutoCompleteG() {
        this.autoCompleteG &&
            this.autoCompleteG.childNodes.forEach(child => {
                const style = (child as HTMLElement).style;
                if (style.visibility !== 'visible') {
                    style.visibility = 'visible';
                }
            });
    }
}
