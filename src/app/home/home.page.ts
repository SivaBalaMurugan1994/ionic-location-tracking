import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BatteryStatus } from '@ionic-native/battery-status/ngx';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = [];
  lngValue: any;
  latValue: any;
  latlngValue = [
    { lngValue: '', latValue: '', batLevel: '' }
  ];
  subscription: any;
  batteryLevel: any;

  constructor(public navCtrl: NavController,
    private batteryStatus: BatteryStatus,
    private geolocation: Geolocation, public platform: Platform) {
    platform.ready().then(() => {
      this.initMap();
    });
  }

  initMap() {
    this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
      console.log('getCurrentPosition', resp);
      let mylocation = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      console.log('mylocation', mylocation);
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 15,
        center: mylocation
      });
      console.log('this.map', this.map);
    });
    let watch = this.geolocation.watchPosition();
    console.log('watch', watch);
    watch.subscribe((data) => {
      console.log(data, 'data');
      var res = data;
      this.latValue = res['coords'].latitude;
      this.lngValue = res['coords'].longitude;
      this.subscription = this.batteryStatus.onChange().subscribe(status => {
        console.log("Level: " + status.level + " Is plugged: " + status.isPlugged);
        this.batteryLevel = status.level;
      });
      var latlng = {
        lngValue: this.latValue,
        latValue: this.lngValue,
        batLevel: this.batteryLevel,
        time: this.getTime()
      };
      this.latlngValue.push(latlng);
      this.deleteMarkers();
      let updatelocation = new google.maps.LatLng(res['coords'].latitude, res['coords'].longitude);
      let image = '../../assets/imgs/favicon2.png';
      // let image = 'http://localhost:8000/assets/imgs/favicon.png';
      // let image = 'https://drive.google.com/file/d/1_Tw1PgELMzRCw9BM1yGMmBCxI1II_vcH/view?usp=sharing';
      this.addMarker(updatelocation, image);
      this.setMapOnAll(this.map);
    });
  }

  getTime() {
    var date = new Date;
    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var hour = date.getHours();
    return hour + ':' + minutes + ':' + seconds
  }

  onBatteryStatus() {
    this.subscription = this.batteryStatus.onChange().subscribe(status => {
      alert("Level: " + status.level + " Is plugged: " + status.isPlugged);
    });
  }

  addMarker(location, image) {
    let marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: image
    });
    this.markers.push(marker);
  }

  setMapOnAll(map) {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

  clearMarkers() {
    this.setMapOnAll(null);
  }

  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }

}
