import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SearchinputComponent } from './searchinput.component';

describe('SearchinputComponent', () => {
  let component: SearchinputComponent;
  let fixture: ComponentFixture<SearchinputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchinputComponent],
      imports: [
        HttpClientModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SearchinputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
