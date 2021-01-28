import { Component, OnInit } from '@angular/core';
import { RequestService } from './shared/service/request.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currencyForm: FormGroup;
  countryList: any = [];
  currency_rates: any = [];
  showError: boolean = false;
  showLoader: boolean = false;
  showTable: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _request: RequestService,
  ){}

  ngOnInit() {
    this.showLoader = true;
    this.buildForm();
    this.getCountries();
  }

  buildForm() {
    this.currencyForm = this.fb.group({
      country : ['', [Validators.required]]
    })
  }

  getCountries() {
    this._request.get(environment.backend_url + "get-countries").subscribe((res: any) => {
      if(res && res.length > 0) {
        this.countryList = res;
        this.showLoader = false;
      }
    }, err => {
      console.log(err);
    })
  }

  submit() {
    this.showLoader = true;
    this.showTable = false;
    if(this.currencyForm.valid) {
      this.countryList.map(el => {
        if(el.key && el[el.key]) {
          el[el.key] = ""
        }
      });

      let country = this.currencyForm.get('country').value;
      let params = { base : country}
      this._request.get( environment.exchange_url, params).subscribe((res: any) => {
        if(res && res.base == country && res.rates) {
          for(let key in res.rates) {
            this.countryList.map(el => {
              if(el.key == key) {
                el[key] = res.rates[key];
              }
            })
          }
          this.showTable = true;
          this.showError = false;
          this.showLoader = false;
        }
      })
    } else {
      this.showError = true;
      this.showLoader = false;
    }
  }
}
