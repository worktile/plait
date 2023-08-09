import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';

export interface BoardComponentInterface {
    markForCheck: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
    viewContainerRef: ViewContainerRef;
}

export interface BoardElementHostInterface {
    host: SVGGElement;
    hostUp: SVGGElement;
    hostActive: SVGGElement;
}
