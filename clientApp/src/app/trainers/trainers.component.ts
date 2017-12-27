import {Component, Inject, OnInit} from '@angular/core';
import {Trainer} from '../domain/trainer';
import {Skill} from '../domain/skill';
import {NotificationService} from '../services/notification.service';
import {TrainerService} from '../services/trainer.service';
import {NavigationExtras, Params, Router} from '@angular/router';
import {S3CredentialService} from '../services/s3-credential.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.css']
})
export class TrainersComponent implements OnInit {
  trainers: Trainer[];
  isManager: boolean;

  constructor(private notificationService: NotificationService,
              private trainerService: TrainerService,
              private s3Service: S3CredentialService,
              public dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit() {
    this.isManager = true;
    this.getAll();

    this.trainers = [{
      trainerId: 1,
      firstName: 'James',
      lastName: 'Smith',
      skills: [{
        skillId: 1,
        name: 'Java',
        active: true
      },
        {skillId: 2,
          name: 'Angular',
          active: true
        },
        {
          skillId: 3,
          name: 'Spring',
          active: true
        }],
      certifications: 'Certs',
      active: true,
      resume: null,
    },
      {
        trainerId: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        skills: [{
          skillId: 1,
          name: 'C#',
          active: true
        },
          {skillId: 2,
            name: 'AngularJs',
            active: true
          },
          {
            skillId: 3,
            name: 'Jenkins',
            active: true
          }],
        certifications: 'Certs',
        active: false,
        resume: 'Resume',
      },
      {
        trainerId: 3,
        firstName: 'Jon',
        lastName: 'Jones',
        skills: [{
          skillId: 1,
          name: 'Java',
          active: true
        },
          {skillId: 2,
            name: 'Maven',
            active: true
          },
          {
            skillId: 3,
            name: 'MongoDB',
            active: true
          }],
        certifications: 'Certs',
        active: false,
        resume: 'Resume',
      },
      {
        trainerId: 4,
        firstName: 'Daniel',
        lastName: 'Cormier',
        skills: [{
          skillId: 1,
          name: 'C#',
          active: true
        },
          {skillId: 2,
            name: 'Cloud Foundry',
            active: true
          },
          {
            skillId: 3,
            name: 'AWS',
            active: true
          }],
        certifications: 'Certs',
        active: true,
        resume: 'Resume',
      }];
  }

  //Displays snackbar message notifications
  showToast(message) {
    this.notificationService.openSnackBar(message);
  }

  //Adds a trainer by popping up a dialog box
  addTrainer(evt): void {
    const trainer: Trainer = {
      trainerId: null,
      firstName: '',
      lastName: '',
      skills: [{
        skillId: 1,
        name: 'Java',
        active: true
      }],
      certifications: '',
      active: true,
      resume: '',
    };
    const dialogRef = this.dialog.open(TrainerDialogComponent, {
      width: '450px',
      data: {
        trainer: trainer
      }
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.trainers.push(result);
          this.trainerService.create(result)
            .subscribe(data => {
                this.showToast('Trainer ' + trainer.firstName + ' ' + trainer.lastName + ' has been added');
                this.rePullTrainers();
              },
              error => {
                this.showToast('Failed to add trainer ' + trainer.firstName + ' ' + trainer.lastName);
              }
            );

        }
      });

  }

  //Gets all trainers and stores them in variable trainers
  getAll() {
    this.trainerService.getAll()
      .subscribe(
        data => {
          this.trainers = data;
        },
        error => {
          this.showToast('Could not fetch trainers');
        }
      );
  }

  //After a change is made to trainers, clears trainers and retrieves the current from database
  rePullTrainers() {
    this.trainers = undefined;
    this.trainerService.getAll()
      .subscribe(
        data => {
          this.trainers = data;
        },
        error => {
          this.showToast('Could not fetch trainers');
        }
      );

  }

  showCalendar() {

  }

  hideCalendar() {

  }

  //Navigates to profile of the trainer clicked
  goToTrainer(trainer: Trainer) {
    const id = trainer.trainerId;
    this.router.navigate(['/profile/' + id]);
  }

  //Downloads a copy of the trainer's resume
  grabS3Resume(trainer: Trainer) {
    let filename = trainer.resume;
    event.stopPropagation();

    //show toast if there is no resume for this trainer in the database
    if (filename == null) {
      this.showToast(trainer.firstName + ' ' + trainer.lastName + ' does not have a resume uploaded');
      return;
    }

    event.stopPropagation();


  }

  //Sets the active trainer to inactive
  removeTrainer(trainer: Trainer) {
    trainer.active = false;
    this.trainerService.update(trainer)
      .subscribe(
        data => {
          this.showToast(trainer.firstName + ' ' + trainer.lastName + ' was deactivated successfully');
        },
        error => {
          this.showToast('Failed to deactivate ' + trainer.firstName + ' ' + trainer.lastName);
        }
      );
  }

  //Sets the inactive trainer to active
  activateTrainer(trainer: Trainer) {
    trainer.active = true;
    this.trainerService.update(trainer)
      .subscribe(
        data => {
          this.showToast(trainer.firstName + ' ' + trainer.lastName + ' was activated successfully');
        },
        error => {
          this.showToast('Failed to activate ' + trainer.firstName + ' ' + trainer.lastName);
        }
      );
  }

// Takes array of skills and formats their names into a string
  joinObjArrayByName(Skillz: Skill[]) {
    let skillslist = '';
    for(let i = 0; i < Skillz.length; i++){
      skillslist += Skillz[i].name;
      if(i != Skillz.length-1){
        skillslist += ', '
      }
    }
    return skillslist;
  };

  googleAuth() {
    this.router.navigate(['api/v2/google/google']);
  }

}

//Used for the display of new Trainer dialog box
@Component({
  selector: 'app-trainer-dialog',
  templateUrl: './trainer-dialog.component.html',
})
export class TrainerDialogComponent {

  constructor(public dialogRef: MatDialogRef<TrainerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    event.stopPropagation();
    this.dialogRef.close();
  }


}
