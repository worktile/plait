import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'app-color-picker'
    }
})
export class AppColorPickerComponent {
    @Input() defaultColor!: string[];

    @Input() currentColor!: string | undefined;

    @Output() colorChangeEvent = new EventEmitter<string>();

    transparent =
        'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==)';

    colorChange(color: string) {
        this.colorChangeEvent.emit(color);
    }
}
