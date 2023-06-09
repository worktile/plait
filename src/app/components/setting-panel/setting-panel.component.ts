import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, forwardRef } from '@angular/core';
import { PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, Transforms, getSelectedElements } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { MindElement, MindElementShape, MindPointerType, MindTransforms, canSetAbstract } from '@plait/mind';

@Component({
    selector: 'app-setting-panel',
    templateUrl: './setting-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppSettingPanelComponent) }],
    host: {
        class: 'app-setting-panel'
    }
})
export class AppSettingPanelComponent extends PlaitIslandBaseComponent {
    currentFillColor: string | undefined = '';

    currentStrokeColor: string | undefined = '';

    currentBranchColor: string | undefined = '';

    _selectedElements: MindElement[] = [];

    @Input()
    set selectedElements(selectedElements: MindElement[]) {
        this._selectedElements = selectedElements;
        if (selectedElements.length) {
            this.currentFillColor = selectedElements[0]?.fill || '';
            this.currentStrokeColor = selectedElements[0]?.strokeColor || '';
            this.currentBranchColor = selectedElements[0]?.branchColor || '';
        }
    }

    PlaitPointerType = PlaitPointerType;

    MindPointerType = MindPointerType;

    fillColor = ['#3333', '#e48483', '#69b1e4', '#e681d4', ''];

    strokeColor = ['#1e1e1e', '#e03130', '#2f9e44', '#1871c2', '#f08c02'];

    branchColor = ['#A287E0', '#6E80DB', '#E0B75E', '#B1C675', '#77C386'];

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

    layoutChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindLayoutType;
        const selectedElement = getSelectedElements(this.board)?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            MindTransforms.setLayout(this.board, value, path);
        }
    }

    shapeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindElementShape;
        const selectedElement = getSelectedElements(this.board)?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            Transforms.setNode(this.board, { shape: value }, path);
        }
    }

    colorChange(color: string | null, attribute: string) {
        if (this._selectedElements.length) {
            this._selectedElements.forEach(element => {
                const path = PlaitBoard.findPath(this.board, element);
                Transforms.setNode(this.board, { [attribute]: color }, path);
            });
        }
    }

    setAbstract(event: Event) {
        const selectedElements = getSelectedElements(this.board);
        const ableSetAbstract = selectedElements.every(element => {
            return canSetAbstract(element);
        });

        if (ableSetAbstract) {
            MindTransforms.insertAbstract(this.board, selectedElements);
        }
    }

    edgeShapeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindElementShape;
        const selectedElements = getSelectedElements(this.board);
        if (selectedElements.length) {
            selectedElements.forEach(element => {
                const path = PlaitBoard.findPath(this.board, element);
                Transforms.setNode(this.board, { branchShape: value }, path);
            });
        }
    }
}
