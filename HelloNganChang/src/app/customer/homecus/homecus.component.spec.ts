import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomecusComponent } from './homecus.component';

describe('HomecusComponent', () => {
  let component: HomecusComponent;
  let fixture: ComponentFixture<HomecusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomecusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomecusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
