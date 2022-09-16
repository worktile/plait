import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';
import { Transforms } from '../../transfroms';
import { Viewport } from '../../interfaces/viewport';
import { PlaitBoard } from '../../interfaces/board';
import { BOARD_TO_ON_CHANGE } from '../../utils/weak-maps';
import { getViewBox } from '../../utils/board';

@Component({
    selector: 'plait-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitToolbarComponent implements OnInit, OnChanges, OnDestroy {
    @HostBinding('class') hostClass = `zoom-toolbar`;

    @Input()
    board!: PlaitBoard;

    public get zoom(): number {
        return Math.floor(this.board.viewport.zoom * 100);
    }

    constructor(private cdr: ChangeDetectorRef, private renderer2: Renderer2) {}

    ngOnInit(): void {
        // this.updateViewport();
        // window.onresize = () => {
        //     this.refreshViewport();
        // };
        // BOARD_TO_ON_CHANGE.set(this.board, () => {
        //     this.cdr.detectChanges();
        //     const changeEvent: PlaitBoardChangeEvent = {
        //         children: this.board.children,
        //         operations: this.board.operations,
        //         viewport: this.board.viewport,
        //         selection: this.board.selection
        //     };
        //     // update viewBox
        //     if (this.board.operations.some(op => PlaitOperation.isSetViewportOperation(op))) {
        //         this.updateViewport();
        //     }
        //     this.plaitChange.emit(changeEvent);
        // });
    }

    // refreshViewport() {
    //     const viewBoxModel = getViewBox(this.board);
    //     const viewBoxValues = this.host.getAttribute('viewBox')?.split(',') as string[];
    //     this.renderer2.setAttribute(
    //         this.host,
    //         'viewBox',
    //         `${viewBoxValues[0].trim()}, ${viewBoxValues[1].trim()}, ${viewBoxModel.width}, ${viewBoxModel.height}`
    //     );
    // }

    // updateViewport() {
    //     this.zoom = Math.floor(this.board.viewport.zoom * 100);
    //     const viewBox = getViewBox(this.board);
    //     this.renderer2.setAttribute(this.host, 'viewBox', `${viewBox.minX}, ${viewBox.minY}, ${viewBox.width}, ${viewBox.height}`);
    // }

    // 放大
    zoomIn(event: MouseEvent) {
        // event.preventDefault()
        // event.stopPropagation()
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: viewport.zoom + 0.1
        });
    }

    // 缩小
    zoomOut(event: MouseEvent) {
        console.log(2, this.board);
        
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: viewport.zoom - 0.1
        });
    }

    resetZoom(event: MouseEvent) {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: 1
        });
    }

    ngOnChanges(changes: SimpleChanges): void {}

    ngOnDestroy(): void {}
}
