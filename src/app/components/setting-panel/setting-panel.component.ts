import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, forwardRef } from '@angular/core';
import {
    PlaitBoard,
    PlaitElement,
    PlaitPointerType,
    Transforms,
    getSelectedElements,
    getSelectionAngle,
    degreesToRadians,
    radiansToDegrees,
    rotateElements,
    canSetZIndex,
    Path
} from '@plait/core';

import {
    MindElement,
    MindPointerType,
    MindTransforms,
    canSetAbstract,
    getDefaultMindElementFontSize,
    getSelectedMindElements
} from '@plait/mind';
import { Node, Transforms as SlateTransforms } from 'slate';
import { AppColorPickerComponent } from '../color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AlignTransform, Alignment, CustomText, ParagraphElement, PropertyTransforms, getEditingTextEditor, getFirstTextEditor } from '@plait/common';
import {
    LineShape,
    LineMarkerType,
    getSelectedLineElements,
    isSingleSelectSwimlane,
    getSelectedGeometryElements,
    getSelectedImageElements,
    GeometryShapes,
    DrawTransforms,
    getMemorizeKey,
    LineHandleKey,
    PlaitSwimlane,
    isDrawElementsIncludeText,
    isDrawElementIncludeText,
    getSelectedDrawElements,
    getSelectedTableElements,
    getGeometryAlign,
    PlaitDrawElement,
    getSwimlaneCount
} from '@plait/draw';
import { MindLayoutType } from '@plait/layouts';
import { FontSizes, LinkEditor, MarkTypes, PlaitMarkEditor, TextTransforms } from '@plait/text-plugins';
import { OnBoardChange, PlaitIslandBaseComponent } from '@plait/angular-board';

