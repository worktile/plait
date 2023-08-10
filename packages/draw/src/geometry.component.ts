import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitBaseGeometry, GeometryShape } from './interfaces/geometry';
import { drawRectangle, getRectangleByPoints } from './utils/geometry';
import { ExitOrigin, TextManage, TextManageRef, getTextSize } from '@plait/text';
import { DrawTransform } from './transforms';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitBaseGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitBaseGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    textManage!: TextManage;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initialize();
        this.drawGeometry();
        this.drawText();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitBaseGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitBaseGeometry, PlaitBoard>
    ) {}

    initialize() {
        this.textManage = new TextManage(
            this.board,
            this.viewContainerRef,
            () => {
                const elementRectangle = getRectangleByPoints(this.element.points!);
                const { height } = getTextSize(this.board, this.element.text);

                return {
                    height,
                    width: elementRectangle.width,
                    x: elementRectangle.x,
                    y: elementRectangle.y + (elementRectangle.height - height) / 2
                };
            },
            (textManageRef: TextManageRef) => {
                const width = textManageRef.width;
                const height = textManageRef.height;
                if (textManageRef.newValue) {
                    DrawTransform.setText(this.board, this.element, textManageRef.newValue, width, height);
                }
            }
        );
    }

    drawGeometry() {
        const shape = this.element.shape;
        switch (shape) {
            case GeometryShape.rectangle:
                const rectangleG = drawRectangle(this.board, this.element);
                this.g.prepend(rectangleG);
                break;
            default:
                break;
        }
    }

    editText() {
        this.textManage.edit();
    }

    drawText() {
        this.textManage.draw(this.element.text);
        this.g.append(this.textManage.g);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
