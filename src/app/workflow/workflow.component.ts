import { Component, OnInit } from '@angular/core';
import { PlaitChangeEvent } from '@plait/richtext';

@Component({
    selector: 'basic-workflow',
    templateUrl: './workflow.component.html'
})
export class BasicWorkflowComponent implements OnInit {
    ngOnInit(): void {}

    onChange(event: PlaitChangeEvent) {
        console.log(event);
    }
}
