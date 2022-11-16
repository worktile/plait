import { ChangeDetectionStrategy, Component, Input, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { createG, HOST_TO_ROUGH_SVG, PlaitBoard, Selection } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { WorkflowQueries } from './queries';
import { drawLinkByTransitionType } from './draw/link';
// import AStar from './utils/AStar';
import { WorkflowElement, WorkflowTransitionType } from './interfaces';
import { WORKFLOW_KEY } from './constants';

@Component({
    selector: 'plait-workflow-transition',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowTransitionComponent implements OnInit {
    @Input() node!: WorkflowElement;

    @Input() selection: Selection | null = null;

    @Input() host!: SVGElement;

    @Input() board!: PlaitBoard;

    gGroup!: SVGGElement;

    roughSVG!: RoughSVG;

    shapeG: SVGGElement | null = null;

    workflowGGroup!: SVGGElement;

    // aStar: AStar;

    constructor(private viewContainerRef: ViewContainerRef, private render2: Renderer2) {
        // this.aStar = new AStar();
        this.workflowGGroup = createG();
        this.workflowGGroup.setAttribute(WORKFLOW_KEY, 'true');
    }

    ngOnInit(): void {
        this.gGroup = createG();
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        this.workflowGGroup.prepend(this.gGroup);
        this.render2.addClass(this.gGroup, 'workflow-transition');
        this.drawShape();
    }

    drawShape() {
        this.destroyShape();
        const portsNode = WorkflowQueries.getPortsNodeByTransition(this.board, this.node);
        // to do: 根据开始和结束点画线
        // // const endPort = this.transition.to.port;
        // // console.log(this.transition, endNode.endPoint);
        // if (node.startPoint && this.transition.from.length) {
        //     // 开始节点
        //     // 结束节点
        //     const startNode = this.value.children.find(item => item.id === this.transition.from[0]?.id);
        //     const endNode = this.value.children.find(item => item.id === this.transition.to?.id);
        //     let { startPoint, endPoint, fakeStartPoint, fakeEndPoint, points } = computedProbablyPoints(
        //         node.startPoint,
        //         node.endPoint,
        //         startNode,
        //         endNode
        //     );
        //     // 画点
        //     points.forEach(item => {
        //         const point = this.roughSVG.circle(item[0], item[1], 5, { stroke: '#8069BF', strokeWidth: 2 });
        //         this.gGroup.prepend(point);
        //     });
        //     const routes = this.aStar.start(fakeStartPoint, fakeEndPoint, points);
        //     console.log(routes, 'routes');
        //     const linkG = this.roughSVG.linearPath(routes, {
        //         fillStyle: 'solid',
        //         stroke: '#999',
        //         strokeWidth: 2
        //     });
        //     this.gGroup.prepend(linkG);
        // } else {
        const linkG = drawLinkByTransitionType(this.roughSVG, portsNode, this.node.type as WorkflowTransitionType);
        if (linkG) {
            this.gGroup.prepend(linkG);
        }
        // }
        // if (node) {
        // this.shapeG = this.roughSVG.line(endNode.portPoints[0], endNode.portPoints[1], endNode.portPoints[0], endNode.portPoints[1] + 100);
        // this.workflowGGroup.prepend(this.gGroup);
        // this.shapeG = drawRectangleNode(this.roughSVG, this.node);
        // this.render2.addClass(this.shapeG, 'workflow-' + this.node.statusCategory);
    }

    destroyShape() {
        if (this.shapeG) {
            this.shapeG.remove();
            this.shapeG = null;
        }
    }
}
