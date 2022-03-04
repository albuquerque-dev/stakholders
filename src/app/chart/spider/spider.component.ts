import { Component, ElementRef, Input, OnChanges, OnInit, QueryList, Renderer2, SimpleChanges, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-spider',
  templateUrl: './spider.component.html',
  styleUrls: ['./spider.component.css']
})
export class SpiderComponent implements OnInit, OnChanges {
  @ViewChildren('expectBar', { read: ElementRef }) childComp!: QueryList<ElementRef>;
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

  async ngAfterViewInit() {

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
      if (this.dataContracts?.length > 0 && window.innerWidth) {
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
    }

    const colorGreenBar = "#007E7A";
    const colorNegativeBar = "#B9133E";
    const colorSuccessBar = "#69BE28";
    const colorGrayBar = "#ABACAD";
    let maxAccomplishedValue = Math.max.apply(Math, data.map((d: any) => { return +d.quantidade_compra_usuario || 0; }))
    let maxGoalValue = Math.max.apply(Math, data.map((d: any) => { return +d.total_recebiveis_aluguel || 0; }))
    let maxValue = maxAccomplishedValue > maxGoalValue ? maxAccomplishedValue : maxGoalValue;

    const xScale = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map((d: any) => d.periodo))
      .padding(0.3);

    const xScaleConvert = (data: any) => {
      return xScale(data);
    }

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
      .style("font", "6px Arial");

    const bars = this.svg.append("g")
      .selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      // .attr("id", data.graph_id)
      .attr("name", (d: any) => { return d.periodo })
      .attr("x", (d: any) => xScale(d.periodo))
      .attr('y', (d: any) => {
        let calcY = yScale(+d.quantidade_compra_usuario || 0);
        if (calcY < 8) {
          return +calcY + 13
        } else {
          return +calcY
        }
      })
      .attr("width", xScale.bandwidth())
      .attr("height", (d: any) => {
        let calcY = yScale(+d.quantidade_compra_usuario || 0);
        if (calcY < 8) {
          return (this.height - this.margin - yScale(+d.quantidade_compra_usuario || 0)) - 13
        } else {
          return this.height - this.margin - yScale(+d.quantidade_compra_usuario || 0)
        }
      })
      .attr('fill', (d: any) => {
        if (d.periodo === 'Total') {
          return '#f3ba2f';
        } else {
          return '#2a9fd6';
        }
      })


    this.svg.append("g")
      .selectAll("title")
      .data(data)
      .enter()
      .append('text')
      .attr("x", (d: any) => ((xScale(d.periodo) || 0) + xScale.bandwidth() / 2))
      .attr('y', (d: any) => {
        let calcY = (yScale(+d.quantidade_compra_usuario))
        return (calcY - 5) > 10 ? calcY - 5 : calcY + 8;
      })
      .style("font", "8px Arial")
      .style("fill", "#fff")
      .attr('text-anchor', 'middle')
      .text((d: any) => {
        return d.quantidade_compra_usuario.toLocaleString() + ' SH';
      })

    this.svg.append("g")
      .selectAll("title")
      .data(data)
      .enter()
      .append('text')
      .attr("x", (d: any) => ((xScale(d.periodo) || 0) + xScale.bandwidth() / 2))
      .attr('y', (d: any) => {
        let calcY = (yScale(+d.quantidade_compra_usuario))
        return calcY - 15;
      })
      .style("font", "8px Arial")
      .style("fill", "#fff")
      .attr('text-anchor', 'middle')
      .text((d: any) => {
        return 'US$: ' + (d.total_recebiveis_aluguel).toLocaleString();
      })
  }

  wrap(texts: any, width: any) {
    texts._groups[0].forEach((t: any) => {
      var text = d3.select(t),
        words = text.text().toUpperCase().split(/\s+/).reverse(),
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
