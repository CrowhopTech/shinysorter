import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tagquery',
  templateUrl: './tagquery.component.html',
  styleUrls: ['./tagquery.component.sass']
})
export class TagqueryComponent implements OnInit {

  @Input() tag: string = "<no tag provided>"

  @Input() addVisible: boolean = true
  @Input() removeVisible: boolean = true

  @Output() addClicked = new EventEmitter<string>();
  @Output() removeClicked = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

}
