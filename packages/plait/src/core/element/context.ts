import { PlaitBoard, PlaitElement, Range } from '../../interfaces';

export interface PlaitPluginElementContext<T extends PlaitElement = PlaitElement> {
    element: T;
    selection: Range | null;
    board: PlaitBoard;
}
