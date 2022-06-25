import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaitRichtextComponent } from './richtext.component';

describe('RichtextComponent', () => {
    let component: PlaitRichtextComponent;
    let fixture: ComponentFixture<PlaitRichtextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlaitRichtextComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlaitRichtextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
