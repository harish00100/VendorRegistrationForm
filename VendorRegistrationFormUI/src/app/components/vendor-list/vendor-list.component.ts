import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorRegisteredList } from 'src/app/Model/VendorRegisteredList';
import { GeneralBusinessInformationServiceService } from 'src/app/services/general-business-information-service.service';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css']
})
export class VendorListComponent implements OnInit {

  constructor(private BusinessInformationService: GeneralBusinessInformationServiceService, private router: Router) { }

  VendorTableList: VendorRegisteredList[] = []
  ngOnInit(): void {
    this.BusinessInformationService.GetVendorTable().subscribe((data: any) => {
      this.VendorTableList = data;
    })
  }

  ViewScreen(vendorID: number) {
    this.router.navigate([`/VendorRegistrationForm/${vendorID}`])
  }

  DeleteRecord(vendorID: number) {
    let arr:VendorRegisteredList[]=[]
    var VendorID = {
      VendorMasterID: vendorID
    }

    if(confirm('Are you Sure want to delete this Record')){
    this.BusinessInformationService.DeleteRecords(VendorID).subscribe(data => {
      alert('Record Deleted Successfully');
      this.VendorTableList.forEach(element => {
        if(element.VendorID==vendorID){
  
        }
        else{
          arr.push(element)
        }
      });
      this.VendorTableList=arr;
    })
  }
  }
}