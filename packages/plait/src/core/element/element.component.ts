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
import { PlaitPluginElementContext } from './context';
import { ELEMENT_TO_PLUGIN_COMPONENT, PlaitPluginElementComponent } from './plugin-element';
import { PlaitEffect } from '../children/effect';
import { Ancestor, PlaitNode } from '../../interfaces/node';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../../utils/weak-maps';
import { addSelectedElement, isSelectedElement, removeSelectedElement } from '../../utils';

@Component({
    selector: 'plait-element',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitElementComponent implements OnInit, OnChanges, OnDestroy {
    initialized = false;

    instance?: PlaitPluginElementComponent<PlaitElement>;

    @Input() index!: number;

    @Input() element!: PlaitElement;

    @Input() parent!: Ancestor;

    @Input() board!: PlaitBoard;

    @Input() effect?: PlaitEffect;

    @Input() parentG!: SVGGElement;

    constructor(public renderer2: Renderer2, public viewContainerRef: ViewContainerRef) {}

    ngOnInit(): void {
        this.initialize();
        this.drawElement();
    }

    initialize() {
        NODE_TO_INDEX.set(this.element, this.index);
        NODE_TO_PARENT.set(this.element, this.parent);
        this.initialized = true;
    }

    drawElement() {
        const context = this.getContext();
        const result = this.board.drawElement(context);
        if (Array.isArray(result)) {
        } else {
            const componentRef = this.viewContainerRef.createComponent(result);
            const instance = componentRef.instance;
            instance.context = context;
            this.insertG(instance.rootG ? instance.rootG : instance.g);
            this.instance = instance;
        }
    }

    insertG(g: SVGGElement) {
        if (PlaitBoard.isBoard(this.parent)) {
            this.parentG.prepend(g);
        } else {
            const parentComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(this.parent);
            let parentNodeG = parentComponent?.g as SVGGElement;
            let siblingG = parentNodeG;
            if (this.index > 0) {
                const brotherElement = (this.parent.children || [])[this.index - 1];
                const lastElement = PlaitNode.last(this.board, PlaitBoard.findPath(this.board, brotherElement));
                const lastComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(lastElement);
                if (lastComponent) {
                    siblingG = lastComponent.g;
                }
            }
            this.parentG.insertBefore(g, siblingG);
        }
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (this.initialized) {
            NODE_TO_INDEX.set(this.element, this.index);
            NODE_TO_PARENT.set(this.element, this.parent);
            const elementChanged = simpleChanges['element'];
            const context = this.getContext();
            if (elementChanged && isSelectedElement(this.board, elementChanged.previousValue)) {
                context.selected = true;
                removeSelectedElement(this.board, elementChanged.previousValue);
                addSelectedElement(this.board, this.element);
            }
            if (this.instance) {
                this.instance.context = context;
            }
        }
    }

    getContext(): PlaitPluginElementContext {
        const isSelected = isSelectedElement(this.board, this.element);
        const context: PlaitPluginElementContext = {
            element: this.element,
            board: this.board,
            selected: isSelected,
            effect: this.effect
        };
        return context;
    }

    ngOnDestroy(): void {
        this.board.destroyElement(this.getContext());
    }
}
