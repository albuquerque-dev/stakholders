import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ConfirmationService, Message } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { RendaService } from './renda.service';

@Component({
  selector: 'app-renda',
  templateUrl: './renda.component.html',
  styleUrls: ['./renda.component.css']
})
export class RendaComponent implements OnInit, OnChanges {

  msgs: Message[] = [];
  userAcceptedTerms: boolean = false;
  userApprovedRenda: boolean = false;
  selectedRentPeriodicity: number = 0;
  tokensOptions: any;
  selectedToken: any;
  cotacaoValoresSHUSD: any;
  cotacaoValoresBNBUSD: any;
  periodicityText: string = '';
  periodicityTitle: string = '';
  userApprovedPeriodicity: boolean = false;
  bonusPercentPeriodicity: number = 0;
  inputQuantityTokens?: number;
  inputQuantityUsd: number = 0;
  inputHash: any;
  valueDifference: number = 0;
  totalValue: number = 0;
  quantityInsufficient: boolean = false;
  contractStep: number = 0;
  hashVerified: boolean = false;
  userInfo: any;
  rendaPassivaDataToDB: any
  msgError: any;
  dataFimContrato: any;
  selectedView: any;
  userHaveContract: boolean = false;
  reportContractsData: any;
  selectedRowToDeleteId: any;
  showLoading: boolean = false;
  contractSelectedUpdate: any;
  updateObjContract: any;
  taxaDescontoAtualizacao: any;

  constructor(private authService: AuthService,
    private confirmationService: ConfirmationService,
    private rendaService: RendaService,
    private router: Router,
    private navCtrl: NavController,
    private angularFireAuth: AngularFireAuth) {
    this.tokensOptions = [
      { name: 'Stakholders', code: 'Stakholders' },
      { name: 'BNB', code: 'Bnb' },
    ];
  }

  async ngOnInit() {
    this.setPageInfo()
    this.getReportFromContracts()
    let resultSH = await this.authService.getCotationSHUSD()
    this.cotacaoValoresSHUSD = resultSH?.data?.quote[0].price?.toFixed(5);
    let resultBNB = await this.rendaService.getCotationBNBUSD()
    this.cotacaoValoresBNBUSD = resultBNB?.result?.ethusd;
  }

  ngOnChanges() {
  }

  clearContract() {
    this.userAcceptedTerms = false;
    this.userApprovedRenda = false;
    this.selectedRentPeriodicity = 0;
    this.selectedToken = null;
    this.cotacaoValoresSHUSD = 0;
    this.cotacaoValoresBNBUSD = 0;
    this.periodicityText = '';
    this.periodicityTitle = '';
    this.userApprovedPeriodicity = false;
    this.bonusPercentPeriodicity = 0;
    this.inputQuantityTokens = 0;
    this.inputQuantityUsd = 0;
    this.inputHash = '';
    this.valueDifference = 0;
    this.totalValue = 0;
    this.quantityInsufficient = false;
    this.contractStep = 0;
    this.hashVerified = false;
    this.selectedView = '';
    this.contractSelectedUpdate = null;
    this.updateObjContract = null;
  }

  convertCurrency(evt: any) {
    if (!evt.value) {
      evt.value = 0
    }
    this.inputQuantityTokens = +evt.value;
    if (this.selectedToken?.code === 'Stakholders') {
      if (this.cotacaoValoresSHUSD && this.inputQuantityTokens && this.inputQuantityTokens >= 10000) {
        this.quantityInsufficient = false;
        let calculoMoeda = this.inputQuantityTokens * this.cotacaoValoresSHUSD;
        let percentual = calculoMoeda * this.bonusPercentPeriodicity;
        let calculoPercentual = percentual + calculoMoeda;
        // VALOR EM DOLAR
        this.inputQuantityUsd = calculoMoeda;
        // DIFERENÇA A PAGAR
        this.valueDifference = calculoPercentual - calculoMoeda;
        // VALOR TOTAL
        this.totalValue = calculoPercentual;
      } else {
        this.quantityInsufficient = true;
      }
    }
    if (this.selectedToken?.code === 'Bnb') {
      if (this.cotacaoValoresBNBUSD && this.inputQuantityTokens) {
        let calculoMoeda = this.inputQuantityTokens * this.cotacaoValoresBNBUSD;
        let percentual = calculoMoeda * this.bonusPercentPeriodicity;
        let calculoPercentual = percentual + calculoMoeda;
        // VALOR EM DOLAR
        this.inputQuantityUsd = calculoMoeda;
        // DIFERENÇA A PAGAR
        this.valueDifference = calculoPercentual - calculoMoeda;
        // VALOR TOTAL
        this.totalValue = calculoPercentual;
      }
    }
  }

