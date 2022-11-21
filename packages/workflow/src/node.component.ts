import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';
import { BaseCursorStatus, createG, HOST_TO_ROUGH_SVG, PlaitBoard, Selection } from '@plait/core';
import { drawRichtext, PlaitRichtextComponent } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WORKFLOW_KEY, WORKFLOW_PORT_KEY, WORKFLOW_START_RADIOUS } from './constants';
import { drawCircleNode, drawLinkPorts, drawRectangleNode } from './draw/shape';
import { isWorkflowNode, WorkflowElement } from './interfaces';
import { getCircleRichtext, getRectangleRichtext } from './utils';
import { WorkflowBaseComponent } from './workflow-base.component';

@Component({
    selector: 'plait-workflow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowNodeComponent extends WorkflowBaseComponent implements OnInit, OnDestroy {
    portGGroup!: SVGGElement;

    public get cursorMove(): boolean {
        return this.board.cursor === BaseCursorStatus.move;
    }

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
        this.render2.addClass(this.workflowGGroup, 'workflow-node');
        this.drawNode();
        this.drawRichtext();
        this.drawLinkPorts();
        this.zone.runOutsideAngular(() => {
            fromEvent(document, 'mouseover')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                    if (this.workflowGGroup.contains(event.target as HTMLElement)) {
                        this.setportGroupDisplay('block');
                    }
                });
            fromEvent(this.workflowGGroup, 'mouseout')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                    if (!(event.target as HTMLElement).closest('.' + WORKFLOW_PORT_KEY)) {
                        this.setportGroupDisplay('none');
                    }
                });
        });
    }

    drawNode() {
        this.destroyNode();
        if (isWorkflowNode(this.node)) {
            this.nodeG = drawRectangleNode(this.roughSVG, this.node);
            this.render2.addClass(this.nodeG, 'workflow-' + this.node.type);
        } else {
            this.nodeG = drawCircleNode(this.roughSVG as RoughSVG, this.node, WORKFLOW_START_RADIOUS, {
                stroke: '#8069BF',
                strokeWidth: 2
            });
            this.render2.addClass(this.nodeG, 'workflow-origin');
        }
        this.workflowGGroup.append(this.nodeG);
    }

    updateWorkflow() {
        super.updateWorkflow();
        if (this.portGGroup) {
            this.portGGroup.remove();
        }
        this.drawNode();
        this.drawRichtext();
        this.drawLinkPorts();
    }

    drawLinkPorts() {
        this.portGGroup = createG();
        this.portGGroup.classList.add(WORKFLOW_PORT_KEY + '-group');
        this.workflowGGroup.append(this.portGGroup);
        const linkPorts = drawLinkPorts(this.roughSVG, this.node);
        linkPorts.map(linkPort => {
            fromEvent(linkPort, 'mouseout')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                    this.setportGroupDisplay('none');
                });
            this.portGGroup.append(linkPort);
            this.render2.addClass(linkPort, WORKFLOW_PORT_KEY);
        });
    }

    drawRichtext() {
        super.drawRichtext();
        let textClient = null;
        let richtextClasses = [WORKFLOW_KEY + '-text'];
        if (isWorkflowNode(this.node)) {
            textClient = getRectangleRichtext(this.node);
            richtextClasses.push(WORKFLOW_KEY + '-node-text');
        } else {
            textClient = getCircleRichtext(this.node);
            richtextClasses.push(WORKFLOW_KEY + '-origin-text');
        }
        const { textX, textY, width, height } = textClient;
        const richtext = drawRichtext(textX, textY, width, height, this.node.value, this.viewContainerRef, richtextClasses);
        if (richtext) {
            const { richtextG, richtextComponentRef, foreignObject } = richtext;
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = richtextG;
            this.foreignObject = foreignObject;
            this.render2.addClass(richtextG, WORKFLOW_KEY + '-richtext');
            this.workflowGGroup.append(richtextG);
        }
    }

    setportGroupDisplay(value: 'none' | 'block') {
        this.render2.setStyle(this.portGGroup, 'display', value);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
