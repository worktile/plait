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
    ViewChild,
    inject
} from '@angular/core';
import { isKeyHotkey } from 'is-hotkey';
import { Editor, Element, Text, Transforms, createEditor } from 'slate';
import { SlateEditable, withAngular } from 'slate-angular';
import { withHistory } from 'slate-history';
import { PlaitLinkNodeComponent } from '../plugins/link/link.component';
import { withMarkHotkey } from '../plugins/mark-hotkey/with-mark-hotkey';
import { withInlineMove } from '../plugins/with-inline-move';
import { withText } from '../plugins/with-text';
import { FormsModule } from '@angular/forms';
import { LinkElement, TextChangeData, TextPlugin } from '@plait/common';
import { CLIPBOARD_FORMAT_KEY, MarkTypes } from '@plait/text-plugins';
import { withPasteLink } from '../plugins/link/with-link-insert';
import { CommonModule } from '@angular/common';
import { PlaitBoard } from '@plait/core';
import { ParagraphFlavour } from '../plugins/paragraph/paragraph.flavour';
import { TextFlavour } from '../text-node/text.flavour';

@Component({
    selector: 'plait-text',
    templateUrl: './text.component.html',
    imports: [SlateEditable, FormsModule, CommonModule]
})
export class PlaitTextComponent implements OnInit, AfterViewInit {
    renderer2 = inject(Renderer2);
    private cdr = inject(ChangeDetectorRef);
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

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

    @Input()
    board!: PlaitBoard;

    editor = withInlineMove(withPasteLink(withMarkHotkey(withText(withHistory(withAngular(createEditor(), CLIPBOARD_FORMAT_KEY))))));

    nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor() {}

    valueChange() {
        this.onChange({ newText: this.editor.children[0] as Element, operations: this.editor.operations });
    }

    ngOnInit(): void {
        if (this.textPlugins) {
            this.textPlugins.forEach((plugin) => {
                plugin(this.editor);
            });
        }
        this.editor.board = this.board;
    }

    ngAfterViewInit(): void {
        this.afterInit && this.afterInit(this.editor);
    }

    renderElement = (element: Element) => {
        const render = this.editor.renderElement;
        if (render && render(element)) {
            return render(element);
        }

        if ((element as LinkElement).type === 'link') {
            return PlaitLinkNodeComponent;
        }

        return ParagraphFlavour;
    };

    renderText: any = (text: Text) => {
        for (const key in MarkTypes) {
            if ((text as any)[(MarkTypes as any)[key]]) {
                return TextFlavour;
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

    scrollSelectionIntoView = () => {
        // prevent auto scroll
    };
}
