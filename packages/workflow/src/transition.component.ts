import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { WorkflowQueries } from './queries';
import { drawLineByTransitionType } from './draw/line';
import { WorkflowTransitionType } from './interfaces';
import { WorkflowBaseComponent } from './workflow-base.component';
import { WORKFLOW_NODE_PORT_RADIOUS, WORKFLOW_TRANSTION_KEY } from './constants';
import { drawRichtext } from '@plait/richtext';
import { Options } from 'roughjs/bin/core';

@Component({
    selector: 'plait-workflow-transition',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowTransitionComponent extends WorkflowBaseComponent implements OnInit, OnDestroy {
    constructor(
        public viewContainerRef: ViewContainerRef,
        public render2: Renderer2,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone
    ) {
        super(viewContainerRef, render2, cdr, elementRef, zone);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.render2.addClass(this.workflowGGroup, WORKFLOW_TRANSTION_KEY);
        this.drawLine();
        this.drawRichtext();
    }

    updateWorkflow() {
        super.updateWorkflow();
        this.drawLine();
        this.drawRichtext();
    }

    drawLine(options: Options = {}) {
        const transitionLine = this.workflowGGroup.querySelector(`.${WORKFLOW_TRANSTION_KEY}-line`);
        if (transitionLine) {
            transitionLine.remove();
        }
        const point = WorkflowQueries.getPointByTransition(this.board, this.node);
        const linkG = drawLineByTransitionType(this.board, this.roughSVG, point, this.node.type as WorkflowTransitionType, options);
        this.render2.addClass(linkG, WORKFLOW_TRANSTION_KEY + '-line');
        this.workflowGGroup.prepend(linkG!);
    }

    drawRichtext() {
        super.destroyRichtext();
        const textClient = WorkflowQueries.getRichtextRectByTranstion(this.board, this.node);
        if (textClient) {
            const { textX, textY, width, height } = textClient;
            const richtext = drawRichtext(textX, textY, width, height, this.node.value, this.viewContainerRef, [
                WORKFLOW_TRANSTION_KEY + '-' + this.node.type + '-text',
                WORKFLOW_TRANSTION_KEY + '-text'
            ]);
            if (richtext) {
                const { richtextG, richtextComponentRef, foreignObject } = richtext;
                this.richtextComponentRef = richtextComponentRef;
                this.richtextG = richtextG;
                this.foreignObject = foreignObject;
                this.render2.addClass(richtextG, 'richtext');
                this.workflowGGroup.append(richtextG);
            }
        }
    }

    drawActiveG(offsetX: number = 0, offsetY: number = 0, changePort?: 'start' | 'end' | null, options: Options = {}) {
        super.drawActiveG();
        const transitionLine = this.workflowGGroup.querySelector(`.${WORKFLOW_TRANSTION_KEY}-line`) as HTMLElement;
        transitionLine.style.opacity = '0';
        const point = WorkflowQueries.getPointByTransition(this.board, this.node);
        if (changePort && changePort === 'start') {
            point.startPoint = [point.startPoint![0] + offsetX, point.startPoint![1] + offsetY];
        }
        if (changePort && changePort === 'end') {
            point.endPoint = [point.endPoint![0] + offsetX, point.endPoint![1] + offsetY];
        }
        const selectedStrokeG = drawLineByTransitionType(this.board, this.roughSVG, point, this.node.type as WorkflowTransitionType, {
            stroke: '#4e8afa',
            ...options
        });
        selectedStrokeG!.style.pointerEvents = 'none';
        this.workflowGGroup.appendChild(selectedStrokeG!);
        this.activeG.push(selectedStrokeG!);

        // draw port
        if (this.node.type !== 'global') {
            let linkPorts = [point.endPoint];
            if (this.node.type === 'directed') {
                linkPorts.unshift(point.startPoint!);
            }
            const selectedLinkPort = linkPorts.map(port => {
                return this.roughSVG.circle(port![0], port![1], WORKFLOW_NODE_PORT_RADIOUS, {
                    stroke: '#6698FF',
                    strokeWidth: 2,
                    fill: 'transparent',
                    fillStyle: 'solid'
                });
            });
            selectedLinkPort.forEach(item => {
                this.render2.addClass(item, 'active-port');
                this.workflowGGroup.appendChild(item!);
                this.activeG.push(item!);
            });
        }

        // to do : draw text
    }

    destroyActiveG() {
        super.destroyActiveG();
        const transitionLine = this.workflowGGroup.querySelector(`.${WORKFLOW_TRANSTION_KEY}-line`) as HTMLElement;
        if (transitionLine) {
            transitionLine.style.opacity = '1';
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
