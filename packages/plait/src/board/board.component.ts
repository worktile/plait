import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import rough from 'roughjs/bin/rough';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions, PlaitBoardViewport } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistory } from '../plugins/with-history';
import { withHandPointer } from '../plugins/with-hand';
import { withSelection } from '../plugins/with-selection';
import {
    getViewportContainerBox,
    transformMat3,
    getBoardClientBox,
    toPoint,
    transformPoint,
    distanceBetweenPointAndRectangle
} from '../utils';
import {
    BOARD_TO_ON_CHANGE,
    IS_TEXT_EDITABLE,
    BOARD_TO_COMPONENT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_ROUGH_SVG,
    BOARD_TO_MOVING_POINT
} from '../utils/weak-maps';
import { BoardComponentInterface } from './board.component.interface';
import { getRectangleByElements } from '../utils/element';
import { calcViewBox, getMatrix, setScroll, setViewport } from '../utils/viewport';

const ElementHostClass = 'element-host';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #viewportContainer>
            <svg #svg width="100%" height="100%" style="position: relative;"><g class="element-host"></g></svg>
            <plait-element
                *ngFor="let item of board.children; let index = index; trackBy: trackBy"
                [index]="index"
                [element]="item"
                [board]="board"
                [selection]="board.selection"
            ></plait-element>
        </div>
        <plait-toolbar
            *ngIf="isFocused && !toolbarTemplateRef"
            [board]="board"
            (adaptHandle)="adaptHandle()"
            (zoomInHandle)="zoomInHandle()"
            (zoomOutHandle)="zoomOutHandle()"
            (resetZoomHandel)="resetZoomHandel()"
        ></plait-toolbar>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements BoardComponentInterface, OnInit, OnChanges, AfterViewInit, OnDestroy {
    hasInitialized = false;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$ = new Subject<void>();

    viewportState: PlaitBoardViewport = {};

    private resizeObserver!: ResizeObserver;

    private hostResizeObserver!: ResizeObserver;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions!: PlaitBoardOptions;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    get isFocused() {
        return this.board?.selection;
    }

    get host(): SVGSVGElement {
        return this.svg.nativeElement;
    }

    @HostBinding('class')
    get hostClass() {
        return `plait-board-container ${this.board.pointer}`;
    }

    @HostBinding('class.readonly')
    get readonly() {
        return this.board.options.readonly;
    }

    @HostBinding('class.focused')
    get focused() {
        return this.isFocused;
    }

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    @ContentChild('plaitToolbar')
    public toolbarTemplateRef!: TemplateRef<any>;

    @ViewChild('viewportContainer', { read: ElementRef, static: true })
    viewportContainer!: ElementRef;

    constructor(public cdr: ChangeDetectorRef, private renderer2: Renderer2, private elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        const elementHost = this.host.querySelector(`.${ElementHostClass}`) as SVGGElement;
        const roughSVG = rough.svg(this.host as SVGSVGElement, {
            options: { roughness: 0, strokeWidth: 1 }
        });
        this.initializePlugins();
        this.initializeEvents();
        this.viewportScrollListener();
        this.elementResizeListener();
        BOARD_TO_COMPONENT.set(this.board, this);
        BOARD_TO_ROUGH_SVG.set(this.board, roughSVG);
        BOARD_TO_HOST.set(this.board, this.host);
        BOARD_TO_ELEMENT_HOST.set(this.board, elementHost);
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.cdr.detectChanges();
            const changeEvent: PlaitBoardChangeEvent = {
                children: this.board.children,
                operations: this.board.operations,
                viewport: this.board.viewport,
                selection: this.board.selection
            };
            this.plaitChange.emit(changeEvent);
        });
        this.hasInitialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.hasInitialized) {
            const valueChange = changes['plaitValue'];
            const options = changes['plaitOptions'];

            if (valueChange) this.board.children = valueChange.currentValue;
            if (options) this.board.options = options.currentValue;
            this.cdr.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
        this.initViewportContainer();
        this.initViewport();
    }

    private initializePlugins() {
        let board = withHandPointer(withHistory(withSelection(withBoard(createBoard(this.plaitValue, this.plaitOptions)))));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;

        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }
    }

    private initializeEvents() {
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

        fromEvent<MouseEvent>(document, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                BOARD_TO_MOVING_POINT.set(this.board, [event.x, event.y]);
                this.board.globalMousemove(event);
            });

        fromEvent<MouseEvent>(this.host, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mouseup(event);
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
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection && !this.readonly;
                })
            )
            .subscribe((clipboardEvent: ClipboardEvent) => {
                const mousePoint = BOARD_TO_MOVING_POINT.get(this.board);
                const rect = this.nativeElement.getBoundingClientRect();
                if (mousePoint && distanceBetweenPointAndRectangle(mousePoint[0], mousePoint[1], rect) === 0) {
                    const targetPoint = transformPoint(this.board, toPoint(mousePoint[0], mousePoint[1], this.host));
                    this.board.insertFragment(clipboardEvent.clipboardData, targetPoint);
                }
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
    }

    private viewportScrollListener() {
        fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((event: Event) => {
                const { scrollLeft, scrollTop } = event.target as HTMLElement;
                const left = this.viewportState.scrollLeft!;
                const top = this.viewportState.scrollTop!;
                if (Math.abs(left - scrollLeft) >= 1 || Math.abs(top - scrollTop) >= 1) {
                    setScroll(this.board, scrollLeft, scrollTop);
                    setViewport(this.board);
                }
            });
    }

    private elementResizeListener() {
        this.resizeObserver = new ResizeObserver(() => {
            this.initViewportContainer();
        });
        this.resizeObserver.observe(this.nativeElement);
    }

    private initViewport() {
        const originationCoord = this.board.viewport?.originationCoord;
        if (originationCoord) {
            this.applyViewport();
        } else {
            this.adaptHandle();
        }
    }

    applyViewport() {
        const { viewport } = this.board;
        const { zoom, originationCoord } = viewport;
        const { viewportWidth, viewportHeight, scrollLeft, scrollTop, viewBox, originationCoord: currentOriginationCoord } = calcViewBox(
            this.board,
            zoom
        );
        this.viewportState.viewportWidth = viewportWidth;
        this.viewportState.viewportHeight = viewportHeight;
        const left = scrollLeft + (originationCoord![0] - currentOriginationCoord[0]) * zoom;
        const top = scrollTop + (originationCoord![1] - currentOriginationCoord[1]) * zoom;

        setScroll(this.board, left, top);
        this.updateViewBoxStyles(viewBox);
        this.updateViewportScrolling();
    }

    initViewportContainer() {
        const { width, height } = getBoardClientBox(this.board);
        this.renderer2.setStyle(this.viewportContainer.nativeElement, 'width', `${width}px`);
        this.renderer2.setStyle(this.viewportContainer.nativeElement, 'height', `${height}px`);
    }

    private updateViewBoxStyles(viewBox: number[]) {
        const { host, viewportState } = this;
        const { viewportWidth, viewportHeight } = viewportState;
        this.renderer2.setStyle(host, 'display', 'block');
        this.renderer2.setStyle(host, 'width', `${viewportWidth}px`);
        this.renderer2.setStyle(host, 'height', `${viewportHeight}px`);

        if (viewBox && viewBox[2] > 0 && viewBox[3] > 0) {
            this.renderer2.setAttribute(host, 'viewBox', viewBox.join(' '));
        }
    }

    private updateViewportScrolling() {
        const { viewportContainer, viewportState } = this;
        const { scrollLeft, scrollTop } = viewportState;
        viewportContainer.nativeElement.scrollLeft = scrollLeft!;
        viewportContainer.nativeElement.scrollTop = scrollTop!;
    }

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    adaptHandle() {
        const containerBox = getViewportContainerBox(this.board);
        const rootGroupBox = getRectangleByElements(this.board, this.board.children, true);
        const matrix = getMatrix(this.board);

        const rootGroupCenter = [rootGroupBox.x + rootGroupBox.width / 2, rootGroupBox.y + rootGroupBox.height / 2];
        const transformedRootGroupCenter = transformMat3([], [...rootGroupCenter, 1], matrix);

        const containerCenter = [containerBox.width / 2, containerBox.height / 2];
        const offsetLeft = containerCenter[0] - transformedRootGroupCenter[0];
        const offsetTop = containerCenter[1] - transformedRootGroupCenter[1];

        const autoFitPadding = 8;
        const viewportWidth = containerBox.width - 2 * autoFitPadding;
        const viewportHeight = containerBox.height - 2 * autoFitPadding;
        const { scrollLeft, scrollTop } = this.viewportState;

        let newZoom = this.board.viewport.zoom;
        if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
            newZoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
        } else {
            newZoom = 1;
        }

        setScroll(this.board, scrollLeft! - offsetLeft, scrollTop! - offsetTop);
        setViewport(this.board, newZoom);
    }

    zoomInHandle() {
        setViewport(this.board, this.board.viewport.zoom + 0.1);
    }

    zoomOutHandle() {
        setViewport(this.board, this.board.viewport.zoom - 0.1);
    }

    resetZoomHandel() {
        setViewport(this.board, 1);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.resizeObserver && this.resizeObserver?.disconnect();
        this.hostResizeObserver && this.hostResizeObserver?.disconnect();
        BOARD_TO_ROUGH_SVG.delete(this.board);
        BOARD_TO_COMPONENT.delete(this.board);
        BOARD_TO_ROUGH_SVG.delete(this.board);
        BOARD_TO_HOST.delete(this.board);
        BOARD_TO_ELEMENT_HOST.delete(this.board);
        BOARD_TO_ON_CHANGE.delete(this.board);
    }

    markForCheck() {
        this.cdr.markForCheck();
    }
}
