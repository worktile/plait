import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    OnInit,
    Renderer2,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { isKeyHotkey } from 'is-hotkey';
import { Editor, Element, Text, Transforms, createEditor } from 'slate';
import { SlateEditable, withAngular } from 'slate-angular';
import { withHistory } from 'slate-history';
import { PlaitLinkNodeComponent } from '../plugins/link/link.component';
import { withMarkHotkey } from '../plugins/mark-hotkey/with-mark-hotkey';
import { ParagraphElementComponent } from '../plugins/paragraph/paragraph.component';
import { PlaitTextEditor } from '../plugins/text.editor';
import { withSelection } from '../plugins/with-selection';
import { withSingleLine } from '../plugins/with-single';
import { PlaitTextNodeComponent } from '../text-node/text.component';
import { FormsModule } from '@angular/forms';
import { LinkElement, TextChangeData, TextPlugin } from '@plait/common';
import { CLIPBOARD_FORMAT_KEY, MarkTypes } from '@plait/text-plugins';
import { withPasteLink } from '../plugins/link/with-link-insert';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'plait-text',
    templateUrl: './text.component.html',
    standalone: true,
    imports: [SlateEditable, FormsModule, CommonModule]
})
export class PlaitTextComponent implements OnInit, AfterViewInit, OnChanges {
    @HostBinding('class') hostClass = 'plait-text-container';

    children: Element[] = [];

    @Input() textPlugins?: TextPlugin[];

    @Input() set text(text: Element) {
        this.children = [text];
        this.cdr.markForCheck();
    }

    @Input() readonly = true;

    @ViewChild('slateEditable')
    slateEditable!: SlateEditable;

    @Input()
    onChange!: (data: TextChangeData) => void;

    @Input()
    afterInit?: (editor: Editor) => void;

    @Input()
    onComposition!: (event: CompositionEvent) => void;

    editor = withSelection(withPasteLink(withMarkHotkey(withSingleLine(withHistory(withAngular(createEditor(), CLIPBOARD_FORMAT_KEY))))));

    nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(public renderer2: Renderer2, private cdr: ChangeDetectorRef, public elementRef: ElementRef<HTMLElement>) {}

    valueChange() {
        this.onChange({ newText: this.editor.children[0] as Element, operations: this.editor.operations });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
    }

    ngOnInit(): void {
        if (this.textPlugins) {
            this.textPlugins.forEach(plugin => {
                plugin(this.editor);
            });
        }
    }

    ngAfterViewInit(): void {
        this.afterInit && this.afterInit(this.editor);
    }

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
        this.onComposition(event);
    };

    compositionUpdate = (event: CompositionEvent) => {
        this.onComposition(event);
    };

    compositionEnd = (event: CompositionEvent) => {
        this.onComposition(event);
    };

    onKeydown = (event: KeyboardEvent) => {
        if (isKeyHotkey('mod+a', event)) {
            Transforms.select(this.editor, [0]);
            event.preventDefault();
        }
        this.editor.onKeydown(event);
    };
}
