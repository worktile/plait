import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LinkElement } from '@plait/common';
import { BaseElementComponent } from 'slate-angular';

@Component({
    selector: 'a[plaitLink]',
    template: `
        <span contenteditable="false" class="link-break-char">{{ inlineChromiumBugfix }}</span>
        <span #outletParent></span>
        <span contenteditable="false" class="link-break-char">{{ inlineChromiumBugfix }}</span>
    `,
    host: {
        '[attr.href]': 'element.url',
        target: '_blank',
        class: 'plait-link-node'
    },
    standalone: true
})
export class PlaitLinkNodeComponent extends BaseElementComponent<LinkElement> implements OnInit {
    // Put this at the start and end of an inline component to work around this Chromium bug:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
    inlineChromiumBugfix = String.fromCodePoint(160);

    @ViewChild('outletParent', { read: ElementRef, static: true })
    outletParent!: ElementRef;

    getOutletParent = () => {
        return this.outletParent.nativeElement;
    };

    ngOnInit() {
        super.ngOnInit();
    }
}
