import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet]
})
export class AppComponent {}
