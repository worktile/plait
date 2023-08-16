import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaitPluginElementContext, Point, drawCircle, PlaitBoard, createG } from '@plait/core';
import { FlowNode, FlowNodeComponent, FlowRenderMode } from '@plait/flow';

@Component({
    selector: 'custom-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomFlowNodeComponent extends FlowNodeComponent {
    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (value.element !== previous.element && this.initialized) {
            this.drawElement(value.element);
        }
    }

    drawElement(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        this.drawNode(element);
        this.drawRichtext(element);
        this.drawActiveMask(element, mode);
        this.drawHandles(element, mode);

        if (mode === FlowRenderMode.default) {
            this.g.append(this.nodeG!);
            this.g.append(this.textManage.g);
            this.render2.addClass(this.g, 'flow-custom-node');
            this.activeG?.remove();
        } else {
            this.activeG = this.activeG || createG();
            this.activeG?.append(this.nodeG!);
            this.activeG?.append(this.textManage.g);
            if (mode === FlowRenderMode.active) {
                this.activeG?.prepend(this.activeMaskG!);
            }
            this.activeG?.append(this.handlesG!);
            this.render2.addClass(this.activeG, 'flow-custom-node');
            PlaitBoard.getElementActiveHost(this.board).append(this.activeG!);
        }
    }

    drawNode(element: FlowNode = this.element) {
        this.destroyElement();
        const drawCirclePoint = [element.points![0][0] + element.width / 2, element.points![0][1] + element.height / 2] as Point;
        this.nodeG = drawCircle(this.roughSVG, drawCirclePoint, 40, {
            fillStyle: 'solid',
            fill: 'rgb(238, 238, 238)',
            stroke: 'rgb(238, 238, 238)'
        });
    }
}
