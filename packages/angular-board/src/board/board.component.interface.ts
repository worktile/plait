import { ChangeDetectorRef, EventEmitter, Injector, ViewContainerRef } from '@angular/core';
import { OnChangeData } from '../plugins/angular-board';

export interface BoardComponentInterface {
    markForCheck: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
    viewContainerRef: ViewContainerRef;
    injector: Injector;
    onChange: EventEmitter<OnChangeData>;
}
