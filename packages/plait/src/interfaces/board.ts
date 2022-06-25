import { SimpleChanges } from '@angular/core';
import { CursorStatus } from './cursor';
import { PlaitElement } from './element';
import { PlaitElementContext } from './element-context';
import { PlaitOperation } from './operation';
import { Selection } from './selection';
import { Viewport } from './viewport';

export interface PlaitBoard {
    host: SVGElement;
    viewport: Viewport;
    children: PlaitElement[];
    operations: PlaitOperation[];
    selection: Selection | null;
    cursor: CursorStatus;
    apply: (operation: PlaitOperation) => void;
    onChange: () => void;
    mousedown: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    keydown: (event: KeyboardEvent) => void;
    keyup: (event: KeyboardEvent) => void;
    dblclick: (event: MouseEvent) => void;
    drawElement: (context: PlaitElementContext) => SVGGElement[];
    redrawElement: (context: PlaitElementContext, changes: SimpleChanges) => SVGGElement[];
    destroyElement: () => void;
}
