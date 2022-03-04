import { Component, OnInit } from '@angular/core';

declare const TradingView: any;

@Component({
  selector: 'app-chart',
  template: `<script src="http://iknow.com/this/does/not/work/either/file.js"></script>`,
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  constructor() { }

  ngOnInit() { }

}
interface Scripts {
  name: string;
  src: string;
}
export const ScriptStore: Scripts[] = [
  { name: 'filepicker', src: 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js' },
];
