import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmindashadminDashboardComponent } from './admindashadmin-dashboard.component';

describe('AdmindashadminDashboardComponent', () => {
  let component: AdmindashadminDashboardComponent;
  let fixture: ComponentFixture<AdmindashadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdmindashadminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmindashadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
