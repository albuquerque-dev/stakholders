import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public proFileData: FormGroup;
  userInfo: any;
  verifyCarteira: boolean = false;
  urlParam: any;
  alterarCampos: boolean = false;
  showLoading: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private act: ActivatedRoute, private authService: AuthService, private formBuilder: FormBuilder, private angularFireAuth: AngularFireAuth) {
    this.proFileData = this.formBuilder.group({
      nome: [''],
      email: [''],
      tel: [''],
      carteira: ['']
    })
  }

  async ngOnInit() {
    this.showLoading = true;
    await this.setPageInfo();
    this.showLoading = false;
  }

  changeRegister() {
    this.showLoading = true;
    if (this.proFileData.value.nome != '' && this.proFileData.value.nome != this.userInfo.nome) {
      this.userInfo.nome = this.proFileData.value.nome
    }
    if (this.proFileData.value.email != '' && this.proFileData.value.email != this.userInfo.email) {
      this.userInfo.email = this.proFileData.value.email
      // this.angularFireAuth.updateCurrentUser()
    }
    if (this.proFileData.value.tel != '' && this.proFileData.value.tel != this.userInfo.tel) {
      this.userInfo.tel = this.proFileData.value.tel
    }
    if (this.proFileData.value.carteira != '' && this.proFileData.value.carteira != this.userInfo.carteira) {
      this.userInfo.carteira = this.proFileData.value.carteira
    }
    // this.authService.modifyUserInfo(this.userInfo)
    this.showLoading = false;
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      let tempInfo = JSON.parse(tempData)
      let querySnapshot = await this.authService.getUserInfo(tempInfo.uid);
      this.userInfo = querySnapshot?.data()
      console.log(this.userInfo)
      let tempObj = JSON.stringify(this.userInfo)
      localStorage.setItem('userDBData', tempObj)
      this.showLoading = false;
    } else {
      let tempId = this.authService.userID
      let querySnapshot = await this.authService.getUserInfo(tempId);
      this.userInfo = querySnapshot?.data()
      console.log(this.userInfo)
    }
  }
}

