import {
    AfterViewInit,
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
import { isKeyHotkey } from 'is-hotkey';
import { Editor, Element, Text, Transforms, createEditor } from 'slate';
import { SlateEditable, withAngular } from 'slate-angular';
import { withHistory } from 'slate-history';
import { CLIPBOARD_FORMAT_KEY } from '../constant';
import { MarkTypes } from '../constant/mark';
import { LinkElement, TextPlugin } from '../custom-types';
import { PlaitLinkNodeComponent } from '../plugins/link/link.component';
import { withLink } from '../plugins/link/with-link';
import { withMark } from '../plugins/mark/with-marks';
import { ParagraphElementComponent } from '../plugins/paragraph/paragraph.component';
import { PlaitTextEditor } from '../plugins/text.editor';
import { withSelection } from '../plugins/with-selection';
import { withSingleLine } from '../plugins/with-single';
import { PlaitTextNodeComponent } from '../text-node/text.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'plait-richtext',
    templateUrl: './richtext.component.html',
    standalone: true,
    imports: [SlateEditable, FormsModule]
})
export class PlaitRichtextComponent implements OnInit, AfterViewInit {
    @HostBinding('class') hostClass = 'plait-richtext-container';

    children: Element[] = [];

    @Input() textPlugins: TextPlugin[] = [];

    @Input() set value(value: Element) {
        this.children = [value];
        this.cdr.markForCheck();
    }

    @Input() readonly = false;

    @ViewChild('slateEditable')
    slateEditable!: SlateEditable;

    @Output()
    onChange: EventEmitter<Editor> = new EventEmitter();

    @Output()
    onComposition: EventEmitter<CompositionEvent> = new EventEmitter();

    editor = withSelection(withLink(withMark(withSingleLine(withHistory(withAngular(createEditor(), CLIPBOARD_FORMAT_KEY))))));

    constructor(public renderer2: Renderer2, private cdr: ChangeDetectorRef, public elementRef: ElementRef<HTMLElement>) {}

    valueChange() {
        this.onChange.emit(this.editor);
    }

    ngOnInit(): void {
        this.textPlugins.forEach(plugin => {
            plugin(this.editor);
        });
    }

    ngAfterViewInit(): void {}

    renderElement = (element: Element) => {
        const render = ((this.editor as unknown) as PlaitTextEditor)?.renderElement;
        if (render && render(element)) {
            return render(element);
        }

        if ((element as LinkElement).type === 'link') {
            return PlaitLinkNodeComponent;
        }

        return ParagraphElementComponent;
    };

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
        if (isKeyHotkey('mod+a', event)) {
            Transforms.select(this.editor, [0]);
            event.preventDefault();
        }
        this.editor.onKeydown(event);
    };
}
