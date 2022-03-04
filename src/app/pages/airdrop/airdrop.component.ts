import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-airdrop',
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.css']
})

export class AirdropComponent implements OnInit {

  urlParam: any;
  verifyCarteira: any;
  userInfo: any;
  taskInfo: any;
  userAlreadyCompletedTask: any;
  userComeFrom: any;
  userBalance = {
    BNB: 0,
    SH: 0
  };
  minimunBalance: number = 10000.000000000;

  public confirmationForm: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private act: ActivatedRoute, private authService: AuthService, private formBuilder: FormBuilder) {
    this.confirmationForm = this.formBuilder.group({
      address: [''],
    })
  }

  async ngOnInit() {
    // await this.getMinimunBalance();
    this.urlParam = await this.route.snapshot.paramMap.get('atividade');
    await this.setPageInfo();
    await this.getTaskInfo();
    this.isTaskCompleted();
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    }
  }

  checkCarteira() {
    if (this.userInfo?.carteira === this.confirmationForm.value.address) {
      this.verifyCarteira = true;
    }
  }

  isTaskCompleted() {
    if (this.taskInfo && this.urlParam) {
      let lastActivity = this.taskInfo[this.urlParam]?.actual.seconds
      let today = new Date().toLocaleDateString();
      lastActivity = new Date(lastActivity * 1000).toLocaleDateString();
      if (today === lastActivity) {
        this.userAlreadyCompletedTask = true;
      } else {
        this.userAlreadyCompletedTask = false;
      }
    }
  }

  // async getMinimunBalance() {
  //   try {
  //     this.minimunBalance = await this.authService.minimunBalance();
  //     console.log(this.minimunBalance)
  //   } catch (error) {

  //   }
  // }

  completeTask() {
    let param = this.urlParam;
    if (param) {
      let tempUser: any;
      let taskTemp: any;
      tempUser = this.userInfo.uid
      if (tempUser) {
        if (this.taskInfo && this.taskInfo[param]) {
          let actualTask = this.taskInfo[param].actual;
          let lastTask = this.taskInfo[param].last;
          if (lastTask) {
            lastTask.push(actualTask)
            taskTemp = { [param]: { "last": lastTask, "actual": new Date() } }
          } else {
            taskTemp = { [param]: { "last": [new Date()], "actual": new Date() } }
          }
        } else {
          // if (actualTask) {
          taskTemp = { [param]: { actual: new Date() } }
        }
        this.authService.addTaskInfo(tempUser, taskTemp)
        this.getTaskInfo();
        this.router.navigate(['daily-task'])
      }
    }
  }

  async getTaskInfo() {
    this.taskInfo = await this.authService.getTaskInfo(this.authService.userID).then(querySnapshot => {
      return querySnapshot.data()
    })
  }
}
