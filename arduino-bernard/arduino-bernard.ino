
#include <CurieBLE.h>

BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)
BLEService ledService("19B10000-E8F2-537E-4F6C-D104768A1214"); // BLE LED Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEUnsignedCharCharacteristic switchCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);

const int photoPin = 0;
int photoVal;

unsigned long previousMillis = 0;

const int pinArray[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}; // Light array
int percent = 1; // Progress of the lights

void setup() {
  Serial.begin(9600);

  pinMode(photoPin, INPUT);

  for (int i = 0; i < 10; i++) {
    pinMode(pinArray[i], OUTPUT);

    if(i <= percent) {
      digitalWrite(pinArray[i], HIGH);
    } else {
      digitalWrite(pinArray[i], LOW);
    }
  }

  // BLUETOOTH

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
      Serial.println(photoVal);


      unsigned long currentMillis = millis();
      
      if (photoVal < 20 && currentMillis - previousMillis >= 1000) {
        previousMillis = currentMillis;

        switchCharacteristic.setValue(1);  // and update the heart rate measurement characteristic
        percent++;
        Serial.println(percent);

      } else {
        switchCharacteristic.setValue(0);
      }

      // Loop through LEDs
      for (int i = 0; i < 10; i++) {
        if(i <= percent) {
          digitalWrite(pinArray[i], HIGH);
        } else {
          digitalWrite(pinArray[i], LOW);
        }
        
      }
    }

    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}

