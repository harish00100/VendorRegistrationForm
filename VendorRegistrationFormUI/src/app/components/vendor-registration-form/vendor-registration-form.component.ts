import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EmailValidator, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import ValidateForm from '../helper/ValidateForm';
import { RegisteredCertificate } from 'src/app/Model/RegistrationCertificateList';
import { DeclarationDocumentsList } from 'src/app/Model/DeclarationDocuments';

import {
  Inject,
  LOCALE_ID
}
  from '@angular/core';
import {
  formatDate
}
  from '@angular/common';

import { GeneralBusinessInformationServiceService } from 'src/app/services/general-business-information-service.service';
import { ActivatedRoute } from '@angular/router';
import { BusinessTypeList } from 'src/app/Model/BusinessType';
import { CompanyTypeList } from 'src/app/Model/CompanyType';
import { companyContactsVendor } from 'src/app/Model/CompantContactsVendor';
import { ManagementSystemVendorList } from 'src/app/Model/ManagementSystemVendor';
import { PurchaserList } from 'src/app/Model/PurchaserList';
import { CompanyNameList } from 'src/app/Model/CompanyList';
import { countryNames } from 'src/app/Model/Country';
import { CityNames } from 'src/app/Model/City';
import { StateNames } from 'src/app/Model/State';
import { DesignationConfig } from 'src/app/Model/DesignationConfig';
import { CertificateList } from 'src/app/Model/Certifications';

@Component({
  selector: 'app-vendor-registration-form',
  templateUrl: './vendor-registration-form.component.html',
  styleUrls: ['./vendor-registration-form.component.css']
})
export class VendorRegistrationFormComponent implements OnInit {

  vendorRegistrationForm!: FormGroup;

  CompanyContactsForm!: FormGroup




