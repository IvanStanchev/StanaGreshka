#include <Servo.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BME680.h"
#define ServoPin 10
Adafruit_BME680 bme; 
Servo ServoTap;


void setup() {

  
  Serial.begin(115200);
  if (!bme.begin(0x76)) {
    Serial.println(F("Check wiring!"));
    while (1);
  }

  ServoTap.attach(ServoPin);
  ServoTap.write(0);

  bme.setTemperatureOversampling(BME680_OS_8X);
  bme.setHumidityOversampling(BME680_OS_2X);
  bme.setPressureOversampling(BME680_OS_4X);
  bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
  bme.setGasHeater(320, 150); 
}

void loop() {
  String json = "";

  if (!bme.endReading()) {
    Serial.println(F("Failed to complete reading"));
    return;
  }
 
  json += "{";
  json += "temperature: ";
  json += bme.temperature;
  
  
  json += "pressure:";
  json += bme.pressure / 100.0;
 

  json += "humidity: ";
  json += bme.humidity;

  json += "gas: ";
  json += bme.gas_resistance / 1000.0;

  json += "}";

  Serial.println(json);
  delay(2000);
  
  String serverResponse = Serial.readString();  
  serverResponse.trim();

  if (serverResponse == "alarm") {
    ServoTap.write(90);
  } 

  if(serverResponse == "extinguished"){
    ServoTap.write(0);
  }
}