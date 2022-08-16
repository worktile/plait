import { Component, OnInit } from '@angular/core';
import { PlaitChangeEvent } from '@plait/richtext';

@Component({
    selector: 'basic-richtext',
    templateUrl: './richtext.component.html'
})
export class BasicRichtextComponent implements OnInit {
    value = {
        children: [
            { text: '富文本' },
            { type: 'link', url: 'https://github.com/plait-org/plait', children: [{ text: 'https://github.com/plait-org/plait' }] },
            { text: '' }
        ]
    };
    ngOnInit(): void {}

    onChange(event: PlaitChangeEvent) {
        console.log(event);
    }
}
