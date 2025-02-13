import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTechnicianComponent } from './register-technician.component';

describe('RegisterTechnicianComponent', () => {
  let component: RegisterTechnicianComponent;
  let fixture: ComponentFixture<RegisterTechnicianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterTechnicianComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterTechnicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
