import { ChangeDetectorRef } from "@angular/core";
import { RectangleClient } from "../interfaces/rectangle-client";

export interface BoardComponentInterface {
    markForCheck: () => void;
    scrollToRectangle: (client: RectangleClient) => void;
    cdr: ChangeDetectorRef;
}
