import { Component, ElementRef, Input, OnChanges, OnInit, QueryList, Renderer2, SimpleChanges, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.css']
})

export class RadarComponent implements OnInit {
  @ViewChildren('barRadar', { read: ElementRef }) childComp!: QueryList<ElementRef>;
  expectBar!: ElementRef;

  margin = 30;
  width = 1250 - (this.margin * 2);
  height = 300 - (this.margin * 2);

  sessionStorage = sessionStorage;
  svg: any;
  data: any;

  chartOptions: any;

  subscription?: Subscription;

  @Input()
  dataContracts: any;

  constructor(private renderer: Renderer2, private authService: AuthService,
    private host: ElementRef) { }

  async ngOnInit() {
  }

  async ngAfterViewInit(): Promise<void> {

  }

  ngOnChanges() {
    // if (this.childComp && this.childComp.first && this.childComp.first.nativeElement) {
    //   if (this.childComp.first.nativeElement.offsetWidth && this.childComp.first.nativeElement.offsetHeight) {
    //     this.width = this.childComp.first.nativeElement.offsetWidth;
    //     this.height = this.childComp.first.nativeElement.offsetHeight;
    //     if (this.dataContracts?.length > 0) {
    //       this.createViewBox()
    //     }
    //   }
    // }
    if (this.childComp && this.childComp.first && this.childComp.first.nativeElement) {
      if (this.childComp.first.nativeElement.offsetWidth) {
        this.width = this.childComp.first.nativeElement.offsetWidth;
      }
      this.height = this.childComp.first.nativeElement.offsetHeight;
      if (this.dataContracts?.length > 0 && window.innerWidth >= 768) {
        this.createViewBox()
      }
    }
  }


  createViewBox() {
    this.svg = d3.select(this.childComp.first.nativeElement)
      .append("svg")
      .attr("viewBox", `0 0 ${this.width} ${(this.height)}`)
      .append("g")
    this.drawBars(this.dataContracts);
  }

  drawBars(data: any): void {
    if (!data) {
      return;
    } else {
      var objDatas: any = [];
      data.map((d: any) => {
        if (d.modalidade && d.status && d.data_compra) {
          var tempData = new Date(d.data_compra).toLocaleDateString();
          var result = data.filter((d: any) => new Date(d.data_compra).toLocaleDateString() === tempData)?.length;
          var tempObj = { qtddata: result, data: tempData, data_compare: (d.data_compra?.seconds * 1000) }
          let objExist = objDatas?.filter((d: any) => d.data == tempData)
          if (objExist.length == 0) {
            objDatas.push(tempObj)
          }
        }
      })
      data = objDatas;
      data = data.sort(function (a: any, b: any) {
        return a?.data_compare - b?.data_compare
      });
    }
    const colorGreenBar = "#007E7A";
    const colorNegativeBar = "#B9133E";
    const colorSuccessBar = "#69BE28";
    const colorGrayBar = "#ABACAD";
    let maxAccomplishedValue = Math.max.apply(Math, data.map((d: any) => { return +d.quantidadeContratos || 0; }))
    let maxGoalValue = Math.max.apply(Math, data.map((d: any) => { return +d.quantidadeContratos || 0; }))
    let maxValue = maxAccomplishedValue > maxGoalValue ? maxAccomplishedValue : maxGoalValue;

    const xScale = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map((d: any) => d.data || ''))
      .padding(0.3);

    const xScaleConvert = (data: any) => {
      return xScale(data);
    }

    const yScalepercentual = d3.scaleLinear()
      .range([this.height - this.margin, 100])
      .domain([0, 100])


    const yScale = d3.scaleLinear()
      .domain([0, (maxValue < 30 ? 30 : maxValue)])
      .range([this.height - this.margin, 30])

    this.svg.append("g")
      .attr('transform', `translate(0, ${this.height - this.margin - 15})`)
      .call(d3.axisBottom(xScale))
      .style("color", "transparent")

    this.svg.selectAll(".tick text")
      .style("color", '#fff')
      .call(this.wrap, xScale.step())
      .style("font", "4px Arial");

    this.svg.append("g")
      .append("path")
      .datum(data)
      .attr("d", d3.line<ILineData>()
        .x(function (d) {
          var descricao = d.data || '';
          return (xScaleConvert(descricao) || 0) + xScale.bandwidth() / 2;
        })
        .y(function (d) {
          return yScalepercentual(d.qtddata || 0)
        })
      )
      .attr("fill", "none")
      .attr("stroke", "#2a9fd6")
      .style("stroke-width", 1.5);

  }

  wrap(texts: any, width: any) {
    texts._groups[0].forEach((t: any) => {
      var text = d3.select(t),
        words = text.text().toUpperCase().split('/').reverse(),
        word,
        line: any[] = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = +text.attr("y") * 1 + 10,
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        let tspanNod = tspan.node();
        let tspanNodeValue = 0
        if (tspanNod)
          tspanNodeValue = tspanNod.getComputedTextLength();
        if (tspanNodeValue > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}

export interface ILineData {
  data: string;
  data_compra: string;
  quantidadeContratos: number;
  qtddata: number;
  quantidade_compra_usuario: number;
  total_pelo_aluguel: number;
  total_recebiveis_aluguel: number;
}
