import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileviewerComponent } from './fileviewer.component';

describe('FileviewerComponent', () => {
  let component: FileviewerComponent;
  let fixture: ComponentFixture<FileviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileviewerComponent],
      imports: [
        HttpClientModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FileviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
