import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';
import { PlaitElement } from '../interfaces/element';
import { Ancestor } from '../interfaces/node';
import { RectangleClient } from '../interfaces';
import { depthFirstRecursion } from './tree';

export interface ResizeAlignRef {
    deltaX: number;
    deltaY: number;
    g: SVGGElement;
}

export interface ResizeDistributeRef {
    before: { distance: number; index: number }[];
    after: { distance: number; index: number }[];
}

const ALIGN_TOLERANCE = 2;

export class ResizeAlignReaction {
    alignRectangles: RectangleClient[];

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {
        this.alignRectangles = this.getAlignRectangle();
    }

    getAlignRectangle() {
        const result: RectangleClient[] = [];
        depthFirstRecursion<Ancestor>(
            this.board,
            node => {
                if (PlaitBoard.isBoard(node) || this.activeElements.some(element => node.id === element.id) || !this.board.isAlign(node)) {
                    return;
                }
                const rectangle = this.board.getRectangle(node);
                rectangle && result.push(rectangle);
            },
            node => {
                if (node && (PlaitBoard.isBoard(node) || this.board.isRecursion(node))) {
                    return true;
                } else {
                    return false;
                }
            },
            true
        );
        return result;
    }

    handleAlign(): ResizeAlignRef {
        const alignRectangles = this.getAlignRectangle();
        const g = createG();
        let deltaX = 0;
        let deltaY = 0;

        for (let alignRectangle of alignRectangles) {
            const offsetWidth = this.activeRectangle.width - alignRectangle.width;
            const offsetHeight = this.activeRectangle.height - alignRectangle.height;
            // TODO: 增加方向判断，水平拖拽只显示等宽线，垂直拖拽只显示等高线
            if (Math.abs(offsetWidth) < ALIGN_TOLERANCE) {
                deltaX = offsetWidth;
                this.activeRectangle.width = alignRectangle.width;
                // 在 alignRectangle 对应位置绘制等宽线
            }

            if (Math.abs(offsetHeight) < ALIGN_TOLERANCE) {
                deltaY = offsetHeight;
                this.activeRectangle.height = alignRectangle.height;
                // 在 alignRectangle 对应位置绘制宽线
            }
        }
        return { deltaX, deltaY, g };
    }
}
