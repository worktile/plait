import { ChangeDetectorRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { PlaitBoardChangeEvent } from '../interfaces/board';

export interface BoardComponentInterface {
    markForCheck: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
    viewContainerRef: ViewContainerRef;
    plaitChange: EventEmitter<PlaitBoardChangeEvent>;
}
