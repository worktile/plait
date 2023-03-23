import { ChangeDetectorRef } from '@angular/core';
import { PlaitBoard, PlaitBoardViewport } from '../interfaces';
import { RectangleClient } from '../interfaces/rectangle-client';

export interface BoardComponentInterface {
    markForCheck: () => void;
    scrollToRectangle: (client: RectangleClient) => void;
    updateViewport: (board: PlaitBoard) => void;
    applyViewport: (board: PlaitBoard) => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
}
