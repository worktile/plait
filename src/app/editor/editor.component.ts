import { Component, OnInit } from '@angular/core';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions, PlaitElement, Viewport } from '@plait/core';
import { mockData } from './mock-data';
import { withMind, PlaitMindBoard } from '@plait/mind';
import { withEmojiExtend } from './emoji/with-emoji-extend';
import { AbstractResizeState } from '@plait/mind';
import { MindThemeColor } from '@plait/mind/src/interfaces/theme-color';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMind, withEmojiExtend];

    value: PlaitElement[] = [...mockData];

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: false,
        disabledScrollOnNonFocus: false,
        themeColors: MindThemeColor
    };

    viewport!: Viewport;

    board!: PlaitBoard;

    ngOnInit(): void {
        const data = this.getLocalData() as PlaitBoardChangeEvent;
        if (data) {
            this.value = data.children;
            this.viewport = data.viewport;
        }
    }

    change(event: PlaitBoardChangeEvent) {
        this.setLocalData(JSON.stringify(event));
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_DATA_KEY}`, data);
    }

    getLocalData() {
        const data = localStorage.getItem(`${LOCAL_DATA_KEY}`);
        return data ? JSON.parse(data) : null;
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
        (this.board as PlaitMindBoard).onAbstractResize = (state: AbstractResizeState) => {};
    }
}
