import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HometechComponent } from './hometech.component';

describe('HometechComponent', () => {
  let component: HometechComponent;
  let fixture: ComponentFixture<HometechComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HometechComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HometechComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
