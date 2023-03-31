import { ChangeDetectorRef } from '@angular/core';

export interface BoardComponentInterface {
    markForCheck: () => void;
    cdr: ChangeDetectorRef;
    nativeElement: HTMLElement;
}
