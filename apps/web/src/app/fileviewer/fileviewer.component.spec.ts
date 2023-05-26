import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileviewerComponent } from './fileviewer.component';
import { AppConfig, AppService, TOKEN } from '../app.service';
import { Injector } from '@angular/core';

describe('FileviewerComponent', () => {
  let component: FileviewerComponent;
  let fixture: ComponentFixture<FileviewerComponent>;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileviewerComponent],
      imports: [
        HttpClientModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
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
