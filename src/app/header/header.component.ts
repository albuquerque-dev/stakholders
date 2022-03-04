import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges {

  userInfo: any;
  firstname: any;
  userCanUseDaily: boolean;

  constructor(private router: Router, private authService: AuthService, private angularFireAuth: AngularFireAuth) {
    this.userCanUseDaily = false;
  }

  async ngOnInit() {
    await this.setPageInfo()
  }

  ngOnChanges() {
  }

  getPageInfo() {

  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
      this.firstname = this.userInfo.nome?.split(' ')[0]
    } else {
      if (!this.userInfo) {
        this.angularFireAuth.authState.subscribe(async (user: any) => {
          if (user && user.uid) {
            let result: any = await this.authService.getUserInfo(user.uid);
            let data = result?.data();
            if (data) {
              this.userInfo = data;
              this.firstname = this.userInfo.nome?.split(' ')[0]
              let jsonString = JSON.stringify(data);
              if (jsonString) {
                localStorage.setItem('userDBData', jsonString);
              }
            }
          }
        })
      }
    }
  }

  logoutUser() {
    this.authService.logout();
  }
  messageBoxLaunch() {
    window.alert('Lançamento em Breve!')
  }
}
