import { Injector } from '@angular/core';
import { PlaitBoard } from '@plait/core';

export interface CustomBoard extends PlaitBoard {
    injector?: Injector;
}
