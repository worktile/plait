import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { PlaitBoard } from '../../interfaces/board';
import { PlaitElement } from '../../interfaces/element';
import { Selection } from '../../interfaces/selection';
import { Viewport } from '../../interfaces/viewport';
import { createG } from '../../utils/dom';
import { PlaitPluginElementContext } from './context';
import { PlaitPluginElementComponent } from './plugin-element';

@Component({
    selector: 'plait-element',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitElementComponent implements OnInit, OnChanges, OnDestroy {
    initialized = false;

    gGroup!: SVGGElement;

    instance?: PlaitPluginElementComponent<PlaitElement>;

    context?: PlaitPluginElementContext;

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
        this.gGroup = createG();
        this.renderer2.setAttribute(this.gGroup, 'plait-element-group', this.index.toString());
        this.host.append(this.gGroup);
    }

    drawElement() {
        const context = this.getContext();
        const result = this.board.drawElement(context.current);
        if (Array.isArray(result)) {
            result.forEach(g => {
                this.gGroup.appendChild(g);
            });
        } else {
            const componentRef = this.viewContainerRef.createComponent(result);
            const instance = componentRef.instance;
            instance.context = context.current;
            this.gGroup.appendChild(instance.g);
            this.instance = instance;
        }
    }

    ngOnChanges(): void {
        if (this.initialized) {
            const context = this.getContext();
            if (this.instance) {
                
                this.instance.context = context.current;
            }
            const result = this.board.redrawElement(context.current, context.previous);
            if (result && result.length > 0) {
                this.gGroup.childNodes.forEach(g => g.remove());
                result.forEach(g => {
                    this.gGroup.appendChild(g);
                });
            }
        }
    }

    getContext(): { current: PlaitPluginElementContext; previous?: PlaitPluginElementContext } {
        const current = {
            element: this.element,
            selection: this.selection,
            board: this.board,
            host: this.host
        };
        if (this.context) {
            const previous = { ...this.context };
            this.context = current;
            return { current, previous };
        } else {
            return { current };
        }
    }

    ngOnDestroy(): void {
        this.gGroup.remove();
        this.board.destroyElement(this.getContext().current);
    }
}
