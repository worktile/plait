import { ChangeDetectorRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { OnChangeData } from '../plugins/angular-board';

export interface BoardComponentInterface {
    markForCheck: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
    viewContainerRef: ViewContainerRef;
    onChange: EventEmitter<OnChangeData>;
}
