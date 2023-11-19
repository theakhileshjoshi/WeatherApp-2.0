import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationDetails } from '../Models/LocationDetails';
import { WeatherDetails } from '../Models/WeatherDetails';
import { TemperatureData } from '../Models/TemperatureData';
import { TodayData } from '../Models/TodayData';
import { WeekData } from '../Models/WeekData';
import { TodaysHighlight } from '../Models/TodaysHighlight';
import { Observable } from 'rxjs';
import { EnvironmentalVariables } from '../Environment/EnvironmentVariables';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  //Variables which will be filled by API Endpoints
  locationDetails?: LocationDetails;
  weatherDetails?: WeatherDetails;

  //Variables that have the extracted data from the API Endpoint Variables
  temperatureData: TemperatureData ;//Left-Container Data
  
  todayData?: TodayData[] = [];//Right-Container Data
  weekData?: WeekData[] = [];//Right-Container Data
  todaysHighlight?:TodaysHighlight;//Right-Container Data

  //variables to be used for API calls
  cityName:string = 'Mumbai';
  language:string = 'en-US';
  date:string = '20200622';
  units:string = 'm';

  //Variable holding current Time;
  currentTime:Date;

  // variables to control tabs
  today:boolean = false;
  week:boolean = true;

  //variables to control metric value
  celsius:boolean = true;
  fahrenheit:boolean = false;


  constructor(private httpClient: HttpClient) {
    this.getData();
  }

  getSummaryImage(summary:string):string{
    //Base folder Address containing the images
    var baseAddress = 'assets/';

    //respective image names
    var cloudySunny = 'cloudyandsunny.png';
    var rainSunny = 'rainyandsunny.png';
    var windy = 'windy.png';
    var sunny = 'sun.png';
    var rainy = 'rainy.png';


    if(String(summary).includes("Partly Cloudy") || String(summary).includes("P Cloudy"))return baseAddress + cloudySunny;
    else if(String(summary).includes("Partly Rainy") || String(summary).includes("P Rainy"))return baseAddress + rainSunny;
    else if(String(summary).includes("wind"))return baseAddress + windy;
    else if(String(summary).includes("rain"))return baseAddress + rainy;
    else if(String(summary).includes("Sun"))return baseAddress + sunny;
    
    return baseAddress + cloudySunny;
  }


  //Method to create a chunk for left container using model TemperatureData
  fillTemperatureDataModel(){
    this.currentTime = new Date();
    this.temperatureData.day = this.weatherDetails['v3-wx-observations-current'].dayOfWeek;
    this.temperatureData.time = `${String(this.currentTime.getHours()).padStart(2,'0')}:${String(this.currentTime.getMinutes()).padStart(2,'0')}`;
    this.temperatureData.temperature = this.weatherDetails['v3-wx-observations-current'].temperature;
    this.temperatureData.location = `${this.locationDetails.location.city[0]},${this.locationDetails.location.country[0]}`;
    this.temperatureData.rainPercent = this.weatherDetails['v3-wx-observations-current'].precip24Hour;
    this.temperatureData.summaryPhrase = this.weatherDetails['v3-wx-observations-current'].wxPhraseShort;
    this.temperatureData.summaryImage = this.getSummaryImage(this.temperatureData.summaryPhrase);
  }

  //Method to create a chunk for right container using model WeekData
  fillWeekData(){
    var weekCount =0;

    while(weekCount < 7){
      this.weekData.push(new WeekData());
      this.weekData[weekCount].day = this.weatherDetails['v3-wx-forecast-daily-15day'].dayOfWeek[weekCount].slice(0,3);
      this.weekData[weekCount].tempMax = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMax[weekCount];
      this.weekData[weekCount].tempMin = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMin[weekCount];
      this.weekData[weekCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-daily-15day'].narrative[weekCount]);
      weekCount++;
    }
  }

  fillTodayData(){
    var todayCount = 0;
    while(todayCount < 7){
      this.todayData.push(new TodayData());
      this.todayData[todayCount].time = this.weatherDetails['v3-wx-forecast-hourly-10day'].validTimeLocal[todayCount].slice(11,16);
      this.todayData[todayCount].temperature = this.weatherDetails['v3-wx-forecast-hourly-10day'].temperature[todayCount];
      this.todayData[todayCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-hourly-10day'].wxPhraseShort[todayCount]);
      todayCount++;
    }
  }

  getTimeFromString(localTime:string){
    return localTime.slice(11,16);
  }
  //Method to get today's highlight data from the base variable
  fillTodaysHighlight(){
    this.todaysHighlight.airQuality = this.weatherDetails['v3-wx-globalAirQuality'].globalairquality.airQualityIndex;
    this.todaysHighlight.humidity = this.weatherDetails['v3-wx-observations-current'].relativeHumidity;
    this.todaysHighlight.sunrise = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunriseTimeLocal);
    this.todaysHighlight.sunset = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunsetTimeLocal);
    this.todaysHighlight.uvIndex = this.weatherDetails['v3-wx-observations-current'].uvIndex;
    this.todaysHighlight.visibility = this.weatherDetails['v3-wx-observations-current'].visibility;
    this.todaysHighlight.windStatus = this.weatherDetails['v3-wx-observations-current'].windSpeed;
  }

  //Method to create useful data chunks for UI using the data received from the API
  prepareData():void{
    //Setting Left Container Data Model Properties
    this.fillTemperatureDataModel();
    this.fillWeekData();
    this.fillTodayData();
    this.fillTodaysHighlight();
    console.log(this.weatherDetails);
    console.log(this.temperatureData);
    console.log(this.weekData);
    console.log(this.todayData);
    console.log(this.todaysHighlight);
  }

  celsiusToFahrenheit(celsius:number):number{
    return +((celsius * 1.8) + 32).toFixed(2);
  }
  fahrenheitToCelsius(fahrenheit:number):number{
    return +((fahrenheit - 32) * 0.555).toFixed(2);
  }

  //Method to get location Details from the API using the variable cityName as the Input.
  getLocationDetails(cityName:string, language:string):Observable<LocationDetails>{
    return this.httpClient.get<LocationDetails>(EnvironmentalVariables.weatherApiLocationBaseURL,{
      headers: new HttpHeaders()
      .set(EnvironmentalVariables.xRapidApiKeyName,EnvironmentalVariables.xRapidApikeyValue)
      .set(EnvironmentalVariables.xRapidApiHostName,EnvironmentalVariables.xRapidApiHostValue),
      params: new HttpParams()
      .set('query',cityName)
      .set('language',language)
    })
  }

  getWeatherReport(date:string, latitude:number,longitude:number,language:string,units:string):Observable<WeatherDetails>{
    return this.httpClient.get<WeatherDetails>(EnvironmentalVariables.weatherApiForecastBaseURL,{
      headers: new HttpHeaders()
      .set(EnvironmentalVariables.xRapidApiKeyName,EnvironmentalVariables.xRapidApikeyValue)
      .set(EnvironmentalVariables.xRapidApiHostName,EnvironmentalVariables.xRapidApiHostValue),
      params: new HttpParams()
      .set('date',date)
      .set('latitude',latitude)
      .set('longitude',longitude)
      .set('language',language)
      .set('units', units)
    });
  }

  getData(){
    this.todayData = [];
    this.weekData = [];    
    this.temperatureData = new TemperatureData();
    this.todaysHighlight = new TodaysHighlight();
    var latitude = 0;
    var longitude = 0;

    this.getLocationDetails(this.cityName,this.language).subscribe({
      next:(response)=>{
        this.locationDetails = response;
        latitude = this.locationDetails?.location.latitude[0];
        longitude = this.locationDetails?.location.longitude[0];

        //Once  we get the values for latitude and logitude we can call for the getWeatherReport method.
        this.getWeatherReport(this.date,latitude,longitude,this.language,this.units).subscribe({
          next:(response)=>{
            this.weatherDetails = response;
            this.prepareData();
          }
        }) 
      }
    });

    



  }

}
