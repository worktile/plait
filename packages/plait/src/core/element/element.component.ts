import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';
import { PlaitElement } from '../../interfaces/element';
import { PlaitBoard } from '../../interfaces/board';
import { Selection } from '../../interfaces/selection';
import { createG } from '../../utils/dom';
import { Viewport } from '../../interfaces/viewport';

@Component({
    selector: 'plait-element',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitElementComponent implements OnInit, OnChanges, OnDestroy {
    initialized = false;

    groupG!: SVGGElement;

    @Input() index!: number;

    @Input() element!: PlaitElement;

    @Input() board!: PlaitBoard;

    @Input() selection: Selection | null = null;

    @Input() host!: SVGElement;

    constructor(public renderer2: Renderer2, public viewContainerRef: ViewContainerRef) {}

    ngOnInit(): void {
        this.initialize();
        this.drawElement();
    }

    initialize() {
        this.initialized = true;
        this.groupG = createG();
        this.renderer2.setAttribute(this.groupG, 'plait-element-group', this.index.toString());
        this.host.append(this.groupG);
    }

    drawElement() {
        const gArray = this.board.drawElement({ elementInstance: this });
        gArray.forEach(g => {
            this.groupG.appendChild(g);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.initialized) {
            this.board.redrawElement({ elementInstance: this }, changes);
        }
    }

    ngOnDestroy(): void {
        this.board.destroyElement();
        this.groupG.remove();
    }
}
