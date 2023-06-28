import { Component, OnInit } from '@angular/core';
import { BaseElementComponent } from 'slate-angular';
import { LinkElement } from '../../custom-types';

@Component({
    selector: 'a[plaitLink]',
    template: `
        <span contenteditable="false" class="link-break-char">{{ inlineChromiumBugfix }}</span>
        <span><slate-children [children]="children" [context]="childrenContext" [viewContext]="viewContext"></slate-children></span>
        <span contenteditable="false" class="link-break-char">{{ inlineChromiumBugfix }}</span>
    `,
    host: {
        '[attr.href]': 'element.url',
        target: '_blank',
        class: 'plait-link-node'
    }
})
export class PlaitLinkNodeComponent extends BaseElementComponent<LinkElement> implements OnInit {
    // Put this at the start and end of an inline component to work around this Chromium bug:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
    inlineChromiumBugfix = String.fromCodePoint(160);

    ngOnInit() {
        super.ngOnInit();
    }
}
