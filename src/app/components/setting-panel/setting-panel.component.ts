import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, forwardRef } from '@angular/core';
import {
    OnBoardChange,
    PlaitBoard,
    PlaitIslandBaseComponent,
    PlaitPointerType,
    Transforms,
    getSelectedElements
} from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { MindElement, MindPointerType, MindTransforms, canSetAbstract } from '@plait/mind';
import { FontSizes, MarkEditor, MarkTypes } from '@plait/text';

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

    currentTextColor: string | undefined = '';

    selectedElements!: MindElement[];

    PlaitPointerType = PlaitPointerType;

    MindPointerType = MindPointerType;

    textMark: MarkTypes[] = [];

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
            this.getTextMarks();
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
                MarkEditor.setColorMark(editor, value);
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
                MarkEditor.toggleMark(editor, attribute as MarkTypes);
            });
        }
    }

    setFontSize(event: Event) {
        if (this.selectedElements.length) {
            this.selectedElements.forEach(element => {
                const editor = MindElement.getEditor(element);
                MarkEditor.setFontSizeMark(editor, (event.target as HTMLSelectElement).value as FontSizes);
            });
        }
    }

    getTextMarks() {
        const marks = [MarkTypes.bold, MarkTypes.italic, MarkTypes.strike, MarkTypes.underline];
        const topicData = this.selectedElements[0].data.topic.children;
        this.textMark = [];
        topicData.forEach(data => {
            for (let key in data) {
                if (marks.includes(key as MarkTypes) && !this.textMark.includes(key as MarkTypes)) {
                    this.textMark.push(key as MarkTypes);
                }
            }
        });
    }
}
