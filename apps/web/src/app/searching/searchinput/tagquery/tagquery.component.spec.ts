import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should show the remove button only when expected', fakeAsync(() => {
    let clickedTag = "";
    component.removeClicked.subscribe(t => clickedTag = t);

    component.removeVisible = true;
    fixture.detectChanges();
    let removeButton = fixture.debugElement.nativeElement.querySelector('#remove-button');
    expect(removeButton).toBeTruthy();

    // Click the button and ensure an event is emitted
    removeButton.click();
    tick();
    expect(clickedTag).toBeTruthy();

    component.removeVisible = false;
    fixture.detectChanges();
    removeButton = fixture.nativeElement.querySelector('#remove-button');
    expect(removeButton).toBeFalsy();
  }));

  test('should show the add button only when expected', fakeAsync(() => {
    let clickedTag = "";
    component.addClicked.subscribe(t => clickedTag = t);

    component.addVisible = true;
    fixture.detectChanges();
    let addButton = fixture.nativeElement.querySelector('#add-button');
    expect(addButton).toBeTruthy();

    // Click the button and ensure an event is emitted
    addButton.click();
    tick();
    expect(clickedTag).toBeTruthy();

    component.addVisible = false;
    fixture.detectChanges();
    addButton = fixture.nativeElement.querySelector('#add-button');
    expect(addButton).toBeFalsy();
  }));
});
