import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef,
    ElementRef,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    NgZone,
    HostBinding
} from '@angular/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { WorkflowElement } from './interfaces';
import { createG, HOST_TO_ROUGH_SVG, PlaitBoard, Selection } from '@plait/core';
import { WORKFLOW_KEY } from './constants';
import { PlaitRichtextComponent } from '@plait/richtext';
import { WORKFLOW_ACTIVE_ELEMENT, WORKFLOW_ELEMENT_TO_COMPONENT } from './plugins/weak-maps';
import { Subject } from 'rxjs';

@Component({
    selector: 'plait-workflow-base',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowBaseComponent implements OnInit, OnDestroy {
    @Input() node!: WorkflowElement;

    @Input() set selection(value: Selection | null) {
        this.updateActiveNode();
    }

    @Input() host!: SVGElement;

    @Input() board!: PlaitBoard;

    @Input() rootGroup!: SVGElement;

    roughSVG!: RoughSVG;

    workflowGGroup!: SVGGElement;

    foreignObject?: SVGForeignObjectElement;

    nodeG: SVGGElement | null = null;

    activeG: SVGGElement[] = [];

    richtextG?: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    destroy$: Subject<any> = new Subject();

    constructor(
        public viewContainerRef: ViewContainerRef,
        public render2: Renderer2,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone
    ) {
        this.workflowGGroup = createG();
        this.workflowGGroup.setAttribute(WORKFLOW_KEY, 'true');
        this.render2.addClass(this.workflowGGroup, 'workflow-element');
    }

    ngOnInit(): void {
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        WORKFLOW_ELEMENT_TO_COMPONENT.set(this.node, this);
        this.updateActiveNode();
        this.updateWorkflow(false);
    }

    drawRichtext() {
        this.destroyRichtext();
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
        }
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
    }

    updateWorkflow(doCheck = true) {
        WORKFLOW_ELEMENT_TO_COMPONENT.set(this.node, this);
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    updateActiveNode() {
        if (!this.workflowGGroup) {
            return;
        }
        const selected = WORKFLOW_ACTIVE_ELEMENT.get(this.board)?.id === this.node.id;
        if (selected) {
            this.render2.addClass(this.workflowGGroup, 'active');
            this.drawActiveG();
        } else {
            this.render2.removeClass(this.workflowGGroup, 'active');
        }
    }

    drawActiveG() {}

    doCheck() {
        this.cdr.markForCheck();
    }

    destroyNode() {
        if (this.nodeG) {
            this.nodeG.remove();
            this.nodeG = null;
        }
    }

    ngOnDestroy(): void {
        this.destroyRichtext();
        this.destroyNode();
        this.workflowGGroup.remove();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
