import { Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { FileUploadService } from 'src/app/uploader/file-upload.service';
import { Table } from 'primeng/table';
import * as FileSaver from 'file-saver';

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

  constructor(private _renderer2: Renderer2,
    private router: Router,
    private act: ActivatedRoute,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private fileUploadService: FileUploadService) { }

  async ngOnInit() {
    this.showLoading = true;
    // await this.getPreVendasReport();
    await this.setPageInfo()
    if (this.userInfo?.email === this.u1a || this.userInfo?.email === this.u2a || this.userInfo?.email === this.u3a || this.userInfo?.email === this.u4a || this.userInfo?.email === this.u5a) {
      this.cotacaoValoresSH = await this.authService.getCotationSHUSD()
      this.hashtransactions = await this.authService.getContractTransations();
      this.getCotationPricesSH(this.cotacaoValoresSH.data)
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
      this.paidStatus = [
        { name: "Resgatado", code: "resgatado" },
        { name: "Pago", code: "pago" },
      ]
      this.cancelStatus = [
        { name: "Solicitado Cancelamento", code: "solicitado-cancelamento" },
        { name: "Pago", code: "pago-cancelamento" },
      ]
      this.contractStatus = [
        { name: 'Aprovado', code: 'aprovado' },
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
    let getContractsReports: any = await this.authService.getAllContractInfo();
    this.contractsDataReport = getContractsReports.docs.map((d: any) => ({ contract_id: d.id, ...d.data() }));
    this.contractsDataReport.map((d: any) => {
      if (d.data_incio?.seconds && d.data_compra?.seconds && d.data_fim?.seconds) {
        d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
        d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
        d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
      } else {
        console.log(d)
      }
      if (d.status === 'aprovado') {
        (this.totalValueUsd += +d.total_recebiveis_aluguel || 0); (this.percentlValueUsd += +d.total_pelo_aluguel || 0)
      }
      this.excelDataTable = this.contractsDataReport.filter((d: any) => d.status === 'aprovado')
    });
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
            this.authService.changeContractStatus(contrato?.uid?.trim(), contrato.contract_id, { quantidade_compra_usuario: +quantidadeAjustada, total_pelo_aluguel: +totalRecebiveisAluguelUsd, total_recebiveis_aluguel: +outputEntryUsd })
            console.log('ajustado')
          }
        }
        // if (calculoMoeda && percentual && calculoPercentual && contrato.uid && contrato.total_pelo_aluguel !== +totalRecebiveisAluguelUsd && contrato.total_recebiveis_aluguel !== +outputEntryUsd) {
        //   console.log('ok')
        // }
      }
    })
  }

  adjustOldContractValues() {
    this.adjustContractValues(this.contractsDataReport)
  }

  adjustOldContracts() {
    this.contractsDataReport.forEach((d: any) => {
      if (d.status === 'aprovado' && d.uid && d.contract_id && d.data_incio && d.data_fim && d.data_compra) {
        let dataInicio = new Date(d.data_incio).toDateString();
        let dataFim = new Date(d.data_fim).toDateString();
        let dataHoje = new Date()
        if (dataFim === dataInicio) {
          let novaDataFim = new Date(new Date(d.data_fim).setDate(new Date(d.data_fim).getDate() - +d.periodo));
          console.log(dataFim, dataInicio, novaDataFim)
          this.authService.changeContractStatus(d.uid.trim(), d.contract_id.trim(), { data_incio: novaDataFim })
        }
        // this.authService.changeContractStatus(element?.uid?.trim(), element.contract_id, {})
      }
    });
  }

  exportExcel(path: string) {
    let dataToExcel: any;
    if (path === 'aprovado') {
      dataToExcel = this.contractsDataReport.filter((d: any) => d.status === 'aprovado')
    }
    if (path === 'atualizado') {
      dataToExcel = this.contractsDataReport.filter((d: any) => d.status === 'atualizado')
    }
    if (path === 'resgatado') {
      dataToExcel = this.contractsDataReport.filter((d: any) => d.status === 'resgatado' || d.status === 'pago')
    }
    if (path === 'solicitado-cancelamento') {
      dataToExcel = this.contractsDataReport.filter((d: any) => d.status === 'solicitado-cancelamento')
    }

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(dataToExcel);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "relatorio");
    });
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
    this.userDataReport = getContractsReports.docs.map((d: any) => ({ user_id: d.id, ...d.data() }));
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
            this.authService.changeContractStatus(contrato.uid, contrato.contract_id, { status: 'aprovado' })
            console.log('aprovado')
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
        if (this.selectedContractStatus?.code?.toUpperCase() === 'CANCELADO' || this.selectedContractStatus?.code?.toUpperCase() === 'ANALISE' && this.contractCancelTextReason) {
          let motivoTxt = ', Motivo: '
          this.selectedContractStatus.code += motivoTxt += this.contractCancelTextReason;
          await this.authService.changeContractStatus(contract.uid, contract.contract_id, { status: this.selectedContractStatus?.code })
        } else {
          await this.authService.changeContractStatus(contract.uid, contract.contract_id, { status: this.selectedContractStatus?.code })
        }
      }
      if (this.contractUsdValue && this.contractUsdValue > 0) {
        await this.changeContractValueUsd(contract);
      }
      if (this.contractValuePay && this.contractValuePay > 0) {
        await this.changeContractValuePayment(contract);
      }
      if (this.contractQuantity && this.contractQuantity > 0) {
        await this.authService.changeContractStatus(contract.uid, contract.contract_id, { quantidade_compra_usuario: this.contractQuantity })
      }
      if (this.contractCancelQty && this.contractCancelQty > 0) {
        await this.authService.changeContractStatus(contract.uid, contract.contract_id, { total_pelo_cancelamento: this.contractCancelQty })
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
        await this.authService.changeContractStatus(contract.uid, contract.contract_id, { total_pelo_aluguel: this.contractUsdValue })
      }
    } catch (error) {
      window.alert('Erro ao alterar contrato')
    }
  }

  async changeContractValuePayment(contract: any) {
    try {
      if (this.contractValuePay) {
        await this.authService.changeContractStatus(contract.uid, contract.contract_id, { total_recebiveis_aluguel: this.contractValuePay })
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
      window.alert('Contratos Aprovados.')
    }
  }

  openContractDetails(wallet: any) {
    if (wallet.status === 'resgatado' || wallet.status === 'pago') {
      this.statusList = this.paidStatus;
    } else if (wallet.status === 'solicitado-cancelamento' || wallet.status === 'pago-pagamento') {
      this.statusList = this.cancelStatus;
    } else {
      this.statusList = this.contractStatus;
    }
    this.detailedInfoModal = true;
    this.selectedContractInfo = wallet
    this.selectedContractStatus = wallet.status;
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
          await this.authService.changeContractStatus(element.uid, element.id, { valor_quantidade: valor_quantidade, total_pelo_aluguel: total_pelo_aluguel, total_recebiveis_aluguel: total_recebiveis_aluguel })
        }
      }
    });
  }

  async consultAddress() {
    let resultTemp = await this.authService.consultAddress(this.contracInputSearch)
    this.consultAddressResult = resultTemp.result;
  }

  async adjustContractField(param: any, field: any, contract: any) {
    await this.authService.changeContractStatus(contract.uid, contract.contract_id, { [param]: field })
    await this.authService.backupEditedContract(contract.uid, contract)
    await this.getContractInfos();
    window.alert('Alteração Concluida')
  }

  async adjustDates() {
    let getContractsReports: any = await this.authService.getAllContractInfo();
    let result = getContractsReports.docs.map((d: any) => ({ contract_id: d.id, ...d.data() }));
    result.forEach(async (d: any) => {
      console.log(d.data_fim, d.email)
      if (d?.data_incio?.constructor?.name !== 'ut' && d?.uid && d?.id && d?.data_incio && d?.data_compra && d?.data_fim) {
        console.log(d)
        if (d?.data_incio?.seconds && d?.data_compra?.seconds && d?.data_fim?.seconds) {
          d.data_incio = new Date(d.data_incio.seconds * 1000);
          d.data_compra = new Date(d.data_compra.seconds * 1000);
          d.data_fim = new Date(d.data_fim.seconds * 1000);
        } else {
          d.data_incio = new Date(d.data_incio);
          d.data_compra = new Date(d.data_compra);
          d.data_fim = new Date(d.data_fim);
        }
        if (d?.uid && d?.id && d?.data_incio && d?.data_compra && d?.data_fim) {
          this.authService.changeContractStatus(d.uid, d.id, { data_incio: d.data_incio, data_compra: d.data_compra, data_fim: d.data_fim })
        }
      }
    });
  }
}
