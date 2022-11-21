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
import { WORKFLOW_TRANSTION_KEY } from './constants';
import { drawRichtext } from '@plait/richtext';

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

    redrawElement() {
        this.drawLine();
        this.drawRichtext();
    }

    drawLine() {
        const transitionLine = this.workflowGGroup.querySelector(`.${WORKFLOW_TRANSTION_KEY}-line`);
        if (transitionLine) {
            transitionLine.remove();
        }
        const point = WorkflowQueries.getPointByTransition(this.board, this.node);
        const linkG = drawLineByTransitionType(this.board, this.roughSVG, point, this.node.type as WorkflowTransitionType);
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
