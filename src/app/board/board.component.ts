import { Component, OnInit, ViewChild } from '@angular/core';
import { withMindmap } from 'mindmap';
import { PlaitElement, PlaitBoardChangeEvent, Viewport, PlaitBoardComponent } from 'plait';
import { mockMindmapData } from '../mock/mindmap-data';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board',
    templateUrl: './board.component.html'
})
export class BasicBoardComponent implements OnInit {
    plugins = [withMindmap];

    value: PlaitElement[] = [mockMindmapData];

    viewport!: Viewport;

    @ViewChild('board', { read: PlaitBoardComponent, static: true })
    boardComponent!: PlaitBoardComponent;

    ngOnInit(): void {
        const data = this.getLocalData() as PlaitBoardChangeEvent;
        if (data) {
            this.value = data.children;
            this.viewport = data.viewport;
        }
    }

    change(event: PlaitBoardChangeEvent) {
        const data = { children: event.children, viewport: event.viewport };
        this.setLocalData(JSON.stringify(data));
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_DATA_KEY}`, data);
    }

    getLocalData() {
        const data = localStorage.getItem(`${LOCAL_DATA_KEY}`);
        return data ? JSON.parse(data) : null;
    }

    saveAsPNG() {
        toBlob(this.boardComponent.svg.nativeElement)
            .then((blob: Blob | null) => {
                if (blob) {
                    saveAs(blob, 'sprint-71.png');
                }
            })
            .catch(function(error) {
                console.error('oops, something went wrong!', error);
            });
    }

    saveAsFile() {
        const data = localStorage.getItem(`${LOCAL_DATA_KEY}`);
        if (data) {
            var blob = new Blob([data], {type: "text/json;charset=utf-8"});
            saveAs(blob, new Date().getTime() + '.json')
        }
    }
}
