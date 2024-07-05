import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject } from '@angular/core';
import { ForceAtlasNodeIconBaseComponent } from '@plait/graph-viz';

@Component({
    selector: 'force-atlas-node-icon',
    template: `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fit="" height="1em" width="1em" preserveAspectRatio="xMidYMid meet" focusable="false" fill="#fff"><g id="akjnormal/file-fill" stroke-width="1" fill-rule="evenodd"><path d="M10.22 1l4.295 4.286v.001l-4.296-.001V1zm.313 7.964a.568.568 0 0 0 0-1.138H5.982a.57.57 0 0 0 0 1.138h4.551zm.492 2.56a.567.567 0 0 0-.492-.853H5.982a.569.569 0 1 0 0 1.137h4.551a.567.567 0 0 0 .492-.284zm3.487-5.404l.003.03v7.362a1.138 1.138 0 0 1-1.133 1.141H3.133A1.137 1.137 0 0 1 2 13.513V2.138A1.137 1.137 0 0 1 3.134 1h6.261v3.98c0 .63.51 1.14 1.139 1.14h3.978z" id="akj形状结合"></path></g></svg>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent extends ForceAtlasNodeIconBaseComponent implements OnInit {
    elementRef = inject(ElementRef<HTMLElement>);

    nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    ngOnInit(): void {
        super.initialize();
    }
}
