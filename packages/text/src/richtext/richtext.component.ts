import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';
import { createEditor, Editor, Element, Text } from 'slate';
import { withHistory } from 'slate-history';
import { SlateEditableComponent, withAngular } from 'slate-angular';
import { withSingleLine } from '../plugins/with-single';
import { withMark } from '../plugins/with-marks';
import { MarkTypes } from '../constant/mark';
import { PlaitTextNodeComponent } from '../text-node/text.component';

@Component({
    selector: 'plait-richtext',
    templateUrl: './richtext.component.html'
})
export class PlaitRichtextComponent implements OnInit {
    @HostBinding('class') hostClass = 'plait-richtext-container';

    children: Element[] = [];

    @Input() set value(value: Element) {
        this.children = [value];
        this.cdr.markForCheck();
    }

    @Input() readonly = false;

    @ViewChild('slateEditable')
    slateEditable!: SlateEditableComponent;

    @Output()
    onChange: EventEmitter<Editor> = new EventEmitter();

    @Output()
    onComposition: EventEmitter<CompositionEvent> = new EventEmitter();

    editor = withMark(withSingleLine(withHistory(withAngular(createEditor()))));

    constructor(public renderer2: Renderer2, private cdr: ChangeDetectorRef, public elementRef: ElementRef<HTMLElement>) {}

    valueChange() {
        this.onChange.emit(this.editor);
    }

    ngOnInit(): void {
    }

    renderText: any = (text: Text): PlaitTextNodeComponent | null => {
        for (const key in MarkTypes) {
            if ((text as any)[(MarkTypes as any)[key]]) {
                return PlaitTextNodeComponent as any;
            }
        }
        return null;
    };

    compositionStart = (event: CompositionEvent) => {
        this.onComposition.emit(event);
    };

    compositionUpdate = (event: CompositionEvent) => {
        this.onComposition.emit(event);
    };

    compositionEnd = (event: CompositionEvent) => {
        this.onComposition.emit(event);
    };

    onKeydown = (event: KeyboardEvent) => {
        this.editor.onKeydown(event);
        console.log(`ccc`);
    }
}
