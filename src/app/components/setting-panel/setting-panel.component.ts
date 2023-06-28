import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, forwardRef } from '@angular/core';
import { OnBoardChange, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, Transforms, getSelectedElements } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { MindElement, MindPointerType, MindTransforms, canSetAbstract } from '@plait/mind';
import { FontSizes, PlaitMarkEditor, MarkTypes, CustomText, LinkEditor } from '@plait/text';
import { Node, Transforms as SlateTransforms } from 'slate';

@Component({
    selector: 'app-setting-panel',
    templateUrl: './setting-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppSettingPanelComponent) }],
    host: {
        class: 'app-setting-panel plait-board-attached'
    }
})
export class AppSettingPanelComponent extends PlaitIslandBaseComponent implements OnBoardChange {
    currentFillColor: string | undefined = '';

    currentStrokeColor: string | undefined = '';

    currentBranchColor: string | undefined = '';

    currentMarks: Omit<CustomText, 'text'> = {};

    selectedElements!: MindElement[];

    PlaitPointerType = PlaitPointerType;

    MindPointerType = MindPointerType;

    markTypes = MarkTypes;

    fillColor = ['#333333', '#e48483', '#69b1e4', '#e681d4', '#a287e1', ''];

    textColorOptions = ['#333333', '#e03130', '#2f9e44', '#1871c2', '#f08c02', '#c18976'];

    strokeColor = ['#1e1e1e', '#e03130', '#2f9e44', '#1871c2', '#f08c02', '#c18976'];

    branchColor = ['#A287E0', '#6E80DB', '#E0B75E', '#B1C675', '#77C386', '#E48484'];

    @HostBinding('class.visible')
    get isVisible() {
        const selectedCount = getSelectedElements(this.board).length;
        if (selectedCount > 0) {
            return true;
        } else {
            return false;
        }
    }

    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    onBoardChange() {
        this.selectedElements = getSelectedElements(this.board) as MindElement[];
        if (this.selectedElements.length) {
            this.currentFillColor = this.selectedElements[0]?.fill || '';
            this.currentStrokeColor = this.selectedElements[0]?.strokeColor || '';
            this.currentBranchColor = this.selectedElements[0]?.branchColor || '';

            const editor = MindElement.getEditor(this.selectedElements[0]);
            this.currentMarks = PlaitMarkEditor.getMarks(editor);
        }
    }

    layoutChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindLayoutType;
        const selectedElement = this.selectedElements?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            MindTransforms.setLayout(this.board, value, path);
        }
    }

    propertyChange(event: Event, key: string) {
        let value = (event.target as HTMLSelectElement).value as any;
        if (key === 'branchWidth' || key === 'strokeWidth') {
            value = parseInt(value, 10);
        }

        const selectedElement = this.selectedElements?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            Transforms.setNode(this.board, { [key]: value }, path);
        }
    }

    colorChange(property: string | number | null, attribute: string) {
        if (this.selectedElements.length) {
            this.selectedElements.forEach(element => {
                const path = PlaitBoard.findPath(this.board, element);
                Transforms.setNode(this.board, { [attribute]: property }, path);
            });
        }
    }

    textColorChange(value: string) {
        if (this.selectedElements.length) {
            this.selectedElements.forEach(element => {
                const editor = MindElement.getEditor(element);
                PlaitMarkEditor.setColorMark(editor, value);
            });
        }
    }

    setAbstract(event: Event) {
        const ableSetAbstract = this.selectedElements.every(element => {
            return canSetAbstract(element);
        });

        if (ableSetAbstract) {
            MindTransforms.insertAbstract(this.board, this.selectedElements);
        }
    }

    setTextMark(event: MouseEvent, attribute: string) {
        event.preventDefault();
        event.stopPropagation();
        if (this.selectedElements.length) {
            this.selectedElements.forEach(element => {
                const editor = MindElement.getEditor(element);
                PlaitMarkEditor.toggleMark(editor, attribute as MarkTypes);
            });
        }
    }

    setLink(event: MouseEvent) {
        if (this.selectedElements.length) {
            const editor = MindElement.getEditor(this.selectedElements[0]);

            if (!editor.selection) {
                SlateTransforms.select(editor, [0]);
            }

            if (LinkEditor.isLinkActive(editor)) {
                LinkEditor.unwrapLink(editor);
                return;
            }

            const fragment = Node.fragment(editor, editor.selection!)[0];
            const selectNode = Node.get(fragment, []);
            const selectText = Node.string(selectNode);

            let name = selectText;
            if (!name) {
                name = window.prompt('输入链接文本名称') || '链接';
            }

            const link = window.prompt('输入链接');
            if (link) {
                LinkEditor.wrapLink(editor, name!, link!);
            }
        }
    }

    setFontSize(event: Event) {
        if (this.selectedElements.length) {
            this.selectedElements.forEach(element => {
                const editor = MindElement.getEditor(element);
                PlaitMarkEditor.setFontSizeMark(editor, (event.target as HTMLSelectElement).value as FontSizes);
            });
        }
    }
}
