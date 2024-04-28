import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaitBoard, Point, drawCircle, normalizePoint } from '@plait/core';
import { FlowNode, FlowNodeComponent, NodeActiveGenerator, NodeGenerator } from '@plait/flow';
import { TextManage } from '@plait/text';

@Component({
    selector: 'custom-flow-node',
    template: '',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomFlowNodeComponent extends FlowNodeComponent {
    initializeGenerator() {
        this.nodeGenerator = new CustomNodeGenerator(this.board);
        this.nodeActiveGenerator = new CustomNodeActiveGenerator(this.board);
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const { x, y } = normalizePoint(this.element.points![0]);
                const width = this.element.width;
                const height = this.element.height;
                return { x, y, width, height };
            }
        });
        this.getRef().addGenerator<NodeActiveGenerator>(NodeActiveGenerator.key, this.nodeActiveGenerator);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.render2.addClass(this.getElementG(), 'flow-custom-node');
    }
}

export class CustomNodeGenerator extends NodeGenerator {
    draw(element: FlowNode) {
        const drawCirclePoint = [element.points![0][0] + element.width / 2, element.points![0][1] + element.height / 2] as Point;
        const circleG = drawCircle(PlaitBoard.getRoughSVG(this.board), drawCirclePoint, 40, {
            fillStyle: 'solid',
            fill: 'rgb(238, 238, 238)',
            stroke: 'rgb(238, 238, 238)'
        });
        return circleG;
    }
}

export class CustomNodeActiveGenerator extends NodeActiveGenerator {
    canDraw() {
        return false;
    }
}
