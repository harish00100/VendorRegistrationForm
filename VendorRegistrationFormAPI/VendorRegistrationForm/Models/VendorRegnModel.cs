using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VendorRegistrationForm.Models
{
    public class VendorRegnModel
    {
        //public int CountryID { get; set; }
        //public int StateID { get; set; }
        public string Designation { get; set; }
        public string Name { get; set; }
        //public string PhoneNumber { get; set; }
        //public string EmailID { get; set; }
        public char ActiveFlag { get; set; }
        public int OTP { get; set; }


        // below fields fill all tables
        public int CompanyID { get; set; }
        public string StreetAddress { get; set; }
        public int CountryID { get; set; }
        public int StateID { get; set; }
        public int CityID { get; set; }
        public string PhoneNumber { get; set; }
        public string FaxNumber { get; set; }
        public string EmailID { get; set; }
        public string BusinessType { get; set; }
        public string CompanyType { get; set; }
        public string SubmittedBy { get; set; }
        public DateTime DateSubmitted { get; set; }
        public string PurchaserName { get; set; }
        public int DesignationID { get; set; }
        public string ContactsName { get; set; }
        public string ContactsPhoneNumber { get; set; }
        public string ContactsEmailID { get; set; }
        public int CertificationID { get; set; }
        public DateTime DateCertified { get; set; }
        public string CertificationBody { get; set; }
        public string CertificationNumber { get; set; }
        public int VendorMasterID { get; set; }

        public string RegistrationCertificates { get; set; }

        public string DeclarationDocuments { get; set; }

        public string MultiplePDFFileName { get; set; }

        public string SinglePDFFileName { get; set; }
    }
}