  ngOnInit(): void {

    this.LoadData();
    this.getdate();
    this.CompanyContactsForm = this.fb.group({
      CompanyContactsName: ['', Validators.required],
      CompanyContactsPhoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      CompanyContactsEmailID: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]]
    })

    this.vendorRegistrationForm = this.fb.group({
      companyName: ['', Validators.required],
      streetAddress: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      FaxNumber:['',Validators.required],
      emailAddress: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      certificateRegistration: ['', Validators.required],
      // businessType: [''],
      companyType: ['', Validators.required],
      submittedBy: ['', Validators.required],
      purchasedBy: ['', Validators.required],
      DeclarationFiles: ['', Validators.required],
      DesignationList: ['', Validators.required],
      Certification: ['', Validators.required],
      CertificationDate: ['', Validators.required],
      CertificationBody: ['', Validators.required],
      CertificationNumber: ['', Validators.required],
      SubmitDate: [''],
      businessType:this.fb.array([],Validators.required)
    })



    //if id is present and passed in URI
    if (this.actveRoute.snapshot.paramMap.get('id') != null) {
      var VendorID = {
        VendorMasterID: this.RouteID
      }
      // FetchFromRegistrationCertificateTable
      this.BusinessInformationService.FetchFromRegistrationCertificateTable(VendorID).subscribe((data) => {
        this.RegistrationCertificateDownload = data
      })

      // FetchFromRegistrationCertificateTable
      this.BusinessInformationService.FetchFromDeclarationFilesTable(VendorID).subscribe((data) => {
        this.DeclarationFilesDownload = data
      })

            // // FetchFromRegistrationCertificateTable
            // this.BusinessInformationService.FetchFromRegistrationCertificateTable(VendorID).subscribe(
            //   {
            //     next:(data) => {
            //   this.RegistrationCertificateDownload = data
            //   },
            //     complete:()=>{// FetchFromRegistrationCertificateTable
            //   this.BusinessInformationService.FetchFromDeclarationFilesTable(VendorID).subscribe((data) => {
            //     this.DeclarationFilesDownload = data
            //   },err=>{
            //     console.log(err);
            //   })
            // }})

      this.HideGenerate = 'cursor:default;pointer-events:none;visibility:hidden'

      this.visibility = 'visibility: hidden;'
      this.CountryNameList = []

      this.BusinessInformationService.GetVendorTableList(VendorID).subscribe((data: any) => {
        // console.log(data);
        this.vendorRegistrationForm.patchValue({
          streetAddress: data[0].StreetAddress, phoneNumber: data[0].PhoneNumber,FaxNumber:data[0].FaxNumber, emailAddress: data[0].EmailID, submittedBy: data[0].SubmittedBy, SubmitDate: data[0].DateSubmitted,
          companyType: data[0].CompanyType, companyName: data[0].CompanyName
        })

        this.CompanyNameList = [{ CompanyName: data[0].CompanyName }]
        this.CountryNameList = [{ CountryName: data[0].CountryName }]
        this.StateNameList = [{ StateName: data[0].StateName }]
        this.CityNameList = [{ CityName: data[0].CityName }]
        this.PurchaserList = [{ PurchaserName: data[0].PurchaserName }]


        //check box value checked
        this.BusinessTypeCheck = data[0].BusinessType //db fetch contains only checked value
        const StringCommaSeparatedValues = this.BusinessTypeCheck.toString().split(',');
        // console.log(StringCommaSeparatedValues);


        this.BusinessInformationService.BusinessTypesList().subscribe((data) => {
          this.BusinessTypeCheck = data
          console.log(this.BusinessTypeCheck);
          for (var i of this.BusinessTypeCheck) {
            var value = {
              BusinessType: i.BusinessType,
              BusinessTypeID: i.BusinessTypeID,
              IsChecked: false
            }
            this.BusinessTypeList.push(value)
            console.log(this.BusinessTypeList);
          }

          this.BusinessTypeList.forEach((iter) => {
            console.log(iter);

            if (StringCommaSeparatedValues.includes(iter.BusinessType)) {
              console.log(iter);
              // eg.distributors,engineering will be checked
              iter.IsChecked = true;
            }
          })
        })
      })

      this.BusinessInformationService.FetchCompanycontactsTableForparticularVendor(VendorID).subscribe((data: any) => {
        // console.log(data);

        for (var item of data) {
          // console.log(item);

          var TableData: companyContactsVendor = {
            DesignationID: item.DesignationID,
            ContactsName: item.ContactsName,
            ContactsPhoneNumber: item.ContactsPhoneNumber,
            ContactsEmailID: item.ContactsEmailID,
            Designation: item.Designation,
          }
          this.SavedCompanyContactsData.push(TableData);
        }
      })

      this.BusinessInformationService.FetchManagementSystemForparticularVendor(VendorID).subscribe((data: any) => {
        // console.log(data);
        for (var item of data) {
          // console.log(item);

          var ManagementDataSavetoDB: ManagementSystemVendorList = {
            CertificationID: item.CertificationID,
            name: item.CertifiedTo,
            DateCertified: item.DateCertified,
            CertificationBody: item.CertificationBody,
            CertificationNumber: item.CertificationNumber
          }
          this.ManagementData.push(ManagementDataSavetoDB);
        }
      })
      this.vendorRegistrationForm.get('companyType')?.disable()

      this.selectedvalue = true
    }
  }


  LoadData(){
    this.RouteID = this.actveRoute.snapshot.paramMap.get('id');

    //fetch business type table
    if (this.RouteID == null) {
      this.BusinessInformationService.BusinessTypesList().subscribe((data) => {
        this.BusinessTypeCheck = data
        for (var i of this.BusinessTypeCheck) {
          var value = {
            BusinessType: i.BusinessType,
            BusinessTypeID: i.BusinessTypeID,
            IsChecked: false
          }
          this.BusinessTypeList.push(value)
          // console.log(this.BusinessTypeList);
        }
      })
    }

    //fetch Company type table
    this.BusinessInformationService.CompanyTypesList().subscribe((data) => {
      this.CompanyTypesList = data
    })

    // Fetch Company Table
    this.BusinessInformationService.FetchCompanyTable().subscribe((data) => {
      this.CompanyNameList = data
    })

    //Fetch Country Table
    this.BusinessInformationService.FetchCountryNameList().subscribe((data) => {
      this.CountryNameList = data
    })

    this.BusinessInformationService.FetchDesignationTable().subscribe((data) => {
      this.DesignationTableWithAllValues = data
      this.DesignationtableList = data
    })

    this.BusinessInformationService.FetchManagementSystemTable().subscribe((data) => {
      this.ManagementSystemtableWithAllValues = data
      this.ManagementSystemtableList = data
    })

    this.BusinessInformationService.FetchPurchaserNameTable().subscribe((data) => {
      this.PurchaserList = data
    })

  }


  BusinessTypeCheck: BusinessTypeList[] = []
  IsChecked: boolean = false

  CompanyNameList: CompanyNameList[] = []
  CountryNameList: countryNames[] = []
  StateNameList: StateNames[] = []
  CityNameList: CityNames[] = []

  RegistrationCertificateDownload: RegisteredCertificate[] = []
  DeclarationFilesDownload: DeclarationDocumentsList[] = []

  DesignationtableList: DesignationConfig[] = []
  DesignationTableWithAllValues: DesignationConfig[] = []

  ManagementSystemtableList: CertificateList[] = []
  ManagementSystemtableWithAllValues: CertificateList[] = []


  SavedCompanyContactsData: Array<any> = []

  ManagementData: ManagementSystemVendorList[] = []
  NewArrayList: Array<object> = []
  FilterCompanyArrayList: DesignationConfig[] = []
  PurchaserList: PurchaserList[] = []

  BusinessTypeList: BusinessTypeList[] = []
  CompanyTypesList: CompanyTypeList[] = []

  isDesignationListSelected = 'visibility:hidden;'
  isCertificationSelected = 'visibility:hidden;';
  isVerified = 'verify'
  visibility = '';

  CompanyType: string = ''
  selectedvalue: boolean = false
  RouteID: any

  Currentdate = ''
  OTPinputBox = 'visibility: hidden;width: 130px;';
  OTPVerification = 'visibility: hidden;width: 130px;';
  DesignationName = ''
  CertificateName = ''
  HideGenerate = ''

  BusinessType: string = ''

  nameNecessary = ''
  phonenumberNecessary = ''
  emailNecessary = ''
  VendorMasterID = ''

  SingleFilePDF = ''

  contactsData: boolean = false;
  managementData: boolean = false;

  enableSubmitButton: boolean = true

  DBFaultyEntryError: boolean = false


  constructor(private fb: FormBuilder, @Inject(LOCALE_ID) public locale: string, private BusinessInformationService: GeneralBusinessInformationServiceService, private actveRoute: ActivatedRoute) {}

  onSubmit() {

    if (this.vendorRegistrationForm.valid && this.SavedCompanyContactsData.length>=1 && this.ManagementData.length>=1) {
      this.BusinessType = ''
      // console.log(this.vendorRegistrationForm.controls['businessType'].value)
      this.vendorRegistrationForm.controls['businessType'].value.forEach((element:any) => {
        this.BusinessType+=element+','
      });
      this.BusinessType = this.BusinessType.substring(0, this.BusinessType.length - 1);
      
      //fetch business type table
      this.BusinessTypeList = []
      if (this.RouteID == null) {
        this.BusinessInformationService.BusinessTypesList().subscribe((data) => {
          this.BusinessTypeCheck = data
          for (var i of this.BusinessTypeCheck) {
            var value = {
              BusinessType: i.BusinessType,
              BusinessTypeID: i.BusinessTypeID,
              IsChecked: false
            }
            this.BusinessTypeList.push(value)
            // console.log(this.BusinessTypeList);
          }
        })
      }
      // console.log(this.vendorRegistrationForm.value);
      // console.log(this.SavedCompanyContactsData);
      // console.log(this.ManagementData);

      var TableData = {
        CompanyID: this.vendorRegistrationForm.value.companyName,
        StreetAddress: this.vendorRegistrationForm.value.streetAddress,
        CountryID: this.vendorRegistrationForm.value.country,
        StateID: this.vendorRegistrationForm.value.state,
        CityID: this.vendorRegistrationForm.value.city,
        PhoneNumber: this.vendorRegistrationForm.value.phoneNumber,
        FaxNumber:this.vendorRegistrationForm.value.FaxNumber,
        EmailID: this.vendorRegistrationForm.value.emailAddress,
        BusinessType: this.BusinessType,
        CompanyType: this.vendorRegistrationForm.value.companyType,
        SubmittedBy: this.vendorRegistrationForm.value.submittedBy,
        DateSubmitted: this.Currentdate,
        PurchaserName: this.vendorRegistrationForm.value.purchasedBy
      }
      this.BusinessInformationService.InsertDatatoVendorandDependencyTables(TableData).subscribe((data) => {
        this.VendorMasterID = data
        // console.log(this.VendorMasterID);


          // save pdf 
          var SingleFileSave = {
            RegistrationCertificates: this.SingleFilebase64String,
            SinglePDFFileName: this.SingleFilePDF,
            VendorMasterID: this.VendorMasterID
          }
          // console.log(SingleFileSave);

          this.BusinessInformationService.InsertIntoRegistrationCertificateTable(SingleFileSave).subscribe(data => {
            console.log("PDF saved in RegistrationCertificateTable");
          }, err => {
            this.BusinessInformationService.DeleteRecords({ VendorMasterID: this.VendorMasterID }).subscribe(data => {
              alert('Form did not Submit Properly.Try entering again.');
            })
          })

          // api call to insert in DB
          for (var item of this.MultipleBase64StringArray) {
            var MultipleFileSave = {
              DeclarationDocuments: item[0],
              MultiplePDFFileName: item[1],
              VendorMasterID: this.VendorMasterID
            }
            this.BusinessInformationService.InsertIntoDeclarationFilesTable(MultipleFileSave).subscribe(data => {
              console.log("PDF saved in DeclarationFilesTable");
            }, err => {
              this.BusinessInformationService.DeleteRecords({ VendorMasterID: this.VendorMasterID }).subscribe(data => {
                alert('Form did not Submit Properly.Try entering again.');
              })
            })
          }

          // need to run for loop for insert command to insert all data

          for (var contacts of this.SavedCompanyContactsData) {

            var ContactsData = {
              DesignationID: contacts['DesignationID'],
              ContactsName: contacts['ContactsName'],
              ContactsPhoneNumber: contacts['ContactsPhoneNumber'],
              ContactsEmailID: contacts['ContactsEmailID'],
              VendorMasterID: this.VendorMasterID
            }
            this.BusinessInformationService.InsertDataIntoCompanyContactsTable(ContactsData).subscribe(data => {
              this.contactsData = true;

              for (var management of this.ManagementData) {

                var ManagementData = {
                  CertificationID: management['CertificationID'],
                  DateCertified: management['DateCertified'],
                  CertificationBody: management['CertificationBody'],
                  CertificationNumber: management['CertificationNumber'],
                  VendorMasterID: this.VendorMasterID
                }
                this.BusinessInformationService.InsertDataIntoManagementSystemTable(ManagementData).subscribe(data => {
                  this.managementData = true;
                  console.log("Inserted data in ManagementSystemTable successfully");
    
                  if (this.contactsData && this.managementData) {
                    
                    this.resetForm();
                    alert('Form Submitted Successfully')
                  }
                }, err => {
                  this.BusinessInformationService.DeleteRecords({ VendorMasterID: this.VendorMasterID }).subscribe(data => {
                    alert('Form did not Submit Properly.Try entering again.');
                  })
                })
              }
              // console.log("Inserted successfully");
            }, err => { this.DBFaultyEntryError = true })
          }
        
      }, err => {
        this.BusinessInformationService.DeleteRecords({ VendorMasterID: this.VendorMasterID }).subscribe(data => {
          alert('Form did not Submit Properly.Try entering again.');
        })
      }
      )
    }

    else {
      ValidateForm.validateAllFormFields(this.vendorRegistrationForm);
      alert('Fill all Form fields')
    }
  } // form field ends

  getdate() {
    this.Currentdate = formatDate(new Date().toLocaleDateString('en-US').toString(), 'yyyy-MM-dd', this.locale).toString();
  }

  LoadStateList(CountryID: any) {
    this.BusinessInformationService.FetchStateNameList({ CountryID: CountryID }).subscribe((data) => {
      this.StateNameList = data
      this.CityNameList=[]
    })
  }

  LoadCityList(StateID: any) {
    this.BusinessInformationService.FetchCityNameList({ StateID: StateID }).subscribe((data) => {
      this.CityNameList = data
    })
  }

  OTPnumber = ''
  GenerateOTP(emailID: any) {
    this.BusinessInformationService.MailSender({ EmailID: emailID }).subscribe((data) => {
      // console.log(data);
      if (data == 'Invalid') {
        alert('Email Already Exists. Try Entering a new Mail ID');
      }
      else {
        this.OTPinputBox = 'width: 130px;';
        this.OTPVerification = 'width: 130px;';
        this.OTPnumber = data
      }
    })
  }

  CheckValidOTP(OTP: any) {
    if (OTP == this.OTPnumber) {
      alert('OTP Verified Successfully')
      this.isVerified = 'verified'
      this.OTPinputBox = 'width: 130px;cursor:default;pointer-events:none;'
      this.OTPVerification = 'width: 130px;cursor:default;pointer-events:none'
      this.enableSubmitButton = false
    }
    else {
      alert('Wrong OTP Entered')
      this.isVerified = 'verify'
    }
  }

  AddDesignation(designationName: any) {
    let a=document.getElementById('exampleModal');
    if(a!=null){
      a.ariaModal='true'
      a.role='dialog'
      a.ariaHidden='false'
      a.style.display='block'
      console.log(a);
    }
    

    
    this.DesignationName = designationName
    this.isDesignationListSelected = ''

    // console.log(this.DesignationtableList);
    this.DesignationtableList.filter(x => {
      if (x.Designation == designationName) {
        // console.log(x);
        this.nameNecessary = x.IsNameRequired;
        this.phonenumberNecessary = x.IsPhoneNumberRequired
        this.emailNecessary = x.IsEmailIDRequired
      }
    })

    this.CompanyContactsForm.controls['CompanyContactsName'].setValue('')
    this.CompanyContactsForm.controls['CompanyContactsPhoneNumber'].setValue('')
    this.CompanyContactsForm.controls['CompanyContactsEmailID'].setValue('')
  }


  CertificationSaving(SelectedCertificatioName: any) {
    //we get id here save each entry to array and finally save to db with master id as foreign key
    // console.log(SelectedCertificatioName);
    this.CertificateName = SelectedCertificatioName
    this.isCertificationSelected = ''

    this.vendorRegistrationForm.controls['CertificationDate'].setValue('')
    this.vendorRegistrationForm.controls['CertificationBody'].setValue('')
    this.vendorRegistrationForm.controls['CertificationNumber'].setValue('')
  }

  SaveCompanyContactsDetails(name: string, phoneNumber: any, Email: string) {
    // console.log(this.DesignationName, name, phoneNumber, Email);
    this.isDesignationListSelected = 'visibility:hidden;';

    var value = {
      Designation: this.DesignationName,
      Name: name,
      PhoneNumber: phoneNumber,
      EmailID: Email
    }

    // console.log(value.Designation);

    this.FilterCompanyArrayList = [];

    this.DesignationtableList.filter((data) => {
      // console.log(data);

      if (data.Designation != value.Designation) {
        this.FilterCompanyArrayList.push(data)
      }
      else {
        var TableData = {
          DesignationID: data.DesignationID,
          ContactsName: name,
          ContactsPhoneNumber: phoneNumber,
          ContactsEmailID: Email,
          Designation: this.DesignationName,
        }
        this.SavedCompanyContactsData.push(TableData);
        // console.log(data);
      }
    })

    this.DesignationtableList = this.FilterCompanyArrayList
    // console.log(this.SavedCompanyContactsData);

    this.CompanyContactsForm.reset();
    // this.vendorRegistrationForm.patchValue({
    //   DesignationList:""
    // })
  }

  SaveManagementSystemDetails(CerttificateDate: any, CertificateBody: any, CertificateNumber: any) {
    // console.log(CerttificateDate, CertificateBody, CertificateNumber);
    this.isCertificationSelected = 'visibility:hidden;';

    var val = {
      name: this.CertificateName, CerttificateDate: CerttificateDate, CertificateBody: CertificateBody, CertificateNumber: CertificateNumber
    }
    // this.ManagementData.push(val);

    // console.log(this.ManagementData); //each time store
    // console.log(val);

    // console.log(val.name);
    // console.log(this.ManagementSystemtableList); //db data

    this.NewArrayList = []
    this.ManagementSystemtableList.filter((x) => {
      if (x.CertifiedTo !== val.name) {
        // console.log(x)
        this.NewArrayList.push(x)
      }
      else {
        var ManagementDataSavetoDB: ManagementSystemVendorList = {
          CertificationID: x.CertificationID,
          name: this.CertificateName,
          DateCertified: CerttificateDate,
          CertificationBody: CertificateBody,
          CertificationNumber: CertificateNumber
        }
        this.ManagementData.push(ManagementDataSavetoDB);
      }
    })

    this.ManagementSystemtableList = this.NewArrayList

    // console.log(this.NewArrayList);
    // console.log(this.ManagementData);
    // console.log(this.ManagementSystemtableList);

    // this.vendorRegistrationForm.controls['CertificationDate'].reset()
    // this.vendorRegistrationForm.controls['CertificationBody'].reset()
    // this.vendorRegistrationForm.controls['CertificationNumber'].reset()
  }

  ChooseCompanyName(RadioOption: any) {
    // console.log(this.vendorRegistrationForm.controls['companyType'].value);
    this.CompanyType = this.vendorRegistrationForm.controls['companyType'].value;
  }

  resetForm() {
    this.vendorRegistrationForm.reset();
    this.CompanyContactsForm.reset();
    this.CompanyContactsForm.controls['CompanyContactsName'].setValue('')
    this.CompanyContactsForm.controls['CompanyContactsPhoneNumber'].setValue('')
    this.CompanyContactsForm.controls['CompanyContactsEmailID'].setValue('')

    this.vendorRegistrationForm.controls['CertificationDate'].setValue('')
    this.vendorRegistrationForm.controls['CertificationBody'].setValue('')
    this.vendorRegistrationForm.controls['CertificationNumber'].setValue('')

    this.isDesignationListSelected = 'visibility:hidden;'
    this.isCertificationSelected = 'visibility:hidden;';
    this.isVerified = 'verify'

    this.OTPinputBox = 'visibility: hidden;width: 130px;';
    this.OTPVerification = 'visibility: hidden;width: 130px;';

    this.SavedCompanyContactsData = []
    this.ManagementData = []

    //reset array values
    this.ManagementSystemtableList = this.ManagementSystemtableWithAllValues
    this.DesignationtableList = this.DesignationTableWithAllValues
  }

  ResetMouseOver() {
    if (this.RouteID == null) {
      // console.log("no route id");
    } else {
      // console.log(" route id");
      this.DesignationtableList = []
      this.ManagementSystemtableList = []
    }
  }

  SingleFilebase64String = ''
  base64String: string = ''
  MultipleBase64StringArray: any[] = []

  singleFile(e: any) {
    let file: File | any = null;
    file = e.target.files.item(0);
    // console.log(file.name);
    this.SingleFilePDF = file.name
    const myReader = new FileReader();
    myReader.readAsDataURL(file);
    myReader.onloadend = () => {
      this.SingleFilebase64String = myReader.result as string;
      console.log(this.SingleFilebase64String);
    }
  }


  multipleFiles(e: any) {
    let fileLength: number = e.target.files.length; //2

    for (let i = 0; i < fileLength; i++) {
      const file = e.target.files[i];
      // console.log(file.type);
      
      const myReader = new FileReader();

      myReader.readAsDataURL(file);
      myReader.onload = () => {
        this.MultipleBase64StringArray.push([String(myReader.result), file.name])
        console.log(this.MultipleBase64StringArray);
      }
    }
  }

  SendBase64String: string = '';
  download(val: any) {
    console.log(val);
    if(val.toString().includes('data:application/pdf;base64,')){
      this.SendBase64String = val.replace('data:application/pdf;base64,', '')
      const byteArray = new Uint8Array(
        atob(this.SendBase64String)
          .split('')
          .map((char) => char.charCodeAt(0))
      );
      const file = new Blob([byteArray], { type: 'application/pdf' })
      const fileurl = URL.createObjectURL(file);
      let fileName = 'download.pdf';
      let link = document.createElement('a');
      link.download = fileName;
      link.href = fileurl
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    else if(val.toString().includes('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,'))
    {
      this.SendBase64String = val.replace('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,', '')
      const byteArray = new Uint8Array(
        atob(this.SendBase64String)
          .split('')
          .map((char) => char.charCodeAt(0))
      );
      const file = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' })
      const fileurl = URL.createObjectURL(file);
      let fileName = 'download.docx';
      let link = document.createElement('a');
      link.download = fileName;
      link.href = fileurl
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    else if(val.toString().includes('data:text/plain;base64,'))
    {
      this.SendBase64String = val.replace('data:text/plain;base64,', '')
      const byteArray = new Uint8Array(
        atob(this.SendBase64String)
          .split('')
          .map((char) => char.charCodeAt(0))
      );
      const file = new Blob([byteArray], { type: 'text/plain;base64,' })
      const fileurl = URL.createObjectURL(file);
      let fileName = 'download.txt';
      let link = document.createElement('a');
      link.download = fileName;
      link.href = fileurl
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    else if(val.toString().includes('data:image/png;base64,'))
    {
      this.SendBase64String = val.replace('data:image/png;base64,', '')
      const byteArray = new Uint8Array(
        atob(this.SendBase64String)
          .split('')
          .map((char) => char.charCodeAt(0))
      );
      const file = new Blob([byteArray], { type: 'image/png;base64,' })
      const fileurl = URL.createObjectURL(file);
      let fileName = 'download.png';
      let link = document.createElement('a');
      link.download = fileName;
      link.href = fileurl
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  @ViewChild('UserEnteredOTP') UserEnteredOTP!:ElementRef
  emailValidity(val:any,val1:any){
    this.enableSubmitButton=true
      this.isVerified = 'verify'
      this.OTPinputBox = 'visibility: hidden;width: 130px;';
       this.OTPVerification = 'visibility: hidden;width: 130px;';

    if(val1=='verified'){
        //change otp number back to empty
        this.UserEnteredOTP.nativeElement.value = ''
    }
    else{
        this.enableSubmitButton=true
    } 
  }

  BusinessTypeCheckBox(event:any){
    console.log(event);
  }

  DeleteCompanyContactRecord(val:any){
    // console.log(val);
    // console.log(this.DesignationTableWithAllValues); // add elemnt
    // console.log(this.SavedCompanyContactsData); //Designation foreach
    // console.log(this.DesignationtableList); //to element
    
    this.DesignationTableWithAllValues.forEach(element => {
      if(element.DesignationID==val.DesignationID){
        this.DesignationtableList.push(element)
      }
    });

    let arr:any=[]
    this.SavedCompanyContactsData.forEach(element => {
      if(element.DesignationID!=val.DesignationID){
        arr.push(element)
      }
    });
    this.SavedCompanyContactsData=arr

    this.vendorRegistrationForm.patchValue({DesignationList:''})
  }

  DeleteManagementSystemtRecord(val:any){
    // console.log(val);
    // console.log(this.ManagementSystemtableList);
    // console.log(this.ManagementSystemtableWithAllValues);
    this.ManagementSystemtableWithAllValues.forEach(element=>{
      if(val.CertificationID==element.CertificationID){
        this.ManagementSystemtableList.push(element)
      }
    })

    let arr:any=[]
    this.ManagementData.forEach(element=>{
      if(element.CertificationID!=val.CertificationID){
        arr.push(element)
      }
    })
    this.ManagementData=arr

    this.vendorRegistrationForm.patchValue({Certification:''})    
  }

  handle(e:any){
    let arr=this.vendorRegistrationForm.get('businessType') as FormArray
    if(e.target.checked){
      arr.push(new FormControl(e.target.value))
    }
    else{
      let i=0
      arr.controls.forEach(
        (l:any)=>{
          if(l.value==e.target.value){
            arr.removeAt(i)
          }
          i++
        }
      )
    }
  }
 
  dateFilter(val:any){
    // console.log(this.vendorRegistrationForm.controls['CertificationDate'].value);
    var date=new Date();
    // console.log(date);
    if(date<new Date(val) ){
      alert('Future Date not Possible')
      this.vendorRegistrationForm.controls['CertificationDate'].reset()
    }
    else
    {
      // console.log(this.vendorRegistrationForm.controls['CertificationDate'].value);
    }
  }
}
