import { Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { FileUploadService } from 'src/app/uploader/file-upload.service';
import { Table } from 'primeng/table';
import * as FileSaver from 'file-saver';
import { RendaService } from '../renda/renda.service';

@Component({
  selector: 'app-administracao',
  templateUrl: './administracao.component.html',
  styleUrls: ['./administracao.component.css']
})
export class AdministracaoComponent implements OnInit, OnChanges {

  adminBar: MenuItem[] = [];
  preVendaData: any;
  relatorioPreVenda: boolean = false;
  contractsDataReport: any = []
  reportSelected: any;
  statuses: any;
  detailedInfoContract: any;
  detailedInfoModal: boolean = false;
  modalInfoSubmited: boolean = false;
  fileUploads?: any[];
  selectedComprovanteLink: any;
  userInfo: any;
  hashSingleVerify: any;
  contractStatus: any[] = [];
  selectedContractInfo: any;
  selectedContractStatus: any;
  showLoading: boolean = false;
  contractCancelTextReason: any;
  userData: any;
  userDataReport: any;
  contractData: any;
  selectedInfoType: any;
  selectedUserInfo: any;
  selectedUserContractInfo: any;
  selectedUserContractTable: any;
  searchOptions: any[] = [];
  relatorioUsuarios: boolean = false;
  relatorioContratoAluguel: boolean = true;
  modalUserInfo: boolean = false;
  contracInputSearch: any;
  // contractQuantity: any;
  @ViewChild('dt') dt: Table | undefined;

  @Input()
  contractQuantity: any;
  @Input()
  contractUsdValue: any;
  @Input()
  contractValuePay: any;

  private u1a = 'gisliel.medley@gmail.com';
  private u2a = 'marcwell15@gmail.com'
  private u3a = 'franchitrader@gmail.com'
  private u4a = 'magnatatoken@gmail.com'
  private u5a = 'chrisedfisica@hotmail.com'
  cotacaoValoresSH: any;
  convertedEntrySH: any;
  totalValueUsd: number = 0;
  percentlValueUsd: number = 0;
  hashtransactions: any;
  exportColumns: any;
  cols: any;
  excelDataTable: any;
  paidStatus: any;
  statusList: any;
  consultAddressResult: any;
  contractCancelQty: any;
  cancelStatus: any;
  cotacaoValoresSHUSD: any;
  cotacaoValoresBNBUSD: any;
  openSelectPeriodo: boolean = false;
  periodList: any;
  selectedPeriodExcel: any;
  selectedStatusExcel: any;
  excelList: any;
  invalidContracts: any;
  updatedContracts: any;
  updateStatus: any;
  contratosVencendo: any;
  contratosResgatados: any;

  constructor(private _renderer2: Renderer2,
    private router: Router,
    private act: ActivatedRoute,
    private authService: AuthService,
    private rendaService: RendaService,
    private confirmationService: ConfirmationService,
    private fileUploadService: FileUploadService) { }

  async ngOnInit() {
    this.showLoading = true;
    // await this.getPreVendasReport();
    await this.setPageInfo()
    if (this.userInfo?.email === this.u1a || this.userInfo?.email === this.u2a || this.userInfo?.email === this.u3a || this.userInfo?.email === this.u4a || this.userInfo?.email === this.u5a) {

      let resultSH = await this.authService.getCotationSHUSD()
      this.cotacaoValoresSHUSD = resultSH?.data?.quote[0].price?.toFixed(5);
      let resultBNB = await this.rendaService.getCotationBNBUSD()
      this.cotacaoValoresBNBUSD = resultBNB?.result?.ethusd;

      // this.cotacaoValoresSH = await this.authService.getCotationSHUSD()
      // this.getCotationPricesSH(this.cotacaoValoresSH.data)

      this.hashtransactions = await this.authService.getContractTransations();
      await this.getContractInfos();
      await this.consultUserInfo();
      console.log(this.contractsDataReport)

      this.cols = [
        { field: 'nome', header: 'Periodo' },
        { field: 'email', header: 'Nome' },
        { field: 'modalidade', header: 'Token' },
        { field: 'quantidade_compra_usuario', header: 'Alugado' },
        { field: 'total_recebiveis_aluguel', header: 'Total Recebiveis' },
        { field: 'carteira', header: 'Carteira' },
        { field: 'hash', header: 'Hash' },
        { field: 'status', header: 'Status' },
      ];

      this.exportColumns = this.cols.map((col: any) => ({ title: col.header, dataKey: col.field }));
      this.statuses = [
        { label: "Pendente", value: "pendente" },
        { label: "Cancelado", value: "cancelado" },
        { label: "Aprovado", value: "aprovado" },
        { label: "Em Análise", value: "analise" }
      ];

      this.excelList = [
        { name: "Todos", code: "todos" },
        { name: "Pagamento Pendente", code: "pagamento-pendente" },
        { name: "Á Vencer", code: "vencendo" },
        { name: "Aprovado", code: 'aprovado' },
        { name: "Atualizados", code: 'atualizado' },
        { name: "Resgatados", code: 'resgatado' },
        { name: "Solicitado Cancelamento", code: 'solicitado-cancelamento' }
      ]

      this.periodList = [
        { name: "Todos", code: "todos" },
        { name: "30 Dias", code: "30" },
        { name: "60 Dias", code: "60" },
        { name: "90 Dias", code: "90" },
        { name: "120 Dias", code: "120" },
        { name: "150 Dias", code: "150" },
      ]

      this.paidStatus = [
        { name: "Resgatado", code: "resgatado" },
        { name: "Pago", code: "pago-resgate" },
      ]

      this.cancelStatus = [
        { name: "Solicitado Cancelamento", code: "solicitado-cancelamento" },
        { name: "Pago", code: "pago-cancelamento" },
      ]

      this.contractStatus = [
        { name: 'Aprovado', code: 'aprovado' },
        { name: 'Atualização Paga', code: 'pago-atualizacao' },
        { name: 'Cancelado', code: 'cancelado' },
        { name: 'Em Análise', code: 'analise' },
        { name: 'Pendente', code: 'pendente' },
      ];

      this.adminBar = [{
        label: 'Painel',
        icon: 'pi pi-fw pi-pencil',
        items: [
          { label: 'Relatório Renda Passiva', icon: 'pi pi-fw pi-trash', command: () => { this.relatorioContratoAluguel = true; this.relatorioUsuarios = false } },
          { label: 'Listagem de Usuários', icon: 'pi pi-fw pi-trash', command: () => { this.relatorioContratoAluguel = false; this.relatorioUsuarios = true } }
        ]
      }

      ];
      this.showLoading = false;
    } else {
      window.alert('Acesso não autorizado.')
      this.authService.logout();
    }
  }

  async adjustCarteirasUppercase() {
    this.contractsDataReport.forEach((d: any) => {
      if (d?.uid && d?.contract_id && d.carteira) {
        console.log(d)
        let newCarteira = d.carteira.toLowerCase();
        this.authService.changeContractStatus(d.path, { carteira: newCarteira, path: '', pathc: '' })
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  getCotationPricesSH(values: any) {
    if (values) {
      this.convertedEntrySH = values.quote[0]?.price?.toFixed(6);
      if (this.convertedEntrySH) {
        this.convertedEntrySH = +this.convertedEntrySH
      } else {
        this.convertedEntrySH = 0;
      }
    }
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    }
  }

  async getContractInfos() {
    this.contratosVencendo = [];
    let getContractsReports: any = await this.authService.getAllContractInfo();
    this.contractsDataReport = getContractsReports.docs.map((d: any) => ({ contract_id: d.id, path: d.ref.path, ...d.data() }));
    let updatedContracts: any = await this.authService.getAllContractUpdate();
    this.updatedContracts = updatedContracts.docs.map((d: any) => ({ contract_id: d.id, pathc: d.ref.path, ...d.data() }));
    let resgatados: any = await this.authService.getAllContractResgate();
    this.contratosResgatados = resgatados.docs.map((d: any) => ({ contract_id: d.id, path: d.ref.path, ...d.data() }));


    this.contractsDataReport.map(async (d: any) => {
      if (d?.uid && d?.contract_id && d.data_incio.seconds) {
        console.log(d)
        d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
        await this.authService.changeContractStatus(d.path, { data_incio: d.data_incio })
      }

      if (d?.uid && d?.contract_id && d.data_compra.seconds) {
        console.log(d)
        d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
        await this.authService.changeContractStatus(d.path, { data_compra: d.data_compra })
      }

      if (d?.uid && d?.contract_id && d.data_fim.seconds) {
        console.log(d)
        d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
        await this.authService.changeContractStatus(d.path, { data_fim: d.data_fim })
      }
      delete d.compensacao_stakholders;
      delete d.bonificacao;
      delete d.rendimento_usuario_usd;
      delete d.rendimento_usuario;
      delete d.param;
      delete d.saldo_usuario_sh;
      delete d.saldo_usuario_bnb;
      d.cotacao_sh_atual = this.cotacaoValoresSHUSD;
      d.cotacao_bnb_atual = this.cotacaoValoresBNBUSD;
      if (d.modalidade === 'Stakholders') {
        d.pagamento_final = (+d.total_pelo_aluguel / +this.cotacaoValoresSHUSD)
        let valorDolar = +(+d.total_recebiveis_aluguel - +d.total_pelo_aluguel)
        let valorUnitario = +(valorDolar / +d.quantidade_compra_usuario).toFixed(6)
        d.cotacao_sh = (+valorUnitario)
      } else if (d.modalidade === 'Bnb') {
        d.pagamento_final = (+d.total_pelo_aluguel / +this.cotacaoValoresBNBUSD)
        let valorDolar = +(+d.total_recebiveis_aluguel - +d.total_pelo_aluguel)
        let valorUnitario = +(valorDolar / +d.quantidade_compra_usuario).toFixed(2)
        d.cotacao_bnb = (+valorUnitario)
      }
      if (d.status === 'aprovado' || d.status === 'atualizado') {
        let today = new Date();
        let dataInicio = new Date(d.data_incio);
        let dataFim = new Date(d.data_fim);
        let dataFimNova = new Date(new Date(d.data_compra).setDate(new Date(d.data_compra).getDate() + +d.periodo)).toUTCString();
        let sevenDays = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() - 10));
        let futureDate = new Date(new Date(dataFim).setDate(new Date(dataFim).getDate() + 10));
        let dataInicioNova = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() - +d.periodo)).toUTCString();

        // this.authService.changeContractComprovantes(d.uid, d.contract_id, { data_incio: dataInicioNova, path: '', pathc: '' })

        if (dataInicio > today && (d.status === 'aprovado' || d.status === 'atualizado')) {
          console.log(d)

        // this.authService.changeContractComprovantes(d.uid, d.contract_id, { data_incio: d.data_compra, data_fim: dataFimNova, path: '', pathc: '' })

        }



        if (today >= sevenDays && today <= futureDate) {
          d.vencendo = true;
          this.contratosVencendo.push(d);
        }
        delete d.total_resgate;
        delete d.total_pelo_cancelamento;
        (this.totalValueUsd += +d.total_recebiveis_aluguel || 0); (this.percentlValueUsd += +d.total_pelo_aluguel || 0)
      }
    });
    this.updatedContracts.map((d: any) => {
      if (d?.pathc && d.data_incio.seconds) {
        console.log(d)
        d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
        this.authService.changeContractStatus(d.pathc, { data_incio: d.data_incio })
      }

      if (d?.pathc && d.data_compra.seconds) {
        console.log(d)
        d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
        this.authService.changeContractStatus(d.pathc, { data_compra: d.data_compra })
      }

      if (d?.pathc && d.data_fim.seconds) {
        console.log(d)
        d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
        this.authService.changeContractStatus(d.pathc, { data_fim: d.data_fim })
      }

      if (d.status === 'pago' || d.status === 'pago-resgate' || d.status === 'pago-atualizacao') {
        this.contractsDataReport.push(d)
      }
      // if (d.status === 'pago' && d.pathc && (d.hash ==
      // )
      // ) {
      //   console.log('ajustado', d)
      //   // this.authService.changeContractStatus(d.pathc, { status: 'pago-atualizacao', path: '', pathc: '' })
      // }

      delete d.total_resgate;
      delete d.total_pelo_cancelamento;
      delete d.compensacao_stakholders;
      delete d.bonificacao;
      delete d.rendimento_usuario_usd;
      delete d.rendimento_usuario;
      delete d.param;
      delete d.saldo_usuario_sh;
      delete d.saldo_usuario_bnb;
      d.cotacao_sh_atual = this.cotacaoValoresSHUSD;
      d.cotacao_bnb_atual = this.cotacaoValoresBNBUSD;
      if (d.status === 'aprovado' || d.status === 'atualizado') {
        let today = new Date();
        let dataFim = new Date(d.data_fim);
        let sevenDays = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() - 7));
        let futureDate = new Date(new Date(dataFim).setDate(new Date(dataFim).getDate() + 1));
        if (today >= sevenDays && today <= futureDate) {
          d.vencendo = true;
          this.contratosVencendo.push(d);
        }
        if (d.modalidade === 'Stakholders') {
          d.pagamento_final = (+d.total_pelo_aluguel / +this.cotacaoValoresSHUSD)
          let valorDolar = +(+d.total_recebiveis_aluguel - +d.total_pelo_aluguel)
          let valorUnitario = +(valorDolar / +d.quantidade_compra_usuario).toFixed(6)
          d.cotacao_sh = (+valorUnitario)
        } else if (d.modalidade === 'Bnb') {
          d.pagamento_final = (+d.total_pelo_aluguel / +this.cotacaoValoresBNBUSD)
          let valorDolar = +(+d.total_recebiveis_aluguel - +d.total_pelo_aluguel)
          let valorUnitario = +(valorDolar / +d.quantidade_compra_usuario).toFixed(2)
          d.cotacao_bnb = (+valorUnitario)
        }
      }
    })
    this.contractsDataReport = this.contractsDataReport.sort(function (a: any, b: any) {
      return b?.status?.localeCompare(a?.status)
    });
    this.contractsDataReport.map((d: any) => {
      let transaction = this.hashtransactions?.result?.filter((c: any) => c.hash === d?.hash?.trim() && c.from.toLowerCase() === d.carteira?.toLowerCase() && c.to?.toLowerCase() === '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a')
      if (transaction.length !== 0) {
        let conversao = (transaction[0]?.value / 1000000000)
        let decimais = conversao.toFixed(2)
        let quantidadeAjustada = +decimais;
        d.quantidade_hash = quantidadeAjustada;
      }
    })

    this.contratosResgatados.map((d: any) => {
      delete d.total_resgate;
      delete d.total_pelo_cancelamento;
      delete d.compensacao_stakholders;
      delete d.bonificacao;
      delete d.rendimento_usuario_usd;
      delete d.rendimento_usuario;
      delete d.param;
      delete d.saldo_usuario_sh;
      delete d.saldo_usuario_bnb;
      d.cotacao_sh_atual = this.cotacaoValoresSHUSD;
      d.cotacao_bnb_atual = this.cotacaoValoresBNBUSD;
      if (d.status === 'resgatado' || d.status === 'pago') {
        if (d.modalidade === 'Stakholders') {
          d.pagamento_final = (+d.total_pelo_aluguel / +this.cotacaoValoresSHUSD)
          let valorDolar = +(+d.total_recebiveis_aluguel - +d.total_pelo_aluguel)
          let valorUnitario = +(valorDolar / +d.quantidade_compra_usuario).toFixed(6)
          d.cotacao_sh = (+valorUnitario)
        } else if (d.modalidade === 'Bnb') {
          d.pagamento_final = (+d.total_pelo_aluguel / +this.cotacaoValoresBNBUSD)
          let valorDolar = +(+d.total_recebiveis_aluguel - +d.total_pelo_aluguel)
          let valorUnitario = +(valorDolar / +d.quantidade_compra_usuario).toFixed(2)
          d.cotacao_bnb = (+valorUnitario)
        }
      }
    })

    this.contractsDataReport.map((d: any) => {

      // let dataFim = new Date(d.data_fim);
      // let futureDate = new Date(new Date(dataFim).setDate(new Date(dataFim).getDate() - d.periodo)).toUTCString();
      // if(futureDate){
      //   this.authService.changeContractStatus(d.path, { data_incio: futureDate })
      // }


      if (d.status === 'atualizado') {
        let result = this.updatedContracts.filter((e: any) => e.hash === d.hash)


        let today = new Date();
        let dataF = new Date(d.data_fim);
        let dataI = new Date(d.data_fim);
        let dataC = new Date(d.data_compra);
        // let sevenDays = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() - 7));
        let futureD = new Date(new Date(dataC).setDate(new Date(dataC).getDate() + 5));

        // console.log(result)
        // if (result?.length > 0) {
        // } else {
        //   let today = new Date();
        //   let dataFim = new Date(d.data_fim);
        //   let dataCompra = new Date(d.data_compra);
        //   let sevenDays = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() - 7));
        //   let futureDate = new Date(new Date(dataCompra).setDate(new Date(dataCompra).getDate() + d.periodo + 5));
        //   console.log('igual', d)
        //   if (futureDate > dataFim) {
        //     console.log('menor', d)
        //   } else {
        //     let dataInicio = new Date(d.data_compra).toUTCString();
        //     let dataCompra = new Date(d.data_compra);
        //     let dataF = new Date(new Date(dataCompra).setDate(new Date(dataCompra).getDate() + d.periodo)).toUTCString();
        //     // this.authService.addDocumentTo(d.uid, d.contract_id, d, 'atualizacao')
        //     console.log('maior', d)
        //     this.authService.changeContractStatus(d.pathc, { data_incio: dataInicio, data_fim: dataF, path: '', pathc: '' })
        //   }
        // }
      }


      // if (d.status === 'pago' && d.path && (d.hash ==
      //   '0x26a6ed11508eca007623299c4a5763ff310e346b0772f4191ac2957f72c8ed79' ||
      //   '0x26a6ed11508eca007623299c4a5763ff310e346b0772f4191ac2957f72c8ed79' ||
      //   '0xec539bce3678646cbf04226125e922f3c7151541883cbe7faf2491e3aeb8b8ed' ||
      //   '0xccaad692eb577c79e63e9c2099031da9184131a3d5970c899b00bfd04d87a409' ||
      //   '0x58d4c3418df84710925aa95c65cb41f65a97876cdb071179a1bf14d77ffa3d83' ||
      //   '0xe6f3050cca2de3367aff0b19fb1fcb87a318bc556579e44e589d0e6694743ca4' ||
      //   '0x3fa05b0e4bf528de4fc2e04b62b31845fdc45f12b6c1500d1882cf448cb1cab8' ||
      //   '0x4781f923a1f8f4f4bb33d7df01b7c2cb7ff0aad6e09a69434ddd7a9957d4711c' ||
      //   '0xa0a05f05e04605328d908b9fcd2b545db2960546ac01159628cc3fd6e671d446' ||
      //   '0x26a6ed11508eca007623299c4a5763ff310e346b0772f4191ac2957f72c8ed79'
      // )
      // ) {
      //   console.log('ajustado', d)
      //   this.authService.changeContractStatus(d.path, { status: 'pago-resgate', path: '', pathc: '' })
      // }

    })

    let atualizados = this.contractsDataReport.filter((d: any) => d.status === 'atualizado')
    console.log(atualizados)
    this.contratosResgatados = this.contractsDataReport;
    this.showLoading = false;
  }

  async adjustContractValues(array: any) {
    this.hashtransactions = await this.authService.getContractTransations();
    array.map((contrato: any) => {
      let dataHoje = new Date('02-02-2022');
      let dataContrato = contrato.data_compra?.toDate();
      let validarData = (contrato.data_compra?.toDate() <= dataHoje)
      if (contrato.modalidade === 'Stakholders' && validarData && contrato.status === 'aprovado') {
        var bonusPeriodo = 0;
        var calculoMoeda = 0;
        var percentual = 0;
        var calculoPercentual = 0;
        var outputEntry = 0;
        var outputEntryUsd = 0;
        var totalRecebiveisAluguelUsd = 0;
        if (contrato.periodo === 30) {
          bonusPeriodo = 0.3;
        }
        if (contrato.periodo === 60) {
          bonusPeriodo = 0.7;
        }
        if (contrato.periodo === 90) {
          bonusPeriodo = 1.0;
        }
        if (contrato.periodo === 120) {
          bonusPeriodo = 1.5;
        }
        if (contrato.periodo === 150) {
          bonusPeriodo = 2.0;
        }

        if (contrato.modalidade === 'Stakholders') {
          // if (this.convertedEntrySH) {
          calculoMoeda = contrato.quantidade_compra_usuario * 0.005;
          percentual = calculoMoeda * bonusPeriodo;
          calculoPercentual = percentual + calculoMoeda;
          // VALOR EM DOLAR

          outputEntry = calculoMoeda;

          totalRecebiveisAluguelUsd = calculoPercentual - outputEntry;

          outputEntryUsd = calculoPercentual;
        }
        var transaction = this.hashtransactions?.result?.filter((c: any) => c.hash === contrato?.hash?.trim() && c.from.toLowerCase() === contrato.carteira?.toLowerCase() && c.to === '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a')
        if (transaction.length !== 0) {
          var conversao = (transaction[0]?.value / 1000000000)
          var decimais = conversao.toFixed(2)
          var quantidadeAjustada = decimais;
          var quantidadeComparar = decimais?.replace('.', '');
          if (quantidadeComparar.includes(contrato.quantidade_compra_usuario?.toString()?.replace(',', '')?.replace('.', ''))
            && contrato.total_pelo_aluguel === +totalRecebiveisAluguelUsd && contrato.total_recebiveis_aluguel === +outputEntryUsd) {
            console.log([quantidadeComparar, contrato.quantidade_compra_usuario, contrato.total_pelo_aluguel, totalRecebiveisAluguelUsd, contrato.total_recebiveis_aluguel, +outputEntryUsd])
          } else {
            console.log();
            this.authService.changeContractStatus(contrato.path, { quantidade_compra_usuario: +quantidadeAjustada, total_pelo_aluguel: +totalRecebiveisAluguelUsd, total_recebiveis_aluguel: +outputEntryUsd, path: '', pathc: '' })
            console.log('ajustado')
          }
        }
        // if (calculoMoeda && percentual && calculoPercentual && contrato.uid && contrato.total_pelo_aluguel !== +totalRecebiveisAluguelUsd && contrato.total_recebiveis_aluguel !== +outputEntryUsd) {
        //   console.log('ok')
        // }
      }
    })
  }

  adjustOldContracts() {
    // window.alert("Atualizando Contratos");
    console.log(this.contractsDataReport.length);
    this.contractsDataReport.map((d: any) => {
      let dataInicio = new Date(d.data_incio)
      let dataFim = new Date(d.data_fim)
      let dataHoje = new Date()
      let dataCompra = new Date(d.data_compra)
      let dataCompraNew = new Date(new Date(d.data_compra).setDate(new Date(d.data_compra).getDate() + 3));

      if (dataCompraNew < dataInicio && d.status === 'pago') {
        this.authService.changeContractComprovantes(d.uid, d.contract_id, { status: 'atualizado' })
        console.log('ok')
      }

      var calculoMoeda, taxaDescontoAtualizacao, inputQuantityUsd, calculoPercentual, valueDifference, totalValue, percentual = 0
      if (dataFim < dataHoje && (d.status === 'atualizado' || d.status === 'aprovado' && d.valor_quantidade)) {
        if (d.modalidade === 'Stakholders' && d.valor_quantidade) {
          this.authService.backupContract(d.uid, d)

          calculoMoeda = d.valor_quantidade;

          // if (this.approvedContracts?.length > 0) {
          calculoMoeda = (+calculoMoeda - (+calculoMoeda * 0.06));
          taxaDescontoAtualizacao = (+calculoMoeda * 0.06);
          inputQuantityUsd = +calculoMoeda
          // }

          percentual = d.total_pelo_aluguel;
          calculoPercentual = percentual + calculoMoeda;
          // VALOR EM DOLAR
          inputQuantityUsd = calculoMoeda;
          // DIFERENÇA A PAGAR
          d.total_pelo_aluguel = calculoPercentual - calculoMoeda;
          // VALOR TOTAL
          d.total_recebiveis_aluguel = calculoPercentual;
        }
        if (d.modalidade === 'Bnb' && d.valor_quantidade) {
          this.authService.backupContract(d.uid, d)

          calculoMoeda = d.valor_quantidade;
          // if (this.approvedContracts?.length > 0) {
          calculoMoeda = (+calculoMoeda - (+calculoMoeda * 0.06));
          taxaDescontoAtualizacao = (+calculoMoeda * 0.06);
          inputQuantityUsd = +calculoMoeda;
          // }

          percentual = d.total_pelo_aluguel;
          calculoPercentual = percentual + calculoMoeda;
          // VALOR EM DOLAR
          inputQuantityUsd = calculoMoeda;
          // DIFERENÇA A PAGAR
          d.total_pelo_aluguel = calculoPercentual - calculoMoeda;
          // VALOR TOTAL
          d.total_recebiveis_aluguel = calculoPercentual;
        }


        let dataInicioNova = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate())).toUTCString();
        let dataFimNova = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() + +d.periodo)).toUTCString();
        console.log(d, dataInicioNova, dataFimNova)
        this.authService.changeContractComprovantes(d.uid, d.contract_id, { total_pelo_aluguel: d.total_pelo_aluguel, total_recebiveis_aluguel: d.total_recebiveis_aluguel, path: '', pathc: '', data_incio: dataInicioNova, data_fim: dataFimNova, status: 'atualizado' })
        this.authService.addDocumentTo(d.uid, d.contract_id, d, 'atualizacao')
      }


      // if (dataCompra > dataCompraNew) {
      // let dataFimAtt = new Date(new Date(d.data_compra).setDate(new Date(d.data_compra).getDate() + +d.periodo)).toUTCString();
      // this.authService.changeContractStatus(d.path, { data_fim_antes_att: dataFimAtt, path: '', pathc: '' })
      // }
      // if (d?.path && d.data_incio?.seconds) {
      //   console.log(d)
      //   d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
      //   await this.authService.changeContractStatus(d.path, { data_incio: d.data_incio })
      // }

      // if (d?.path && d.data_compra?.seconds) {
      //   console.log(d)
      //   d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
      //   await this.authService.changeContractStatus(d.path, { data_compra: d.data_compra })
      // }

      // if (d?.path && d.data_fim?.seconds) {
      //   console.log(d)
      //   d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
      //   await this.authService.changeContractStatus(d.path, { data_fim: d.data_fim })
      // }

      // if ((d.status === 'aprovado' || d.status === 'atualizado') && d.path && d.data_incio && d.data_fim && d.data_compra) {
      // if (dataFim < dataHoje) {
      // let novaDataFim = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() + +d.periodo)).toUTCString();
      // console.log(dataFim, novaDataFim, dataHoje)
      // await this.authService.changeContractStatus(d.path, { data_fim_antes_att: d.data_fim, data_incio: dataFim, data_fim: novaDataFim, status: 'atualizado' })
      // }
      // }
    });
  }

  exportExcel(path: string) {
    this.openSelectPeriodo = true;
    // this.choosePeriodoToExcel(path)
  }

  choosePeriodoToExcel(path: any, periodo: any) {
    let dataToExcel: any;
    if (periodo && path) {
      if (path === 'pagamento-pendente') {
        if (periodo === 'todos') {
          dataToExcel = this.updatedContracts.filter((d: any) => d.status === 'atualizado');
        }
        if (periodo !== 'todos') {
          dataToExcel = this.updatedContracts.filter((d: any) => d.status === path && +d.periodo === +periodo);
        }
      } else {
        if (path === 'todos' && periodo === 'todos') {
          dataToExcel = this.contractsDataReport;
        } else if (periodo !== 'todos' && path === 'todos') {
          dataToExcel = this.contractsDataReport.filter((d: any) => +d.periodo === +periodo);
        } else if (periodo === 'todos' && path !== 'todos' && path !== 'vencendo') {
          dataToExcel = this.contractsDataReport.filter((d: any) => d.path === path);
        } else if (periodo === 'todos' && path === 'vencendo') {
          dataToExcel = this.contratosVencendo;
        } else if (periodo !== 'todos' && path === 'vencendo') {
          dataToExcel = this.contratosVencendo.filter((d: any) => d.vencendo === true && +d.periodo === +periodo);
        } else {
          dataToExcel = this.contractsDataReport.filter((d: any) => d.status === path && +d.periodo === +periodo && (d.status !== 'pago' || d.status !== 'pago-cancelamento'))
        }
      }
    }
    if (periodo && path) {
      import("xlsx").then(xlsx => {
        let worksheet = xlsx.utils.json_to_sheet(dataToExcel);
        let workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        let excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "relatorio");
      });
    }
  }


  exportInvalidContracts() {
    this.invalidContracts = [];
    this.contractsDataReport.map((d: any) => {
      if (d.status === 'aprovado') {
        let objTemp: any = this.authService.verifyHashTransaction(d?.carteira?.toLowerCase()?.trim())
        if (objTemp && objTemp.status === '1') {
          let transaction = objTemp?.result?.filter((c: any) => c.hash?.toLowerCase() === d.hash?.trim()?.toLowerCase())
          if (transaction[0]?.length > 0 &&
            (transaction[0]?.from.toLowerCase() !== d.carteira?.toLowerCase() ||
              transaction[0]?.to !== '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a' ||
              transaction[0]?.from.toLowerCase() === d.carteira?.toLowerCase() ||
              transaction[0]?.to === '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a')
          ) {
            console.log(transaction[0])
            // this.invalidContracts?.push(transaction[0])
          }
        }
      }
    })
  }


  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  async consultUserInfo() {
    this.showLoading = true;
    let getContractsReports: any = await this.authService.getAllUSerInfo();
    this.userDataReport = getContractsReports.docs.map((d: any) => ({ user_id: d.id, path: d.ref.path, ...d.data() }));
    this.userDataReport.sort(function (a: any, b: any) {
      return (a?.nome) - (b?.nome)
    });
    this.showLoading = false;
  }

  openUserInformation(user: any) {
    this.modalUserInfo = true;
    this.selectedUserInfo = user;
    this.selectedUserContractInfo = this.contractsDataReport?.filter((d: any) => d.email === user.email)[0];
    this.selectedUserContractTable = this.contractsDataReport?.filter((d: any) => d.email === user.email);
    console.log('');
  }

  async validateContract(array: any) {
    //   {
    //     "blockNumber": "14111532",
    //     "timeStamp": "1641421702",
    //     "hash": "0x09643e46acae420e2fbd8856a5dba76835e1063e2425e5f2e4ef0daf015b19e5",
    //     "nonce": "15",
    //     "blockHash": "0x8d5a38b86973dc0d2c0dc62b6cc3ef4b4c5307973426f0165a287ea1bf35ec05",
    //     "from": "0x8d151d900fc5c85ea7b032cd5deac0c2c577240a",
    //     "contractAddress": "0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52",
    //     "to": "0x6280b94145a06a9aa345bd0cfc5786b7d052869f",
    //     "value": "254250000000000",
    //     "tokenName": "StakHolders",
    //     "tokenSymbol": "SH",
    //     "tokenDecimal": "9",
    //     "transactionIndex": "55",
    //     "gas": "18247518",
    //     "gasPrice": "6000000000",
    //     "gasUsed": "17372003",
    //     "cumulativeGasUsed": "23031113",
    //     "input": "deprecated",
    //     "confirmations": "794820"
    // }
    let objTemp = await this.authService.getContractTransations();
    console.log(objTemp)
    array.forEach(async (contrato: any) => {
      if (contrato.modalidade === 'Stakholders' && contrato.status === 'pendente') {
        let transaction = objTemp?.result?.filter((c: any) => c.hash === contrato?.hash?.trim())
        if (transaction.length !== 0) {
          console.log(transaction)
          if (
            contrato.uid &&
            contrato.contract_id &&
            contrato.quantidade_compra_usuario &&
            contrato.carteira &&
            transaction &&
            transaction.length > 0 &&
            transaction[0]?.value?.includes(+contrato.quantidade_compra_usuario?.toString()?.replace(',', '')?.replace('.', '')) &&
            transaction[0]?.from.toLowerCase() === contrato.carteira?.toLowerCase() &&
            transaction[0]?.to === '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a') {
            this.authService.changeContractStatus(contrato.path, { status: 'aprovado', path: '', pathc: '' })
            // console.log('aprovado')
          } else {
            console.log([contrato, transaction[0]])
          }
        }
      }
    });
  }

  async changeStatusContract(contract: any) {
    try {
      if (this.selectedContractStatus && this.selectedContractStatus.code) {
        if (this.selectedContractStatus?.code?.toUpperCase() === 'CANCELADO' || this.selectedContractStatus?.code?.toUpperCase() === 'ANALISE') {
          await this.authService.changeContractStatus(contract.path, { status: this.selectedContractStatus?.code, comentario: this.contractCancelTextReason, path: '', pathc: '' })
        } else {
          await this.authService.changeContractStatus(contract.path, { status: this.selectedContractStatus?.code, path: '', pathc: '' })
        }
      }
      if (this.contractUsdValue && this.contractUsdValue > 0) {
        await this.changeContractValueUsd(contract);
      }
      if (this.contractValuePay && this.contractValuePay > 0) {
        await this.changeContractValuePayment(contract);
      }
      if (this.contractQuantity && this.contractQuantity > 0) {
        await this.authService.changeContractStatus(contract.path, { quantidade_compra_usuario: this.contractQuantity, path: '', pathc: '' })
      }
      if (this.contractCancelQty && this.contractCancelQty > 0) {
        await this.authService.changeContractStatus(contract.path, { total_pelo_cancelamento: this.contractCancelQty, path: '', pathc: '' })
      }
      await this.clearData()
      await this.getContractInfos();
    } catch (error) {
      window.alert('Erro ao alterar contrato')
    }
  }

  async changeContractValueUsd(contract: any) {
    try {
      if (this.contractUsdValue) {
        await this.authService.changeContractStatus(contract.path, { total_pelo_aluguel: this.contractUsdValue, path: '', pathc: '' })
      }
    } catch (error) {
      window.alert('Erro ao alterar contrato')
    }
  }

  async changeContractValuePayment(contract: any) {
    try {
      if (this.contractValuePay) {
        await this.authService.changeContractStatus(contract.path, { total_recebiveis_aluguel: this.contractValuePay, path: '', pathc: '' })
      }
    } catch (error) {
      window.alert('Erro ao alterar contrato')
    }
  }

  downloadComprovanteUser(file_code: any): any {
    let fileActive: any = this.fileUploads?.filter((f: any) => f.name?.split('.')[0] == file_code?.toString())
    if (fileActive && fileActive.length > 0) {
      return fileActive[0].url;
    }
  }

  applyFilterGlobal(event: any, stringVal?: any, name?: any) {
    this.dt!.filterGlobal(event.target.value, 'contains');
  }

  async checkHashFromBscScan(contrato: any) {
    let responseHash = await this.authService.getHashInfoBsc(contrato.hash?.trim())
    if (responseHash.result) {
      this.hashSingleVerify = responseHash.result
    }
  }

  editContractInfo(contrato: any) {
    this.detailedInfoContract = { ...contrato };
    this.detailedInfoModal = true;
  }

  async hideModalContractInfo() {
    this.detailedInfoModal = false;
    this.modalInfoSubmited = false;
    this.selectedContractInfo = [];
    this.selectedContractStatus = [];
    this.contractCancelTextReason = '';
    this.contractUsdValue = null;
    this.contractQuantity = null;
    this.contractValuePay = null;
    this.getContractInfos();
  }

  clearData() {
    this.contractUsdValue = null;
    this.contractQuantity = null;
    this.contractValuePay = null
    this.contractCancelQty = null;
    this.hideModalContractInfo()
    window.alert('Contrato alterado com sucesso')
  }

  checkTotalPeloAluguel(contrato: any): any {
    if (contrato.modalidade === 'Stakholders') {
      var bonusPeriodo = 0;
      var calculoMoeda = 0;
      var percentual = 0;
      var calculoPercentual = 0;
      var outputEntry = 0;
      var outputEntryUsd = 0;
      var totalRecebiveisAluguelUsd = 0;
      if (contrato.periodo === 30) {
        bonusPeriodo = 0.3;
      }
      if (contrato.periodo === 60) {
        bonusPeriodo = 0.7;
      }
      if (contrato.periodo === 90) {
        bonusPeriodo = 1.0;
      }
      if (contrato.periodo === 120) {
        bonusPeriodo = 1.5;
      }
      if (contrato.periodo === 150) {
        bonusPeriodo = 2.0;
      }

      if (contrato.modalidade === 'Stakholders') {
        // if (this.convertedEntrySH) {
        calculoMoeda = contrato.quantidade_compra_usuario * 0.005;
        percentual = calculoMoeda * bonusPeriodo;
        calculoPercentual = percentual + calculoMoeda;
        // VALOR EM DOLAR

        outputEntry = calculoMoeda;

        totalRecebiveisAluguelUsd = calculoPercentual - outputEntry;

        outputEntryUsd = calculoPercentual;

        return +calculoPercentual;
      }
    }
  }

  checkTotalRecebiveisAluguel(contrato: any): any {
    if (contrato.modalidade === 'Stakholders') {
      var bonusPeriodo = 0;
      var calculoMoeda = 0;
      var percentual = 0;
      var calculoPercentual = 0;
      var outputEntry = 0;
      var outputEntryUsd = 0;
      var totalRecebiveisAluguelUsd = 0;
      if (contrato.periodo === 30) {
        bonusPeriodo = 0.3;
      }
      if (contrato.periodo === 60) {
        bonusPeriodo = 0.7;
      }
      if (contrato.periodo === 90) {
        bonusPeriodo = 1.0;
      }
      if (contrato.periodo === 120) {
        bonusPeriodo = 1.5;
      }
      if (contrato.periodo === 150) {
        bonusPeriodo = 2.0;
      }

      if (contrato.modalidade === 'Stakholders') {
        // if (this.convertedEntrySH) {
        calculoMoeda = contrato.quantidade_compra_usuario * 0.005;
        percentual = calculoMoeda * bonusPeriodo;
        calculoPercentual = percentual + calculoMoeda;
        // VALOR EM DOLAR

        outputEntry = calculoMoeda;

        totalRecebiveisAluguelUsd = calculoPercentual - outputEntry;

        outputEntryUsd = calculoPercentual;

        return +totalRecebiveisAluguelUsd;
      }
    }
  }

  checkValorUnitario(contrato: any): any {
    let percentualPeriodo: any = +contrato?.periodo / 100
    let percentualTotal = 0.005 * percentualPeriodo
    let quantidadeUsd = +contrato?.quantidade_compra_usuario * 0.005;
    let valorTotal = (percentualTotal * +contrato?.quantidade_compra_usuario) + (quantidadeUsd)
    return quantidadeUsd;
  }

  async validateAllContracts() {
    if (this.contractsDataReport) {
      this.showLoading = true;
      await this.validateContract(this.contractsDataReport)
      await this.getContractInfos();
      this.showLoading = false;
      // window.alert('Contratos Aprovados.')
    }
  }

  openContractDetails(wallet: any) {
    if (wallet.status === 'resgatado' || wallet.status === 'pago') {
      this.statusList = this.paidStatus;
    } else if (wallet.status === 'solicitado-cancelamento' || wallet.status === 'pago-cancelamento') {
      this.statusList = this.cancelStatus;
    } else {
      this.statusList = this.contractStatus;
    }
    this.detailedInfoModal = true;
    this.selectedContractInfo = wallet
    this.selectedContractStatus = this.statusList.find((d: any) => d.code === wallet.status);
  }

  restoreContractBackup() {
    let result = this.contractsDataReport.filter((d: any) => d.status === 'atualizado')
    result.forEach(async (element: any) => {
      if (element?.modalidade === 'Stakholders' && element.periodo === 30) {
        if (element?.valor_quantidade && element?.quantidade_compra_usuario) {
          let valorReal = (element.quantidade_compra_usuario * +element.cotacao_sh).toFixed(2);
          let valorCorrigido = (+valorReal - (+valorReal * 0.12))

          let calculoMoeda = valorCorrigido;
          let percentual = calculoMoeda * 0.3;
          let calculoPercentual = percentual + calculoMoeda;

          let valor_quantidade = +(valorCorrigido).toFixed(2);
          let total_pelo_aluguel = +(calculoPercentual - calculoMoeda).toFixed(2);
          let total_recebiveis_aluguel = +(calculoPercentual).toFixed(2);
          await this.authService.changeContractStatus(element.path, { valor_quantidade: valor_quantidade, total_pelo_aluguel: total_pelo_aluguel, total_recebiveis_aluguel: total_recebiveis_aluguel, path: '', pathc: '' })
        }
      }
    });
  }

  async consultAddress() {
    let resultTemp = await this.authService.consultAddress(this.contracInputSearch)
    this.consultAddressResult = resultTemp.result;
  }

  async adjustContractField(param: any, field: any, contract: any) {
    this.showLoading = true;
    try {
      await this.authService.changeContractStatus(contract.path, { [param]: field });
      await this.authService.backupEditedContract(contract.uid, contract);
    } catch (error) {
      window.alert('Erro ao atualizar contrato')
    }
    finally {
      window.alert('Atualização do contrato concluida')
      this.showLoading = false;
    }
  }

  async adjustDates() {
    let getContractsReports: any = await this.authService.getAllContractInfo();
    let result = getContractsReports.docs.map((d: any) => ({ contract_id: d.id, path: d.ref.path, ...d.data() }));
    result.forEach(async (d: any) => {
      // if (d?.uid && d?.contract_id && !d.data_incio.seconds && !d.data_compra.seconds && !d.data_fim.seconds) {
      // console.log(d)
      // if (d?.data_incio?.seconds && d?.data_compra?.seconds && d?.data_fim?.seconds) {
      //   d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
      //   d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
      //   d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
      // } else {
      //   d.data_incio = new Date(d.data_incio).toUTCString();
      //   d.data_compra = new Date(d.data_compra).toUTCString();
      //   d.data_fim = new Date(d.data_fim).toUTCString();
      // }
      // if (d?.uid && d?.id && d?.data_incio && d?.data_compra && d?.data_fim) {
      //   this.authService.changeContractStatus(d.uid, d.id, { data_incio: d.data_incio, data_compra: d.data_compra, data_fim: d.data_fim })
      // }
      // } else {
      if (d?.uid && d?.contract_id && d.data_incio.seconds) {
        console.log(d)
        d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
        await this.authService.changeContractStatus(d.path, { data_incio: d.data_incio, path: '', pathc: '' })
      }

      if (d?.uid && d?.contract_id && d.data_compra.seconds) {
        console.log(d)
        d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
        await this.authService.changeContractStatus(d.path, { data_compra: d.data_compra, path: '', pathc: '' })
      }

      if (d?.uid && d?.contract_id && d.data_fim.seconds) {
        console.log(d)
        d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
        await this.authService.changeContractStatus(d.path, { data_fim: d.data_fim, path: '', pathc: '' })
      }

      if (new Date(d.data_incio) && new Date(d.data_fim)) {
        console.log('sucesso')
      }
      else {
        console.log(d)
      }
      // }
    });
  }

  confirmarPagamento(contrato: any): any {
    if (contrato.contract_id && contrato.uid && contrato.status === "atualizado") {
      this.authService.changeContractPendente(contrato.uid, contrato.contract_id, { status: 'pago-atualizacao', path: '', pathc: '' })
      let index = this.updatedContracts.indexOf(contrato);
      this.updatedContracts.splice(index, 1);
    }
  }
}
