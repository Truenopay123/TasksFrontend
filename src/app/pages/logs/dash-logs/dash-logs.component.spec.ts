import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashLogsComponent } from './dash-logs.component';

describe('DashLogsComponent', () => {
  let component: DashLogsComponent;
  let fixture: ComponentFixture<DashLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
