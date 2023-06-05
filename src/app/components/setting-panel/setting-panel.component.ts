import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, forwardRef } from '@angular/core';
import { BoardTransforms, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, Transforms, getSelectedElements } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { MindElementShape, MindPointerType, MindTransforms, canSetAbstract } from '@plait/mind';

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
    PlaitPointerType = PlaitPointerType;
    MindPointerType = MindPointerType;

    @HostBinding('class.visible')
    get isVisible() {
        const selectedCount = getSelectedElements(this.board).length;
        if (selectedCount > 0) {
            return true
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
