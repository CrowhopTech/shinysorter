import { Component, Input, OnInit } from '@angular/core';
import { APIUtilityService } from '../apiutility.service';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.component.html',
  styleUrls: ['./tag-chip.component.sass']
})
export class TagChipComponent implements OnInit {

  @Input() tagIDs?: (number | null | undefined)[]
  @Input() noTagsMessage?: string

  constructor(public apiUtility: APIUtilityService) { }

  ngOnInit(): void {
    this.apiUtility.updateTagCache()
  }

  pastelColorForText(text: string | undefined): string {
    if (!text) {
      return ""
    }
    const hash = text.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pastelStrength = '93%'
    return `hsl(${hash % 360}, ${pastelStrength}, ${pastelStrength})`;
  }
}
