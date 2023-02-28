import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TagqueryComponent } from './tagquery.component';

describe('TagqueryComponent', () => {
  let component: TagqueryComponent;
  let fixture: ComponentFixture<TagqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagqueryComponent],
      imports: [MatButtonModule, MatIconModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
