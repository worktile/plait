import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';

@Component({
    selector: 'plait-action',
    template: `
       
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitActionComponent implements OnInit, OnChanges, OnDestroy {
    @HostBinding('class') hostClass = `plait-icon`;

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {}

    ngOnDestroy(): void {}
}
