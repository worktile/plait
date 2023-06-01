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
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import rough from 'roughjs/bin/rough';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistory } from '../plugins/with-history';
import { withHandPointer } from '../plugins/with-hand';
import { withSelection } from '../plugins/with-selection';
import { toPoint, transformPoint, distanceBetweenPointAndRectangle } from '../utils';
import {
    BOARD_TO_ON_CHANGE,
    BOARD_TO_COMPONENT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_ROUGH_SVG,
    BOARD_TO_MOVING_POINT
} from '../utils/weak-maps';
import { BoardComponentInterface } from './board.component.interface';
import {
    fitViewport,
    getViewBox,
    initializeViewportOffset,
    initializeViewBox,
    setViewport,
    changeZoom,
    isFromViewportChange,
    setIsFromViewportChange,
    initializeViewportContainer,
    updateViewportOffset,
    setIsFromScrolling
} from '../utils/viewport';
import { isHotkey } from 'is-hotkey';
import { withViewport } from '../plugins/with-viewport';
import { Point } from '../interfaces/point';
import { withMoving } from '../plugins/with-moving';
import { hasInputOrTextareaTarget } from '../utils/dom/common';
import { withOptions } from '../plugins/with-options';

const ElementHostClass = 'element-host';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #viewportContainer>
            <svg #svg width="100%" height="100%" style="position: relative;"><g class="element-host"></g></svg>
            <plait-children [board]="board" [effect]="effect"></plait-children>
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

    effect = {};

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$ = new Subject<void>();

    private resizeObserver!: ResizeObserver;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions?: PlaitBoardOptions;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    get host(): SVGSVGElement {
        return this.svg.nativeElement;
    }

    @HostBinding('class')
    get hostClass() {
        return `plait-board-container pointer-${this.board.pointer}`;
    }

    @HostBinding('class.readonly')
    get readonly() {
        return this.board.options.readonly;
    }

    @HostBinding('class.focused')
    get isFocused() {
        return PlaitBoard.isFocus(this.board);
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

    constructor(
        public cdr: ChangeDetectorRef,
        public viewContainerRef: ViewContainerRef,
        private elementRef: ElementRef<HTMLElement>,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        const elementHost = this.host.querySelector(`.${ElementHostClass}`) as SVGGElement;
        const roughSVG = rough.svg(this.host as SVGSVGElement, {
            options: { roughness: 0, strokeWidth: 1 }
        });
        this.roughSVG = roughSVG;
        this.initializePlugins();
        this.ngZone.runOutsideAngular(() => {
            this.initializeHookListener();
            this.viewportScrollListener();
            this.elementResizeListener();
            this.mouseLeaveListener();
        });
        BOARD_TO_COMPONENT.set(this.board, this);
        BOARD_TO_ROUGH_SVG.set(this.board, roughSVG);
        BOARD_TO_HOST.set(this.board, this.host);
        BOARD_TO_ELEMENT_HOST.set(this.board, elementHost);
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.ngZone.run(() => {
                this.detect();
                const changeEvent: PlaitBoardChangeEvent = {
                    children: this.board.children,
                    operations: this.board.operations,
                    viewport: this.board.viewport,
                    selection: this.board.selection
                };
                this.plaitChange.emit(changeEvent);
            });
        });
        this.hasInitialized = true;
    }

    detect() {
        this.effect = {};
        this.cdr.detectChanges();
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
        initializeViewportContainer(this.board);
        initializeViewBox(this.board);
        initializeViewportOffset(this.board);
    }

    private initializePlugins() {
        let board = withHandPointer(
            withHistory(withSelection(withMoving(withBoard(withViewport(withOptions(createBoard(this.plaitValue, this.plaitOptions)))))))
        );
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;

        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }
    }

    private initializeHookListener() {
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
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
            });

        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                filter(event => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board) && !hasInputOrTextareaTarget(event.target))
            )
            .subscribe((event: KeyboardEvent) => {
                if (isHotkey(['mod+=', 'mod++'], { byKey: true })(event)) {
                    event.preventDefault();
                    this.zoomInHandle(false);
                }
                if (isHotkey('mod+-', { byKey: true })(event)) {
                    this.zoomOutHandle();
                    event.preventDefault();
                }
                this.board?.keydown(event);
            });

        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyup(event);
            });

        fromEvent<ClipboardEvent>(document, 'copy')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                this.board?.setFragment(event.clipboardData);
            });

        fromEvent<ClipboardEvent>(document, 'paste')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.isReadonly(this.board) && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((clipboardEvent: ClipboardEvent) => {
                const mousePoint = PlaitBoard.getMovingPoint(this.board);
                const rect = this.nativeElement.getBoundingClientRect();
                if (mousePoint && distanceBetweenPointAndRectangle(mousePoint[0], mousePoint[1], rect) === 0) {
                    const targetPoint = transformPoint(this.board, toPoint(mousePoint[0], mousePoint[1], this.host));
                    this.board.insertFragment(clipboardEvent.clipboardData, targetPoint);
                }
            });

        fromEvent<ClipboardEvent>(document, 'cut')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.isReadonly(this.board) && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                this.board?.setFragment(event.clipboardData);
                this.board?.deleteFragment(event.clipboardData);
            });
    }

    private viewportScrollListener() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'scroll')
                .pipe(
                    takeUntil(this.destroy$),
                    filter(() => {
                        if (isFromViewportChange(this.board)) {
                            setIsFromViewportChange(this.board, false);
                            return false;
                        }
                        return this.isFocused;
                    })
                )
                .subscribe((event: Event) => {
                    const { scrollLeft, scrollTop } = event.target as HTMLElement;
                    const zoom = this.board.viewport.zoom;
                    const viewBox = getViewBox(this.board, zoom);
                    const origination = [scrollLeft / zoom + viewBox[0], scrollTop / zoom + viewBox[1]] as Point;
                    if (Point.isEquals(origination, this.board.viewport.origination)) {
                        return;
                    }
                    setViewport(this.board, origination);
                    setIsFromScrolling(this.board, true);
                });
        });
    }

    private elementResizeListener() {
        this.resizeObserver = new ResizeObserver(() => {
            initializeViewportContainer(this.board);
            initializeViewBox(this.board);
            updateViewportOffset(this.board);
        });
        this.resizeObserver.observe(this.nativeElement);
    }

    private mouseLeaveListener() {
        fromEvent<MouseEvent>(this.host, 'mouseleave')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                BOARD_TO_MOVING_POINT.delete(this.board);
            });
    }

    trackBy = (index: number, element: PlaitElement) => {
        return element.id;
    };

    adaptHandle() {
        fitViewport(this.board);
    }

    zoomInHandle(isCenter = true) {
        changeZoom(this.board, this.board.viewport.zoom + 0.1, isCenter);
    }

    zoomOutHandle() {
        changeZoom(this.board, this.board.viewport.zoom - 0.1);
    }

    resetZoomHandel() {
        changeZoom(this.board, 1);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.resizeObserver && this.resizeObserver?.disconnect();
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
