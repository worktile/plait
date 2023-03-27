import { ChangeDetectorRef } from '@angular/core';
import { PlaitBoardViewport } from '../interfaces';
import { RectangleClient } from '../interfaces/rectangle-client';

export interface BoardComponentInterface {
    markForCheck: () => void;
    applyViewport: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
    viewportState: PlaitBoardViewport;
}
