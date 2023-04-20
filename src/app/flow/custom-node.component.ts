import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaitPluginElementContext, Point, drawCircle } from '@plait/core';
import { FlowBaseData, FlowNode, FlowNodeComponent } from '@plait/flow';
import { WorkflowType } from './flow-data';

@Component({
    selector: 'custom-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomFlowNodeComponent<T extends FlowBaseData = WorkflowType> extends FlowNodeComponent {
    beforeContextChange(value: PlaitPluginElementContext<FlowNode<T>>) {
        if (value.element !== this.element && this.initialized) {
            this.updateElement(value.element);
        }
    }

    updateElement(element: FlowNode = this.element) {
        this.drawElement(element);
        this.drawRichtext(element);
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        const drawCirclePoint = [element.points![0][0] + element.width / 2, element.points![0][1] + element.height / 2] as Point;
        this.nodeG = drawCircle(this.roughSVG, drawCirclePoint, element.height, {
            fillStyle: 'solid',
            fill: 'rgb(61, 75, 102)'
        });
        this.g.append(this.nodeG);
        this.render2.addClass(this.g, 'flow-custom-node');
    }
}
