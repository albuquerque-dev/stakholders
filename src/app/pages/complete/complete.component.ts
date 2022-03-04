import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.css']
})
export class CompleteComponent implements OnInit {

  public confirmationForm: FormGroup;
  userInfo: any;
  verifyCarteira: boolean = false;
  urlParam: any;

  constructor(private route: ActivatedRoute, private router: Router, private act: ActivatedRoute, private authService: AuthService, private formBuilder: FormBuilder) {
    this.confirmationForm = this.formBuilder.group({
      address: [''],
    })
  }

  async ngOnInit() {
    this.urlParam = await this.route.snapshot.paramMap.get('atividade');
    await this.setPageInfo();
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    }
  }

  checkUserTasks() {

  }

  completeUserTask() {
    let userData;
    let taskActive;
    let taskLevel;
    if (this.userInfo && this.urlParam) {
      userData = this.userInfo;
      if (userData.taskLevel) {
        taskLevel = userData.taskLevel;
      } else if (!userData.taskLevel) {
        taskLevel = 0
      }
      taskActive = this.urlParam
      if (taskActive == 'helkin' && taskLevel == 0) {
        taskLevel = 1
      }
      if (taskActive == 'x-mine' && taskLevel == 1) {
        taskLevel = 2
      }
      if (taskActive == 'world6game' && taskLevel == 2) {
        taskLevel = 3
      }
      if (taskActive == 'azul' && taskLevel == 3) {
        taskLevel = 4
      }
      if (taskActive == 'basketball' && taskLevel == 4) {
        taskLevel = 5
      }
      if (taskActive == 'savebee' && taskLevel == 5) {
        taskLevel = 6
      }
      if (taskActive == 'hackerspace' && taskLevel == 6) {
        taskLevel = 7
      }
      if (taskActive == 'velox' && taskLevel == 7) {
        taskLevel = 8
      }
      if (taskActive == 'rayons-energy' && taskLevel == 8) {
        taskLevel = 9
      }
      if (taskActive == 'reibit' && taskLevel == 9) {
        taskLevel = 10
      }
      userData.taskLevel = taskLevel;
      this.router.navigate(['daily-task'], { state: { data: { "atividade": this.urlParam } } });
      this.authService.updateUserInfo(userData)
    }
  }

  checkCarteira() {
    if (this.userInfo?.carteira === this.confirmationForm.value.address) {
      this.verifyCarteira = true;
    }
  }

  checkTask() {
    if (this.userInfo?.carteira === this.confirmationForm.value.address) {
      this.verifyCarteira = true;
    }
  }
}

