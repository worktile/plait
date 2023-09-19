import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, forwardRef } from '@angular/core';
import { OnBoardChange, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, Transforms, getSelectedElements } from '@plait/core';
import { LineShape, PlaitDrawElement, PlaitGeometry, PlaitLine, getSelectedGeometryElements, getSelectedLineElements } from '@plait/draw';
import { MindLayoutType } from '@plait/layouts';
import { MindElement, MindPointerType, MindTransforms, canSetAbstract, getSelectedMindElements } from '@plait/mind';
import { FontSizes, PlaitMarkEditor, MarkTypes, CustomText, LinkEditor, AlignEditor, Alignment } from '@plait/text';
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

    PlaitPointerType = PlaitPointerType;

    MindPointerType = MindPointerType;

    markTypes = MarkTypes;

    isSelectedMind = false;

    isSelectedLine = false;

    fillColor = ['#333333', '#e48483', '#69b1e4', '#e681d4', '#a287e1', ''];

    textColorOptions = ['#333333', '#e03130', '#2f9e44', '#1871c2', '#f08c02', '#c18976'];

    strokeColor = ['#1e1e1e', '#e03130', '#2f9e44', '#1871c2', '#f08c02', '#c18976'];

    branchColor = ['#A287E0', '#6E80DB', '#E0B75E', '#B1C675', '#77C386', '#E48484'];

    align = Alignment.center;

    lineShape = LineShape.straight;

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
        const selectedMindElements = getSelectedMindElements(this.board);
        const selectedLineElements = getSelectedLineElements(this.board);
        this.isSelectedMind = !!selectedMindElements.length;
        this.isSelectedLine = !!selectedLineElements.length;
        if (selectedMindElements.length) {
            const firstMindElement = selectedMindElements[0];
            this.currentFillColor = firstMindElement.fill || '';
            this.currentStrokeColor = firstMindElement.strokeColor || '';
            this.currentBranchColor = firstMindElement.branchColor || '';

            if (MindElement.hasMounted(firstMindElement)) {
                this.currentMarks = PlaitMarkEditor.getMarks(MindElement.getTextEditor(firstMindElement));
                this.align = firstMindElement.data.topic.align || Alignment.left;
            }
        }

        const selectedGeometryElements = getSelectedGeometryElements(this.board);
        if (selectedGeometryElements.length) {
            const firstGeometry = selectedGeometryElements[0];
            this.align = firstGeometry.text.align || Alignment.center;
        }

        if (selectedLineElements.length) {
            const firstLine = selectedLineElements[0];
            this.lineShape = firstLine.shape;
        }
    }

    layoutChange(event: Event) {
        const selectedElements = getSelectedElements(this.board) as MindElement[];
        const value = (event.target as HTMLSelectElement).value as MindLayoutType;
        const selectedElement = selectedElements?.[0];
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
        const selectedElement = getSelectedElements(this.board)[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            Transforms.setNode(this.board, { [key]: value }, path);
        }
    }

    colorChange(property: string | number | null, attribute: string) {
        const selectedElements = getSelectedElements(this.board);

        if (selectedElements.length) {
            selectedElements.forEach(element => {
                const path = PlaitBoard.findPath(this.board, element);
                Transforms.setNode(this.board, { [attribute]: property }, path);
            });
        }
    }

    textColorChange(value: string) {
        const selectedElements = getSelectedElements(this.board);
        if (selectedElements.length) {
            selectedElements.forEach(element => {
                if (PlaitDrawElement.isLine(element)) {
                    const editors = PlaitLine.getTextEditors(element);
                    editors.forEach(editor => PlaitMarkEditor.setColorMark(editor, value));
                } else {
                    const editor = MindElement.getTextEditor(element as MindElement);
                    PlaitMarkEditor.setColorMark(editor, value);
                }
            });
        }
    }

    setAbstract(event: Event) {
        const selectedElements = getSelectedElements(this.board) as MindElement[];

        const ableSetAbstract = selectedElements.every(element => {
            return canSetAbstract(element);
        });

        if (ableSetAbstract) {
            MindTransforms.insertAbstract(this.board, selectedElements);
        }
    }

    setTextMark(event: MouseEvent, attribute: string) {
        event.preventDefault();
        event.stopPropagation();
        const selectedElements = getSelectedElements(this.board) as MindElement[];
        if (selectedElements.length) {
            selectedElements.forEach(element => {
                if (PlaitDrawElement.isLine(element)) {
                    const editors = PlaitLine.getTextEditors(element);
                    editors.forEach(editor => PlaitMarkEditor.toggleMark(editor, attribute as MarkTypes));
                } else {
                    const editor = MindElement.getTextEditor(element as MindElement);
                    PlaitMarkEditor.toggleMark(editor, attribute as MarkTypes);
                }
            });
        }
    }

    setLink(event: MouseEvent) {
        const selectedElements = getSelectedElements(this.board) as MindElement[];

        if (selectedElements.length) {
            const editor = MindElement.getTextEditor(selectedElements[0]);

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
        const selectedElements = getSelectedElements(this.board) as MindElement[];
        const fontSize = (event.target as HTMLSelectElement).value as FontSizes;
        if (selectedElements.length) {
            selectedElements.forEach(element => {
                if (PlaitDrawElement.isLine(element)) {
                    const editors = PlaitLine.getTextEditors(element);
                    editors.forEach(editor => PlaitMarkEditor.setFontSizeMark(editor, fontSize));
                } else {
                    const editor = MindElement.getTextEditor(element as MindElement);
                    PlaitMarkEditor.setFontSizeMark(editor, fontSize);
                }
            });
        }
    }

    setAlign(event: Alignment) {
        const selectedMindElements = getSelectedMindElements(this.board);
        if (selectedMindElements.length) {
            selectedMindElements.forEach(element => {
                const editor = MindElement.getTextEditor(element);
                AlignEditor.setAlign(editor, event as Alignment);
            });
        }
        const selectedGeometryElements = getSelectedGeometryElements(this.board);
        if (selectedGeometryElements.length) {
            selectedGeometryElements.forEach(element => {
                const editor = PlaitGeometry.getTextEditor(element);
                AlignEditor.setAlign(editor, event);
            });
        }
        const selectedLineElements = getSelectedLineElements(this.board);
        if (selectedLineElements.length) {
            selectedLineElements.forEach(element => {
                const editors = PlaitLine.getTextEditors(element);
                editors.forEach(editor => AlignEditor.setAlign(editor, event));
            });
        }
    }
}