  manualConvertValue(value: any) {
    this.inputQuantityTokens = +value;
    if (this.selectedToken?.code === 'Stakholders') {
      if (this.cotacaoValoresSHUSD && this.inputQuantityTokens && this.inputQuantityTokens >= 10000) {
        this.quantityInsufficient = false;
        let calculoMoeda = this.inputQuantityTokens * this.cotacaoValoresSHUSD;
        let percentual = calculoMoeda * this.bonusPercentPeriodicity;
        let calculoPercentual = percentual + calculoMoeda;
        // VALOR EM DOLAR
        this.inputQuantityUsd = calculoMoeda;
        // DIFERENÇA A PAGAR
        this.valueDifference = calculoPercentual - calculoMoeda;
        // VALOR TOTAL
        this.totalValue = calculoPercentual;
      } else {
        this.quantityInsufficient = true;
      }
    }
    if (this.selectedToken?.code === 'Bnb') {
      if (this.cotacaoValoresBNBUSD && this.inputQuantityTokens) {
        let calculoMoeda = this.inputQuantityTokens * this.cotacaoValoresBNBUSD;
        let percentual = calculoMoeda * this.bonusPercentPeriodicity;
        let calculoPercentual = percentual + calculoMoeda;
        // VALOR EM DOLAR
        this.inputQuantityUsd = calculoMoeda;
        // DIFERENÇA A PAGAR
        this.valueDifference = calculoPercentual - calculoMoeda;
        // VALOR TOTAL
        this.totalValue = calculoPercentual;
      }
    }
  }

  async verifyHashTransaction() {
    if (this.inputHash && this.inputQuantityTokens) {
      if (this.userInfo && this.userInfo.carteira) {
        let objTemp: any;
        if (this.selectedToken?.code === 'Bnb') {
          objTemp = await this.authService.verifyHashTransaction(this.userInfo?.carteira?.trim(), 'Bnb')
        } else {
          objTemp = await this.authService.verifyHashTransaction(this.userInfo?.carteira?.trim())
        }
        if (objTemp && objTemp.status === '1') {
          let transaction = objTemp?.result?.filter((c: any) => c.hash?.toLowerCase() === this.inputHash?.trim()?.toLowerCase())
          if (transaction[0]?.value) {
            var quantidadeConvertida: any;
            if (this.selectedToken?.code === 'Bnb') {
              quantidadeConvertida = transaction[0]?.value / 1000000000000000000;
            } else {
              quantidadeConvertida = transaction[0]?.value / 1000000000;
            }
            if (+quantidadeConvertida === +this.inputQuantityTokens &&
              transaction[0]?.from.toLowerCase() === this.userInfo.carteira?.toLowerCase() &&
              transaction[0]?.to === '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a') {
              this.msgError = null;
              this.hashVerified = true;
            } else if (+quantidadeConvertida !== +this.inputQuantityTokens) {
              this.manualConvertValue(quantidadeConvertida)
              this.hashVerified = true;
            } else if (transaction[0]?.from.toLowerCase() !== this.userInfo.carteira?.toLowerCase()) {
              this.msgError = 'Carteira informada na hash diferente da carteira do usuário.'
            }
          } else {
            this.msgError = 'Hash Invalida, ou ainda não validada, certifique-se que está Hash trata-se de uma transação feita diretamente de sua wallet ou tente novamente após alguns minutos.'
          }
        }
      } else {
        await this.setPageInfo()
        if (this.userInfo && this.userInfo.carteira) {
          let objTemp: any;
          if (this.selectedToken?.code === 'Bnb') {
            objTemp = await this.authService.verifyHashTransaction(this.userInfo?.carteira?.trim(), 'Bnb')
          } else {
            objTemp = await this.authService.verifyHashTransaction(this.userInfo?.carteira?.trim())
          }
          if (objTemp && objTemp.status === '1') {
            let transaction = objTemp?.result?.filter((c: any) => c.hash?.toLowerCase() === this.inputHash?.trim()?.toLowerCase())
            if (transaction[0]?.value) {
              var quantidadeConvertida: any;
              if (this.selectedToken?.code === 'Bnb') {
                quantidadeConvertida = transaction[0]?.value / 1000000000000000000;
              } else {
                quantidadeConvertida = transaction[0]?.value / 1000000000;
              }
              if (transaction[0]?.value?.slice(0, -transaction[0].tokenDecimal) === this.inputQuantityTokens?.toString()?.replace(',', '')?.replace('.', '') &&
                transaction[0]?.from.toLowerCase() === this.userInfo.carteira?.toLowerCase() &&
                transaction[0]?.to === '0x8d151d900fc5c85ea7b032cd5deac0c2c577240a') {
                this.msgError = null;
                this.hashVerified = true;
              } else if (+quantidadeConvertida !== +this.inputQuantityTokens) {
                this.manualConvertValue(quantidadeConvertida)
                this.hashVerified = true;
              } else if (transaction[0]?.from.toLowerCase() !== this.userInfo.carteira?.toLowerCase()) {
                this.msgError = 'Carteira informada na hash diferente da carteira do usuário.'
              }
            }
          }
        }
      }
    }
  }

