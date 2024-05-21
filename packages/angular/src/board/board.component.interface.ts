import { ChangeDetectorRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { AngularBoardChangeEvent } from '../interfaces/board';

export interface BoardComponentInterface {
    markForCheck: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
    viewContainerRef: ViewContainerRef;
    plaitChange: EventEmitter<AngularBoardChangeEvent>;
}
