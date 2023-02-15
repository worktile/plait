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
import { PlaitBoard } from '../../interfaces/board';
import { PlaitElement } from '../../interfaces/element';
import { Selection } from '../../interfaces/selection';
import { Viewport } from '../../interfaces/viewport';
import { createG } from '../../utils/dom';
import { PlaitPluginElementContext } from './context';

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

    @Input() viewport!: Viewport;

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
        const gArray = this.board.drawElement(this.getContext(), this.viewContainerRef);
        gArray.forEach(g => {
            this.groupG.appendChild(g);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.initialized) {
            this.board.redrawElement(this.getContext(), this.viewContainerRef, changes);
        }
    }

    getContext(): PlaitPluginElementContext {
        return {
            element: this.element,
            selection: this.selection,
            board: this.board,
            host: this.host,
        };
    }

    ngOnDestroy(): void {
        this.board.destroyElement(this.getContext());
        this.groupG.remove();
    }
}
