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
    NgZone
} from '@angular/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { FlowElement } from './interfaces';
import { createG, HOST_TO_ROUGH_SVG, PlaitBoard, Selection } from '@plait/core';
import { FLOW_KEY } from './constants';
import { PlaitRichtextComponent } from '@plait/richtext';
import { Subject } from 'rxjs';
import { FLOW_ACTIVE_ELEMENT, FLOW_ELEMENT_TO_COMPONENT } from './plugins/weak-maps';

@Component({
    selector: 'plait-workflow-base',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowBaseComponent implements OnInit, OnDestroy {
    @Input() node!: FlowElement;

    @Input() set selection(value: Selection | null) {
        this.updateActiveNode();
    }

    @Input() host!: SVGElement;

    @Input() board!: PlaitBoard;

    @Input() rootGroup!: SVGElement;

    roughSVG!: RoughSVG;

    flowGGroup!: SVGGElement;

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
        this.flowGGroup = createG();
        this.flowGGroup.setAttribute(FLOW_KEY, 'true');
        this.render2.addClass(this.flowGGroup, 'workflow-element');
    }

    ngOnInit(): void {
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        FLOW_ELEMENT_TO_COMPONENT.set(this.node, this);
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
        FLOW_ELEMENT_TO_COMPONENT.set(this.node, this);
        this.destroyActiveG();
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    updateActiveNode() {
        if (!this.flowGGroup) {
            return;
        }
        const selected = FLOW_ACTIVE_ELEMENT.get(this.board)?.id === this.node.id;
        if (selected) {
            this.render2.addClass(this.flowGGroup, 'active');
            this.drawActiveG();
        } else {
            this.render2.removeClass(this.flowGGroup, 'active');
            this.destroyActiveG();
        }
    }

    drawActiveG() {
        this.destroyActiveG();
    }

    destroyActiveG() {
        this.activeG.forEach(g => g.remove());
        this.activeG = [];
    }

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
        this.flowGGroup.remove();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
