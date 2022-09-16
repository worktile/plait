import {
    AfterViewInit,
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
import rough from 'roughjs/bin/rough';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitOperation } from '../interfaces/operation';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistroy } from '../plugins/with-history';
import { withSelection } from '../plugins/with-selection';
import { Transforms } from '../transfroms';
import { getViewBox } from '../utils/board';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE } from '../utils/weak-maps';

@Component({
    selector: 'plait-board',
    template: `
        <div #container>
            <svg #svg width="100%" height="100%" style="position: relative" preserveAspectRatio="xMidYMid meet"></svg>
            <plait-element
                *ngFor="let item of board.children; let index = index; trackBy: trackBy"
                [index]="index"
                [element]="item"
                [board]="board"
                [viewport]="board.viewport"
                [selection]="board.selection"
                [host]="host"
            ></plait-element>
        </div>
        <div *ngIf="isFocused" class="plait-toolbar island zoom-toolbar plait-board-attached">
            <button class="item" (mousedown)="zoomOut($event)">-</button>
            <button class="item zoom-value" (mousedown)="resetZoom($event)">{{ zoom }}%</button>
            <button class="item" (mousedown)="zoomIn($event)">+</button>
        </div>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements OnInit, AfterViewInit, OnDestroy {
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

    get isFocused() {
        return this.board?.selection;
    }

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitReadonly = false;

    @Input() plaitAllowClearBoard = false;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    @HostBinding('class.focused')
    get focused() {
        return this.isFocused;
    }

    @ViewChild('container', { read: ElementRef, static: true })
    contentContainer!: ElementRef;

    constructor(private cdr: ChangeDetectorRef, private renderer2: Renderer2, private elementRef: ElementRef) {}

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
            // update viewBox
            if (this.board.operations.some(op => PlaitOperation.isSetViewportOperation(op))) {
                this.updateViewport();
            }
            this.updateContainerStyle();
            this.plaitChange.emit(changeEvent);
        });
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
        this.updateContainerStyle();
    }

    initializePlugins() {
        const options: PlaitBoardOptions = { readonly: this.plaitReadonly, allowClearBoard: this.plaitAllowClearBoard };
        let board = withHistroy(withSelection(withBoard(createBoard(this.host, this.plaitValue, options))));
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
                this.board.globalMouseup(event);
            });

        fromEvent<MouseEvent>(this.host, 'dblclick')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
            });

        // fromEvent<WheelEvent>(this.host, 'wheel')
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((event: WheelEvent) => {
        //         if (this.isFocused) {
        //             event.preventDefault();
        //             const viewport = this.board.viewport;
        //             const { currentX, currentY, isAllowX, isAllowY } = this.computedScrollArea(event);

        //             Transforms.setViewport(this.board, {
        //                 ...viewport,
        //                 offsetX: isAllowX ? currentX : viewport?.offsetX,
        //                 offsetY: isAllowY ? currentY : viewport?.offsetY
        //             });
        //         }
        //     });

        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keydown(event);
            });

        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyup(event);
            });

        fromEvent<ClipboardEvent>(document, 'copy')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                this.board?.setFragment(event.clipboardData);
            });

        fromEvent<ClipboardEvent>(document, 'paste')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: ClipboardEvent) => {
                this.board?.insertFragment(event.clipboardData);
            });

        fromEvent<ClipboardEvent>(document, 'cut')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                this.board?.setFragment(event.clipboardData);
                this.board?.deleteFragment(event.clipboardData);
            });

        window.onresize = () => {
            this.refreshViewport();
        };
    }

    computedScrollArea(e: WheelEvent) {
        const viewport = this.board.viewport;
        const rootGroupG = this.host.firstChild;
        const rootGroupGRect = (rootGroupG as SVGElement)?.getBoundingClientRect();

        const currentX = viewport?.offsetX - e.deltaX;
        const currentY = viewport?.offsetY - e.deltaY;

        const isAllowLX = rootGroupGRect.width * 2 > Math.abs(currentX);
        const isAllowTY = rootGroupGRect.height > Math.abs(currentY);
        const isAllowRX = rootGroupGRect.width / 2 > Math.abs(currentX);
        const isAllowBY = rootGroupGRect.height / 2 > Math.abs(currentY);

        const isAllowX = String(currentX).includes('-') ? isAllowLX : isAllowRX;
        const isAllowY = String(currentY).includes('-') ? isAllowTY : isAllowBY;
        return {
            currentX,
            currentY,
            isAllowX,
            isAllowY
        };
    }

    updateContainerStyle() {
        const parentElement = this.elementRef.nativeElement?.parentElement;
        const parentRect = parentElement?.getBoundingClientRect();
        const rootGroupG = this.host.firstChild;
        const rootGroupGRect = (rootGroupG as SVGElement)?.getBoundingClientRect();

        const parentWidth = `${parentRect.width + 20}px`;
        const parentHeight = `${parentRect.height + 20}px`;
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'overflow', 'auto');
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'width', parentWidth);
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'height', parentHeight);
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'maxWidth', parentWidth);
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'maxHeight', parentHeight);

        // const hostWidth = parentRect.width * 2 + rootGroupGRect.width / 2;
        // const hostHeight = parentRect.width * 2 + rootGroupGRect.width / 2;
        const hostWidth = (parentRect.width - rootGroupGRect.width / 2) * 2;
        const hostHeight = parentRect.width * 2 + rootGroupGRect.width / 2;
        console.log(parentRect.width, rootGroupGRect.width, hostWidth, hostHeight);
        this.renderer2.setStyle(this.host, 'display', 'block');
        this.renderer2.setStyle(this.host, 'width', `${hostWidth}px`);
        this.renderer2.setStyle(this.host, 'height', `${hostHeight}px`);
        this.renderer2.setStyle(this.host, 'cursor', this.plaitReadonly ? 'grab' : 'default');

        // const mindX = `${(hostWidth - rootGroupGRect.width) / 2 - rootGroupGRect.width / 2}`;
        const mindX = `0`;
        const mindY = `${hostHeight / 2 - rootGroupGRect.height / 2}`;
        console.log(mindX, mindY);
        this.renderer2.setAttribute(
            this.host,
            'viewBox',
            `${String(mindX).includes('-') ? mindX : -mindX}, ${String(mindY).includes('-') ? mindY : -mindY}, ${hostWidth}, ${hostHeight}`
        );
    }

    refreshViewport() {
        const viewBoxModel = getViewBox(this.board);
        const viewBoxValues = this.host.getAttribute('viewBox')?.split(',') as string[];
        this.renderer2.setAttribute(
            this.host,
            'viewBox',
            `${viewBoxValues[0].trim()}, ${viewBoxValues[1].trim()}, ${viewBoxModel.width}, ${viewBoxModel.height}`
        );
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
