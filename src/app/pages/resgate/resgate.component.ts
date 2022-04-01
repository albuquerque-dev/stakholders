import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-resgate',
  templateUrl: './resgate.component.html',
  styleUrls: ['./resgate.component.css']
})
export class ResgateComponent implements OnInit {

  contractStep: number = 0;
  userApprovedResgate: boolean = false;
  userAcceptedTerms: boolean = false;
  navState: any;
  msgs: any;
  selectedMethod: any;
  showModalMethod: boolean = false;
  methodText: any;
  methodTitle: any;
  contractInfo: any;
  contractResgate: any;
  reportContractsData: any;
  approvedContracts: any;
  userInfo: any;
  taxaDescontoAtualizacao: any;
  showLoading: boolean = false;
  taxaDescontoCancelamento?: number;
  contractCancel: any;

  constructor(private router: Router,
    private authService: AuthService,
    private angularFireAuth: AngularFireAuth,
    private confirmationService: ConfirmationService) {
    this.navState = router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.setPageInfo()
    this.getReportFromContracts()
    if (this.navState && this.navState.data && this.navState.data.contrato) {
      this.contractInfo = this.navState.data.contrato
      let contractString = JSON.stringify(this.contractInfo)
      localStorage.setItem('contractSelected', contractString)
    } else {
      let sessionContract = localStorage.getItem('contractSelected');
      if (sessionContract) {
        let tempObj = JSON.parse(sessionContract)
        this.contractInfo = tempObj;
      }
    }
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    } else {
      this.angularFireAuth.authState.subscribe(async (user: any) => {
        if (user && user.uid) {
          let result: any = await this.authService.getUserInfo(user.uid);
          let data = result?.data();
          if (data) {
            this.userInfo = data;
            let jsonString = JSON.stringify(data);
            if (jsonString) {
              localStorage.setItem('userDBData', jsonString);
            }
          }
        }
      })
    }
  }

  showMethodMessage() {
    if (this.contractInfo.data_fim) {
      let today = new Date()
      let tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      let endDate = new Date(this.contractInfo?.data_fim.seconds * 1000)
      let afterEnd = new Date(endDate);
      afterEnd.setDate(afterEnd.getDate())

      if (this.selectedMethod === 'resgate') {
        this.methodTitle = 'Resgate Total'
        this.methodText = 'O RESGATE TOTAL de seu contrato ocorrerá no dia ' + afterEnd.toLocaleDateString() + ' sem taxa de 12%, caso seja oriundo de seu primeiro contrato, o que se torna diferente para os demais, ou seja, segundo ou mais contratos na Plataforma, que tem uma taxa administrativa de 12% do valor do contrato. Esse valor será descontado no momento do envio. O RESGATE TOTAL US$' + this.contractInfo?.total_recebiveis_aluguel?.toLocaleString() + ' da alocação ao término do período, você receberá seu capital inicial em BNB ou Stakholders (conforme a modalidade que alugou) que será enviado a sua carteira um dia após o término do período. Obs.: Envios realizados somente em dias úteis.'
      }
      if (this.selectedMethod === 'cancelamento') {
        this.methodTitle = 'Cancelamento'
        this.methodText = 'O CANCELAMENTO de seu contrato incidirá em taxas administrativas! O encerramento da alocação antecipadamente do período, você receberá seu capital inicial em BNB ou Stakholders (conforme a modalidade que alugou), com um desconto de 30% pela quebra do contrato, que será enviado a sua carteira em até 72h. Obs.: Envios realizados somente em dias úteis,'
      }
      this.confirmationService.confirm({
        header: this.methodTitle,
        message: this.methodText,
        accept: () => {
          this.showModalMethod = true;
          if (this.selectedMethod === 'resgate') {
            this.calcResgateValue()
          }
          if (this.selectedMethod === 'cancelamento') {
            this.calcCancelamento()
          }
        },
        reject: () => {
          this.showModalMethod = false;
        }
      });
    }
  }


  calcUnitValue(): any {
    let calcUsd = +this.contractInfo?.total_recebiveis_aluguel - +this.contractInfo?.total_pelo_aluguel;
    let valUnit = +calcUsd / +this.contractInfo?.quantidade_compra_usuario;
    return valUnit.toFixed(5);
  }

  calcResgateValue() {
    this.contractResgate = this.contractInfo;
    this.contractResgate.total_resgate = 0;
    if (this.approvedContracts?.length > 1) {
      let valor = +this.contractResgate?.total_recebiveis_aluguel;
      let calcPercent = +valor - (valor * 0.12)
      this.taxaDescontoAtualizacao = (+valor * 0.12);
      this.contractResgate.total_resgate = calcPercent || 0;
    } else {
      this.contractResgate.total_resgate = +this.contractResgate?.total_recebiveis_aluguel;
    }
  }

  async getReportFromContracts() {
    let dbResult = await this.authService.getMyContractInfo(this.userInfo.uid);
    this.reportContractsData = dbResult.docs.map((d: any) => ({ id: d.id, path: d.ref.path, ...d.data() }))
    this.reportContractsData = this.reportContractsData?.reverse();
    if (this.reportContractsData) {
      this.approvedContracts = this.reportContractsData.filter((d: any) => d.status === 'resgatado')
    }
    console.log('')
  }

  async confirmResgate() {
    this.showLoading = true;
    this.contractResgate.status = 'resgatado'
    await this.authService.addDocumentTo(this.contractResgate.uid, this.contractResgate.id, this.contractResgate, 'resgate')
    await this.authService.backupContract(this.contractResgate.uid, this.contractResgate)
    await this.authService.changeContractComprovantes(this.contractResgate.uid, this.contractResgate.id, this.contractResgate)
    this.router.navigate(['/renda'])
    this.showLoading = true;
  }

  getCalcTaxes(value: any): any {
    let percentual = +value * 0.30;
    this.taxaDescontoCancelamento = percentual;
    let valor = value - percentual;
    return valor;
  }

  async cancelContract() {
    this.showLoading = true;
    await this.authService.addDocumentTo(this.contractCancel.uid, this.contractCancel.id, this.contractCancel, 'cancelamento')
    await this.authService.backupContract(this.contractCancel.uid, this.contractCancel)
    await this.authService.changeContractComprovantes(this.contractCancel.uid, this.contractCancel.id, this.contractCancel)
    localStorage.removeItem('contractSelected');
    this.router.navigate(['/renda'])
    this.showLoading = true;
  }

  calcCancelamento() {
    this.contractCancel = this.contractInfo;
    let percentual = +this.contractCancel.quantidade_compra_usuario * 0.30;
    this.taxaDescontoCancelamento = percentual;
    this.contractCancel.status = 'solicitado-cancelamento'
    if (this.taxaDescontoCancelamento) {
      let valor = +(+this.contractCancel.quantidade_compra_usuario - percentual);
      this.contractCancel.total_pelo_cancelamento = +valor;
    }
    this.contractCancel.data_incio = new Date(this.contractCancel.data_incio)
    this.contractCancel.data_fim = new Date(this.contractCancel.data_fim)
    this.contractCancel.data_compra = new Date(this.contractCancel.data_compra)
  }

  verifyContractPeriod(contract: any): any {
    if (contract?.data_fim) {
      let dataFim = new Date(contract.data_fim);
      let dataPermissao = new Date(new Date(dataFim).setDate(dataFim.getDate() - 7))
      let dataHoje = new Date();
      let validarData = (dataHoje >= dataPermissao && dataHoje <= dataFim)
      console.log(validarData, dataPermissao, dataFim, dataHoje)
      return validarData;
    }
  }

  resgatarContrato() {
    this.selectedMethod = 'resgate';
    this.showMethodMessage()
  }

  invalidDate() {
    window.alert('Resgate Disponivel apenas, 7 dias antes do termino do contrato')
  }

}
