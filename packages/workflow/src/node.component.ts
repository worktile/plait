import { ChangeDetectionStrategy, Component, ComponentRef, Input, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { BaseCursorStatus, createG, HOST_TO_ROUGH_SVG, PlaitBoard, Selection } from '@plait/core';
import { drawRichtext, PlaitRichtextComponent } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { Subject } from 'rxjs';
import { WORKFLOW_KEY, WORKFLOW_START_RADIOUS } from './constants';
import { getRichtextCircleByNode, getRichtextRectangleByNode } from './draw/richtext';
import { drawCircleNode, drawLinkPorts, drawRectangleNode } from './draw/shape';
import { isWorkflowNode, WorkflowElement } from './interfaces';

@Component({
    selector: 'plait-workflow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowNodeComponent implements OnInit, OnDestroy {
    roughSVG!: RoughSVG;

    gGroup!: SVGGElement;

    portGGroup!: SVGGElement;

    @Input() node!: WorkflowElement;

    @Input() selection: Selection | null = null;

    @Input() host!: SVGElement;

    @Input() board!: PlaitBoard;

    workflowGGroup!: SVGGElement;

    activeG: SVGGElement[] = [];

    shapeG: SVGGElement | null = null;

    richtextG?: SVGGElement;

    foreignObject?: SVGForeignObjectElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    destroy$: Subject<any> = new Subject();

    public get cursorMove(): boolean {
        return this.board.cursor === BaseCursorStatus.move;
    }

    constructor(private viewContainerRef: ViewContainerRef, private render2: Renderer2) {
        this.workflowGGroup = createG();
        this.workflowGGroup.setAttribute(WORKFLOW_KEY, 'true');
    }

    ngOnInit(): void {
        this.gGroup = createG();
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        this.insertGroup();
        this.drawNode();
        this.drawRichtext();
    }

    insertGroup() {
        this.workflowGGroup.prepend(this.gGroup);
        this.render2.addClass(this.gGroup, 'workflow-node');
    }

    drawNode() {
        this.destroyShape();
        if (isWorkflowNode(this.node)) {
            this.shapeG = drawRectangleNode(this.roughSVG, this.node);
            this.render2.addClass(this.shapeG, 'workflow-' + this.node.type);
        } else {
            this.shapeG = drawCircleNode(this.roughSVG as RoughSVG, this.node, WORKFLOW_START_RADIOUS, {
                stroke: '#8069BF',
                strokeWidth: 2
            });
            this.render2.addClass(this.shapeG, 'workflow-origin');
        }
        this.gGroup.append(this.shapeG);
    }

    drawLinkPorts() {
        this.portGGroup = createG();
        this.portGGroup.classList.add('port-group');
        this.gGroup.append(this.portGGroup);
        const linkPorts = drawLinkPorts(this.roughSVG, this.node);
        linkPorts.map(linkPort => {
            this.portGGroup.append(linkPort);
            this.render2.addClass(linkPort, 'port');
        });
    }

    destroyShape() {
        if (this.shapeG) {
            this.shapeG.remove();
            this.shapeG = null;
        }
    }

    drawRichtext() {
        this.destroyRichtext();
        let textClient = null;
        let richtextClass = '';
        if (isWorkflowNode(this.node)) {
            textClient = getRichtextRectangleByNode(this.node);
            richtextClass = 'workflow-text-circle-node';
        } else {
            textClient = getRichtextCircleByNode(this.node);
            richtextClass = 'workflow-text-circle-node';
        }
        const { textX, textY, width, height } = textClient;
        const richtext = drawRichtext(textX, textY, width, height, this.node.value, this.viewContainerRef, [richtextClass]);
        if (richtext) {
            const { richtextG, richtextComponentRef, foreignObject } = richtext;
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = richtextG;
            this.foreignObject = foreignObject;
            this.render2.addClass(richtextG, 'richtext');
            this.gGroup.append(richtextG);
        }
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
        }
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
    }

    ngOnDestroy(): void {
        this.destroyRichtext();
        this.gGroup.remove();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
