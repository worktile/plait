import { PlaitBoard, PlaitElement, Selection } from '../../interfaces';

export interface PlaitPluginElementContext<T extends PlaitElement = PlaitElement> {
    element: T;
    selection: Selection | null;
    board: PlaitBoard;
    host: SVGElement;
}
