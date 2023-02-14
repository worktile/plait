import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Input,
    OnDestroy,
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

@Component({
    selector: 'plait-workflow-base',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowBaseComponent implements OnDestroy {
    @Input() node!: FlowElement;

    @Input() set selection(value: Selection | null) {}

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
    ) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
