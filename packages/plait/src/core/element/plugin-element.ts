import { Directive } from "@angular/core";
import { PlaitElement, PlaitPluginElementContext } from "../../interfaces";
import { ELEMENT_TO_PLUGIN_COMPONENT } from "../../utils/weak-maps";

@Directive()
export class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement> {
    private context!: PlaitPluginElementContext<T>;

    get element() {
        return this.context && this.context.element;
    }

    get selection() {
        return this.context && this.context.selection;
    }

    get board() {
        return this.context && this.context.board;
    }

    get host() {
        return this.context && this.context.host;
    }

    initializeContext(context: PlaitPluginElementContext<T>) {
        this.context = context;
        ELEMENT_TO_PLUGIN_COMPONENT.set(context.element, this);
    }
}