  prepareDataToSend() {
    this.rendaPassivaDataToDB = {
      nome: this.userInfo.nome,
      email: this.userInfo.email,
      telefone: this.userInfo.tel,
      carteira: this.userInfo.carteira,
      uid: this.userInfo.uid,
      total_recebiveis_aluguel: this.totalValue || 0,
      total_pelo_aluguel: this.valueDifference || 0,
      quantidade_compra_usuario: this.inputQuantityTokens,
      valor_quantidade: this.inputQuantityUsd,
      cotacao_sh: this.cotacaoValoresSHUSD,
      cotacao_bnb: this.cotacaoValoresBNBUSD,
      modalidade: this.selectedToken?.code,
      periodo: this.selectedRentPeriodicity,
      hash: this.inputHash,
      data_incio: new Date(),
      data_fim: this.dataFimContrato,
      data_compra: new Date,
      status: 'pendente',
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

  confirmContractRenda() {
    this.userApprovedRenda = true;
    this.contractStep = 0;
    this.selectedView = 'newContract'
  }

  async filterCotation() {
    if (this.selectedToken?.code?.toLowerCase() === 'stakholders') {
      let result = await this.authService.getCotationSHUSD()
      this.cotacaoValoresSHUSD = result?.data?.quote[0].price?.toFixed(5);
      this.quantityInsufficient = true;
    }
    if (this.selectedToken?.code?.toLowerCase() === 'bnb') {
      let result = await this.rendaService.getCotationBNBUSD()
      this.cotacaoValoresBNBUSD = result?.result?.ethusd;
      this.quantityInsufficient = false;
    }
    this.contractStep = 2;
  }

  openRentPeriodicityDialog() {
    let today = new Date();
    this.dataFimContrato = new Date(new Date().setDate(today.getDate() + this.selectedRentPeriodicity));
    if (this.selectedRentPeriodicity === 30) {
      this.periodicityTitle = 'Periodo de 30 dias'
      if (this.selectedToken?.code === 'Stakholders' || this.contractSelectedUpdate?.modalidade === 'Stakholders') {
        this.periodicityText = 'Decorrido os 30 dias de aluguel, você receberá  30% sobre o valor alocado, calculado a partir da quantidade em SH no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá suas SH com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado por igual período.'
      }
      if (this.selectedToken?.code === 'Bnb' || this.contractSelectedUpdate?.modalidade === 'Bnb') {
        this.periodicityText = 'Decorrido os 30 dias de aluguel, você receberá 30% sobre o valor alocado, calculado a partir da quantidade em BNB no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá seus BNBs com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado somente a quantidade inicial dos BNBs por igual período. Após o prazo a Plataforma procederá com o pagamento do Aluguel em BNBs.'
      }
    }
    if (this.selectedRentPeriodicity === 60) {
      this.periodicityTitle = 'Periodo de 60 dias'
      if (this.selectedToken?.code === 'Stakholders' || this.contractSelectedUpdate?.modalidade === 'Stakholders') {
        this.periodicityText = 'Decorrido os 60 dias de aluguel, você receberá  70% sobre o valor alocado, calculado a partir da quantidade em SH no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá suas SH com um desconto de 6 % de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado por igual período.'
      }
      if (this.selectedToken?.code === 'Bnb' || this.contractSelectedUpdate?.modalidade === 'Bnb') {
        this.periodicityText = 'Decorrido os 60 dias de aluguel, você receberá 70% sobre o valor alocado, calculado a partir da quantidade em BNB no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá seus BNBs com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado somente a quantidade inicial dos BNBs por igual período. Após o prazo a Plataforma procederá com o pagamento do Aluguel em BNBs.'
      }
    }
    if (this.selectedRentPeriodicity === 90) {
      this.periodicityTitle = 'Periodo de 90 dias'
      if (this.selectedToken?.code === 'Stakholders' || this.contractSelectedUpdate?.modalidade === 'Stakholders') {
        this.periodicityText = 'Decorrido os 90 dias de aluguel, você receberá  100% sobre o valor alocado, calculado a partir da quantidade em SH no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá suas SH com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado por igual período.'
      }
      if (this.selectedToken?.code === 'Bnb' || this.contractSelectedUpdate?.modalidade === 'Bnb') {
        this.periodicityText = 'Decorrido os 90 dias de aluguel, você receberá 100% sobre o valor alocado, calculado a partir da quantidade em BNB no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá seus BNBs com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado somente a quantidade inicial dos BNBs por igual período. Após o prazo a Plataforma procederá com o pagamento do Aluguel em BNBs.'
      }
    }
    if (this.selectedRentPeriodicity === 120) {
      this.periodicityTitle = 'Periodo de 120 dias'
      if (this.selectedToken?.code === 'Stakholders' || this.contractSelectedUpdate?.modalidade === 'Stakholders') {
        this.periodicityText = 'Decorrido os 120 dias de aluguel, você receberá  150% sobre o valor alocado, calculado a partir da quantidade em SH no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá suas SH com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado por igual período.'
      }
      if (this.selectedToken?.code === 'Bnb' || this.contractSelectedUpdate?.modalidade === 'Bnb') {
        this.periodicityText = 'Decorrido os 120 dias de aluguel, você receberá 150% sobre o valor alocado, calculado a partir da quantidade em BNB no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá seus BNBs com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado somente a quantidade inicial dos BNBs por igual período. Após o prazo a Plataforma procederá com o pagamento do Aluguel em BNBs.'
      }
    }
    if (this.selectedRentPeriodicity === 150) {
      this.periodicityTitle = 'Periodo de 150 dias'
      if (this.selectedToken?.code === 'Stakholders' || this.contractSelectedUpdate?.modalidade === 'Stakholders') {
        this.periodicityText = 'Decorrido os 150 dias de aluguel, você receberá  200% sobre o valor alocado, calculado a partir da quantidade em SH no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá suas SH com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado por igual período.'
      }
      if (this.selectedToken?.code === 'Bnb' || this.contractSelectedUpdate?.modalidade === 'Bnb') {
        this.periodicityText = 'Decorrido os 150 dias de aluguel, você receberá 200% sobre o valor alocado, calculado a partir da quantidade em BNB no dia da alocação. Caso queira encerrar a alocação antecipadamente, receberá seus BNBs com um desconto de 6% de taxa administrativa. Obs.: caso não solicite o seu aluguel no período contratado será reaplicado somente a quantidade inicial dos BNBs por igual período. Após o prazo a Plataforma procederá com o pagamento do Aluguel em BNBs.'
      }
    }

    this.confirmationService.confirm({
      header: (this.selectedToken?.name || this.contractSelectedUpdate?.modalidade) + ' - ' + this.periodicityTitle,
      message: this.periodicityText,
      accept: () => {
        if (this.contractSelectedUpdate) {
          this.contractStep = 21
          this.calcNewContract()
        } else {
          this.userApprovedPeriodicity = true;
          this.contractStep = 3;
        }
      },
      reject: () => {
        if (this.contractSelectedUpdate) {
          this.contractStep = 20;
        } else {
          this.userApprovedPeriodicity = false;
        }
      }
    });
  }

  async sendDataToDb() {
    try {
      this.prepareDataToSend()
      await this.sendComprovanteInfo()
    } catch (error) {
      window.alert('Erro ao enviar informações para o banco de dados, Por favor, entre em contato com o suporte.')
    }
  }

  sendPurchaseData() {
    this.confirmationService.confirm({
      message: 'Suas informações foram recebidas com sucesso e serão processadas em até 24hs. Após confirmado seu Status aparecerá <b>Aprovado</b>. Caso apresente alguma divergência será cancelado.',
      header: 'Confirmado',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        let send = await this.sendDataToDb();
        this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Suas informações foram recebidas com sucesso e serão processadas em até 24hs. Após confirmado seu Status aparecerá Aprovado.' }];
        this.clearContract();
      },
      reject: () => {
        this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Contrato recusado.' }];
        this.clearContract();
      }
    });
  }

  async sendComprovanteInfo() {
    try {
      if (this.userInfo.uid && this.rendaPassivaDataToDB) {
        this.authService.addComprovanteInfo(this.userInfo.uid, this.rendaPassivaDataToDB)
      }
    } catch (error) {
      window.alert('Erro ao processar o envio das informações, Por favor, entre em contato com o suporte.')
      console.error(error)
    }
  }

  async getReportFromContracts() {
    let dbResult = await this.authService.getMyContractInfo(this.userInfo.uid);

    if (dbResult.empty === false) {
      this.userHaveContract = true;
    } else {
      this.userHaveContract = false;
    }

    this.reportContractsData = dbResult.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    this.reportContractsData.map((d: any) => {
      if (d.data_incio?.seconds && d.data_compra?.seconds && d.data_fim?.seconds) {
        d.data_compra = new Date(d.data_compra?.seconds * 1000).toUTCString();
        d.data_incio = new Date(d.data_incio?.seconds * 1000).toUTCString();
        d.data_fim = new Date(d.data_fim?.seconds * 1000).toUTCString();
      }
    })
    this.reportContractsData = this.reportContractsData?.reverse();
    console.log('')
  }


  confirmWalletTable(id: any) {
    this.selectedRowToDeleteId = id;
    this.cancelContractRow(id)
  }

  async cancelContractRow(id: any) {
    if (id) {
      this.confirmationService.confirm({
        message: 'Deseja confirmar o cancelamento do contrato?',
        accept: async () => {
          this.showLoading = true;
          await this.authService.updateContractInfo(id, { status: 'cancelado' });
          await this.getReportFromContracts();
          this.showLoading = false;
          this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Contrato cancelado com sucesso.' }];
        }
      });
    }
  }

  async updateContract(contract: any) {
    let valorUnitario: any;
    if (contract.modalidade === 'Stakholders') {
      let result = await this.authService.getCotationSHUSD()
      this.cotacaoValoresSHUSD = result?.data?.quote[0].price?.toFixed(6);
      valorUnitario = this.cotacaoValoresSHUSD;
    }
    if (contract.modalidade === 'Bnb') {
      let result = await this.rendaService.getCotationBNBUSD()
      this.cotacaoValoresBNBUSD = result?.result?.ethusd;
      valorUnitario = this.cotacaoValoresBNBUSD;
    }
    let quantidade = contract.quantidade_compra_usuario || 0;
    let modalidade = contract.modalidade || '';
    let valorReal = +contract.total_recebiveis_aluguel - +contract.total_pelo_aluguel;
    let novoValor = ((+contract.quantidade_compra_usuario * +valorUnitario) || 0).toFixed(2);
    let valorCorrigido = (+novoValor - (+novoValor * 0.12));
    this.taxaDescontoAtualizacao = (+novoValor * 0.12);
    let today = new Date();
    let nextday = new Date(new Date(contract.data_fim?.seconds * 1000).setDate(contract.data_fim.toDate().getDate() + 1));
    this.updateObjContract = { ...contract };
    this.updateObjContract.valor_quantidade = +valorCorrigido?.toFixed(2);
    this.updateObjContract.data_incio = nextday;
    this.updateObjContract.status = 'atualizado';
    this.updateObjContract.comentario = 'Contrato Atualizado:' + today?.toLocaleDateString();
    let msgText = 'Tem certeza de que deseja atualizar o valor de seu contrato? A atualização incidirá em uma taxa de 12% em cima do valor de sua locação, ou seja, o capital adicionado pela primeira vez de ' + quantidade + ' ' + modalidade + ' (US$' + (valorReal?.toFixed(2)) + '). Após aceitar a taxa para atualização do contrato ele passará para US$' + valorCorrigido.toFixed(2) + ', que passa a vigorar no dia ' + nextday?.toLocaleDateString() + ', dia seguinte a data do termino do contrato.'
    // let msgText = 'Tem certeza de que deseja atualizar o valor de seu contrato? A atualização incidirá em uma taxa de 12% em cima do valor de sua locação, ou seja, o capital adicionado pela primeira vez de ' + quantidade + ' ' + modalidade + ' (US$' + (valorReal?.toFixed(2)) + '). Após aceitar a taxa para atualização do contrato ele passará para US$' + valorCorrigido.toFixed(2) + ' (Cotação: US$' + valorUnitario + '), que passa a vigorar no dia ' + nextday?.toLocaleDateString() + ', dia seguinte a data do termino do contrato.'
    this.confirmationService.confirm({
      acceptLabel: 'Selecionar Periodo',
      acceptIcon: 'pi pi-angle-right',
      message: msgText,
      accept: async () => {
        this.contractSelectedUpdate = contract;
        this.contractStep = 20;
      }
    });
  }

  calcNewContract() {
    if (this.updateObjContract?.modalidade === 'Stakholders') {
      if (this.updateObjContract?.valor_quantidade && this.updateObjContract?.quantidade_compra_usuario) {
        this.updateObjContract.cotacao_sh = this.cotacaoValoresSHUSD;
        let calculoMoeda = this.updateObjContract.valor_quantidade;
        let percentual = calculoMoeda * this.bonusPercentPeriodicity;
        let calculoPercentual = percentual + calculoMoeda;
        // DIFERENÇA A PAGAR
        this.updateObjContract.total_pelo_aluguel = calculoPercentual - calculoMoeda;
        // VALOR TOTAL
        this.updateObjContract.total_recebiveis_aluguel = calculoPercentual;
      }
    } else if (this.updateObjContract?.modalidade === 'Bnb') {
      if (this.updateObjContract?.valor_quantidade && this.updateObjContract?.quantidade_compra_usuario) {
        this.updateObjContract.cotacao_bnb = this.cotacaoValoresBNBUSD;
        let calculoMoeda = this.updateObjContract.valor_quantidade;
        let percentual = calculoMoeda * this.bonusPercentPeriodicity;
        let calculoPercentual = percentual + calculoMoeda;
        // DIFERENÇA A PAGAR
        this.updateObjContract.total_pelo_aluguel = calculoPercentual - calculoMoeda;
        // VALOR TOTAL
        this.updateObjContract.total_recebiveis_aluguel = calculoPercentual;
      }
    }
    this.updateObjContract.periodo = this.selectedRentPeriodicity;
    let startDate = new Date(this.updateObjContract.data_incio)
    let endDate = new Date(startDate.setDate(startDate.getDate() + +this.selectedRentPeriodicity));
    this.updateObjContract.data_fim = endDate;
    this.updateObjContract.data_compra = new Date(this.updateObjContract.data_compra?.seconds * 1000);
  }

  verifyContractPeriod(contract: any): any {
    if (contract?.data_fim) {
      let dataFim = new Date(contract.data_fim.toDate());
      let dataPermissao = new Date(new Date(dataFim).setDate(dataFim.getDate() - 7))
      let dataHoje = new Date();
      let validarData = (dataHoje >= dataPermissao && dataHoje <= dataFim)
      console.log(validarData, dataPermissao, dataFim, dataHoje)
      return validarData;
    }
  }

  async updateNewContract() {
    if (this.contractSelectedUpdate) {
      this.showLoading = true;
      await this.authService.backupContract(this.contractSelectedUpdate.uid, this.contractSelectedUpdate)
      await this.authService.addDocumentTo(this.contractSelectedUpdate.uid, this.contractSelectedUpdate.id, this.updateObjContract, 'atualizacao')
      await this.authService.changeContractStatus(this.contractSelectedUpdate.uid, this.contractSelectedUpdate.id, this.updateObjContract)
      this.showLoading = false;
      this.clearContract()
    }
  }

  goToResgate(contract: any) {
    this.router.navigate(['/resgate'], { state: { data: { "contrato": contract } } })
  }


  callMetamaskLogin() {
    this.authService.signInWithMetaMask().subscribe(
      () => {
        this.navCtrl.navigateForward('/home');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async callMetamaskPay() {
    (await this.authService.paymentWithMetamask(this.inputQuantityTokens?.toString())).subscribe(async (params: any) => {
    });
  }

}
