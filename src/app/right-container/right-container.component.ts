import { Component } from '@angular/core';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import { faFaceFrown } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../Services/weather.service';

@Component({
  selector: 'app-right-container',
  templateUrl: './right-container.component.html',
  styleUrls: ['./right-container.component.css']
})
export class RightContainerComponent {

  constructor(public weatherService: WeatherService){};

  //fa icons for tumbs up/down and smile/frown
  faThumbsUp:any = faThumbsUp;
  faThumbsDown:any = faThumbsDown;
  faFaceSmile:any = faFaceSmile;
  faFaceFrown:any = faFaceFrown;

  
  
  //function to control tab values or tab states

  //function for click of tab Today
  onTodayClick(){
    this.weatherService.today = true;
    this.weatherService.week = false;
  }

  //function for click of tab week
  onWeekClick(){
    this.weatherService.week = true;
    this.weatherService.today = false;
  }

  //functions to control metric values

  //function for click of metric celsius
  onCelsiusClick(){
    this.weatherService.celsius = true;
    this.weatherService.fahrenheit = false;
  }

  //function for click of metric Fahrenheit
  onFahrenheitClick(){
    this.weatherService.fahrenheit = true;
    this.weatherService.celsius = false;
  }

}
