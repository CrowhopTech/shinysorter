import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '../app.module';

import { SearchingComponent } from './searching.component';

describe('SearchingComponent', () => {
  let component: SearchingComponent;
  let fixture: ComponentFixture<SearchingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchingComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatDividerModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        AppModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SearchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
