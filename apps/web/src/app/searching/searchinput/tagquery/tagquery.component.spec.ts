import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TagqueryComponent } from './tagquery.component';
import { AppConfig, TOKEN } from '../../../app.service';

describe('TagqueryComponent', () => {
  let component: TagqueryComponent;
  let fixture: ComponentFixture<TagqueryComponent>;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagqueryComponent],
      imports: [MatButtonModule, MatIconModule],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
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
