import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, inject } from '@angular/core';
import { PlaitBoard, ToImageOptions, getSelectedElements, toImage, toSvgData } from '@plait/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { closeAction } from '../../utils/popover';
import { PlaitIslandBaseComponent } from '@plait/angular-board';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppMenuComponent) }],
    host: {
        class: 'app-menu'
    },
    imports: [NgClass, NgTemplateOutlet]
})
export class AppMenuComponent extends PlaitIslandBaseComponent {
    cdr = inject(ChangeDetectorRef);

    isShowMenu = false;

    open(event: MouseEvent) {
        this.isShowMenu = !this.isShowMenu;
        if (this.isShowMenu) {
            closeAction(() => {
                this.isShowMenu = false;
                this.markForCheck();
            });
        }
    }

    exportPNG(event: MouseEvent) {
        const selectedElements = getSelectedElements(this.board);
        boardToImage(this.board, {
            elements: selectedElements.length > 0 ? selectedElements : undefined
        }).then((image) => {
            if (image) {
                const pngImage = base64ToBlob(image);
                const imageName = `plait-export-data-${new Date().getTime()}.png`;
                download(pngImage, imageName);
            }
            this.isShowMenu = false;
            this.cdr.markForCheck();
        });
    }

    exportSVG(event: MouseEvent) {
        const selectedElements = getSelectedElements(this.board);
        return toSvgData(this.board, {
            fillStyle: 'transparent',
            padding: 20,
            ratio: 4,
            elements: selectedElements.length > 0 ? selectedElements : undefined
        }).then((svgData) => {
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const imageName = `plait-export-data-${new Date().getTime()}.svg`;
            download(blob, imageName);
        });
    }
}

export const base64ToBlob = (base64: string) => {
    let arr = base64.split(','),
        fileType = arr[0].match(/:(.*?);/)![1],
        bstr = atob(arr[1]),
        l = bstr.length,
        u8Arr = new Uint8Array(l);

    while (l--) {
        u8Arr[l] = bstr.charCodeAt(l);
    }
    return new Blob([u8Arr], {
        type: fileType
    });
};

export const boardToImage = (board: PlaitBoard, options: ToImageOptions = {}) => {
    return toImage(board, {
        fillStyle: 'transparent',
        padding: 20,
        ratio: 4,
        ...options
    });
};

export function download(blob: Blob | MediaSource, filename: string) {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}
