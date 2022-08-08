import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE } from '../utils/weak-maps';
import { PlaitBoardChangeEvent, PlaitBoard } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PlaitPlugin } from '../interfaces/plugin';
import { RoughSVG } from 'roughjs/bin/svg';
import rough from 'roughjs/bin/rough';
import { Transforms } from '../transfroms';
import { withSelection } from '../plugins/with-selection';
import { PlaitOperation } from '../interfaces/operation';
import { getViewBox } from '../utils/board';
import { Viewport } from '../interfaces/viewport';

@Component({
    selector: 'plait-board',
    template: `
        <svg #svg width="100%" height="100%"></svg>
        <div class="plait-toolbar island zoom-toolbar">
            <button class="item" (mousedown)="zoomOut($event)">-</button>
            <button class="item zoom-value" (mousedown)="resetZoom($event)">{{ zoom }}%</button>
            <button class="item" (mousedown)="zoomIn($event)">+</button>
        </div>
        <plait-element
            *ngFor="let item of board.children; let index = index; trackBy: trackBy"
            [index]="index"
            [element]="item"
            [board]="board"
            [viewport]="board.viewport"
            [selection]="board.selection"
            [host]="host"
        ></plait-element>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements OnInit, OnDestroy {
    zoom = 100;

    @HostBinding('class') hostClass = `plait-board-container`;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$: Subject<any> = new Subject();

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    get host(): SVGElement {
        return this.svg.nativeElement;
    }

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    constructor(private cdr: ChangeDetectorRef, private renderer2: Renderer2) {}

    ngOnInit(): void {
        const roughSVG = rough.svg(this.host as SVGSVGElement, { options: { roughness: 0, strokeWidth: 1 } });
        HOST_TO_ROUGH_SVG.set(this.host, roughSVG);
        this.initializePlugins();
        this.initializeEvents();
        this.updateViewport();
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.cdr.detectChanges();
            const changeEvent: PlaitBoardChangeEvent = {
                children: this.board.children,
                operations: this.board.operations,
                viewport: this.board.viewport,
                selection: this.board.selection
            };
            this.plaitChange.emit(changeEvent);
            // update viewBox
            if (this.board.operations.some(op => PlaitOperation.isSetViewportOperation(op))) {
                this.updateViewport();
            }
        });
    }

    initializePlugins() {
        let board = withSelection(withBoard(createBoard(this.host, this.plaitValue)));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;
        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }
    }

    initializeEvents() {
        fromEvent<MouseEvent>(this.host, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousedown(event);
            });
        fromEvent<MouseEvent>(this.host, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousemove(event);
            });
        fromEvent<MouseEvent>(document, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mouseup(event);
            });
        fromEvent<MouseEvent>(this.host, 'dblclick')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
            });
        fromEvent<WheelEvent>(this.host, 'wheel')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: WheelEvent) => {
                event.preventDefault();
                const viewport = this.board.viewport;
                Transforms.setViewport(this.board, {
                    ...viewport,
                    offsetX: viewport?.offsetX - event.deltaX,
                    offsetY: viewport?.offsetY - event.deltaY
                });
            });
        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board as PlaitBoard);
                })
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keydown(event);
            });
        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyup(event);
            });

        window.onresize = () => {
            const viewBoxModel = getViewBox(this.board);
            const viewBoxValues = this.host.getAttribute('viewBox')?.split(',') as string[];
            this.renderer2.setAttribute(
                this.host,
                'viewBox',
                `${viewBoxValues[0].trim()}, ${viewBoxValues[1].trim()}, ${viewBoxModel.width}, ${viewBoxModel.height}`
            );
        };
    }

    updateViewport() {
        this.zoom = Math.floor(this.board.viewport.zoom * 100);
        const viewBox = getViewBox(this.board);
        this.renderer2.setAttribute(this.host, 'viewBox', `${viewBox.minX}, ${viewBox.minY}, ${viewBox.width}, ${viewBox.height}`);
    }

    // 放大
    zoomIn(event: MouseEvent) {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: viewport.zoom + 0.1
        });
    }

    // 缩小
    zoomOut(event: MouseEvent) {
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

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        HOST_TO_ROUGH_SVG.delete(this.host);
    }
}
