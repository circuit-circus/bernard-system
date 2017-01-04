/*
 * Copyright (c) 2016 Intel Corporation.  All rights reserved.
 * See the bottom of this file for the license terms.
 */

#include <CurieBLE.h>

BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)
BLEService ledService("19B10000-E8F2-537E-4F6C-D104768A1214"); // BLE LED Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEUnsignedCharCharacteristic switchCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);

const int ledPin = 13; // pin to use for the LED
const int photoPin = 0;
int photoVal;

long previousMillis = 0;  // last time the heart rate was checked, in ms

void setup() {
  Serial.begin(9600);

  pinMode(ledPin, OUTPUT);
  pinMode(photoPin, INPUT);

  // set advertised local name and service UUID:
  blePeripheral.setLocalName("LED");
  blePeripheral.setAdvertisedServiceUuid(ledService.uuid());

  // add service and characteristic:
  blePeripheral.addAttribute(ledService);
  blePeripheral.addAttribute(switchCharacteristic);

  // set the initial value for the characeristic:
  switchCharacteristic.setValue(0);

  // begin advertising BLE service:
  blePeripheral.begin();

  Serial.println("BLE LED Peripheral");
}

void loop() {
  // listen for BLE peripherals to connect:
  BLECentral central = blePeripheral.central();

  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());

    // while the central is still connected to peripheral:
    while (central.connected()) {
      photoVal = analogRead(photoPin);
      if(photoVal < 900) {
        Serial.println(photoVal);
      }

      if (photoVal < 900) {
        //Serial.println("Sending 1");
        switchCharacteristic.setValue(1);  // and update the heart rate measurement characteristic
      } else {
        //Serial.println("Sending 0");
        switchCharacteristic.setValue(0);
      }
    }

    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}