@Component({
    selector: 'app-setting-panel',
    templateUrl: './setting-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppSettingPanelComponent) }],
    host: {
        class: 'app-setting-panel plait-board-attached'
    },
    standalone: true,
    imports: [NgClass, NgIf, FormsModule, AppColorPickerComponent]
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

    isSelectSwimlane = false;

    isIncludeText = false;

    canSetZIndex = false;

    fillColor = ['#333333', '#e48483', '#69b1e4', '#e681d4', '#a287e1', ''];

    textColorOptions = ['#333333', '#e03130', '#2f9e44', '#1871c2', '#f08c02', '#c18976'];

    strokeColor = ['#1e1e1e', '#e03130', '#2f9e44', '#1871c2', '#f08c02', '#c18976'];

    branchColor = ['#A287E0', '#6E80DB', '#E0B75E', '#B1C675', '#77C386', '#E48484'];

    align = Alignment.center;

    lineShape = LineShape.straight;

    lineTargetMarker = LineMarkerType.openTriangle;

    lineSourceMarker = LineMarkerType.openTriangle;

    swimlaneOperation = 'addRow';

    strokeWidth = 3;

    angle = 0;

    swimlaneCount = 3;

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
        this.isSelectSwimlane = isSingleSelectSwimlane(this.board);
        if (this.isSelectSwimlane) {
            this.swimlaneCount = getSwimlaneCount(getSelectedElements(this.board)[0] as PlaitSwimlane);
        }
        this.canSetZIndex = canSetZIndex(this.board);
        if (selectedMindElements.length) {
            const firstMindElement = selectedMindElements[0];
            this.currentFillColor = firstMindElement.fill || '';
            this.currentStrokeColor = firstMindElement.strokeColor || '';
            this.currentBranchColor = firstMindElement.branchColor || '';
            this.strokeWidth = firstMindElement.strokeWidth || 3;
            if (PlaitElement.hasMounted(firstMindElement)) {
                this.currentMarks = PlaitMarkEditor.getMarks(getFirstTextEditor(firstMindElement));
                this.align = firstMindElement.data.topic.align || Alignment.left;
            }
        }

        const selectedGeometryElements = getSelectedGeometryElements(this.board);
        const selectedTableElements = getSelectedTableElements(this.board);
        const selectedTableAndGeometryElements = [...selectedGeometryElements, ...selectedTableElements];
        if (selectedTableAndGeometryElements.length) {
            const firstGeometry = selectedTableAndGeometryElements.find(item => isDrawElementIncludeText(item));
            if (firstGeometry && PlaitElement.hasMounted(firstGeometry)) {
                this.currentMarks = PlaitMarkEditor.getMarks(getFirstTextEditor(firstGeometry));
                this.align = getGeometryAlign(this.board, firstGeometry);
            }
            setTimeout(() => {
                const editor = firstGeometry && getEditingTextEditor(this.board, [firstGeometry]);
                const isEditing = !!editor;
                if (isEditing) {
                    this.align = (editor.children[0] as ParagraphElement)?.align || this.align;
                    this.currentMarks = PlaitMarkEditor.getMarks(editor);
                    this.cdr.markForCheck();
                }
            });
            this.strokeWidth = firstGeometry?.strokeWidth || 3;
        }

        const selectedImageElements = getSelectedImageElements(this.board);
        const selectedElements = [...selectedImageElements, ...selectedGeometryElements];
        const selectionAngle = getSelectionAngle(selectedElements);
        this.angle = Math.round(radiansToDegrees(selectionAngle));
        if (selectedLineElements.length) {
            const firstLine = selectedLineElements[0];
            this.lineShape = firstLine.shape;
            this.lineTargetMarker = firstLine.target.marker;
            this.lineSourceMarker = firstLine.source.marker;
            this.strokeWidth = firstLine.strokeWidth || 3;
            if (isDrawElementIncludeText(firstLine)) {
                this.currentMarks = PlaitMarkEditor.getMarks(getFirstTextEditor(firstLine)) || {};
            }
            setTimeout(() => {
                const editor = getEditingTextEditor(this.board, [firstLine]);
                this.currentMarks = (editor && PlaitMarkEditor.getMarks(editor)) || {};
                this.cdr.markForCheck();
            });
        }
        const selectedDrawElements = getSelectedDrawElements(this.board);
        this.isIncludeText = selectedMindElements.length ? true : isDrawElementsIncludeText(selectedDrawElements);
    }

    layoutChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindLayoutType;
        MindTransforms.setLayout(this.board, value);
    }

    switchGeometryShape(event: Event, key: string) {
        let shape = (event.target as HTMLSelectElement).value as GeometryShapes;
        DrawTransforms.switchGeometryShape(this.board, shape);
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

    setLineShape(event: Event) {
        let value = (event.target as HTMLSelectElement).value as LineShape;
        DrawTransforms.setLineShape(this.board, { shape: value });
    }

    changeStrokeStyle(event: Event) {
        let value = (event.target as HTMLSelectElement).value;
        PropertyTransforms.setStrokeStyle(this.board, value, { getMemorizeKey });
    }

    changeFill(property: string) {
        PropertyTransforms.setFillColor(this.board, property, {
            getMemorizeKey,
            callback: (element: PlaitElement, path: Path) => {
                const isSwimlane = PlaitDrawElement.isSwimlane(element);
                if (isSwimlane) {
                    DrawTransforms.setSwimlaneFill(this.board, element as PlaitSwimlane, property, path);
                } else {
                    Transforms.setNode(this.board, { fill: property }, path);
                }
            }
        });
    }

    changeStroke(property: string) {
        PropertyTransforms.setStrokeColor(this.board, property, { getMemorizeKey });
    }

    changeStrokeWidth(event: Event) {
        let value = parseInt((event.target as HTMLSelectElement).value, 10);
        PropertyTransforms.setStrokeWidth(this.board, value, { getMemorizeKey });
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

    changeLineMarker(event: Event, key: string) {
        let value = (event.target as HTMLSelectElement).value as any;
        DrawTransforms.setLineMark(this.board, key as LineHandleKey, value as LineMarkerType);
    }

    changeAngle() {
        const selectedElements = getSelectedElements(this.board);
        const originAngle = getSelectionAngle(selectedElements);
        rotateElements(this.board, selectedElements, degreesToRadians(this.angle) - originAngle);
    }

    textColorChange(value: string) {
        TextTransforms.setTextColor(this.board, value);
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
        TextTransforms.setTextMarks(this.board, attribute as MarkTypes);
    }

    setLink(event: MouseEvent) {
        const selectedElements = getSelectedElements(this.board) as MindElement[];
        if (selectedElements.length) {
            const editor = getFirstTextEditor(selectedElements[0]);

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
        const fontSize = (event.target as HTMLSelectElement).value as FontSizes;
        TextTransforms.setFontSize(this.board, fontSize, (element: PlaitElement) => {
            return MindElement.isMindElement(this.board, element) ? getDefaultMindElementFontSize(this.board, element) : undefined;
        });
    }

    setTextAlign(event: Alignment) {
        TextTransforms.setTextAlign(this.board, event);
    }

    setAlign(event: Event) {
        const value = (event.target as HTMLSelectElement).value as any;
        AlignTransform[value as keyof AlignTransform](this.board);
    }

    moveUp(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.moveUp(this.board);
    }

    moveDown(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.moveDown(this.board);
    }

    moveToTop(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.moveToTop(this.board);
    }

    moveToBottom(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.moveToBottom(this.board);
    }

    updateSwimlaneCount() {
        const selectedElements = getSelectedElements(this.board) as PlaitSwimlane[];
        DrawTransforms.updateSwimlaneCount(this.board, selectedElements[0], this.swimlaneCount);
    }
}
