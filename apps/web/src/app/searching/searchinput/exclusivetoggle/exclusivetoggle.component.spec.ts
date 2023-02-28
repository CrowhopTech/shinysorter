import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ExclusivetoggleComponent } from './exclusivetoggle.component';

describe('ExclusivetoggleComponent', () => {
  let component: ExclusivetoggleComponent;
  let fixture: ComponentFixture<ExclusivetoggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExclusivetoggleComponent],
      imports: [MatSlideToggleModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ExclusivetoggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
