// include the library code:
#include <Adafruit_Sensor.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <Encoder.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
//#include <Wire.h>
#include <WiFiNINA.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <RTCZero.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <SPI.h>
#include <string>
#include <ArduinoRS485.h>
#include <ArduinoModbus.h>

// Define Pins
#define DRGBR_SW 10  // Definition Pins Drehgeber Druckknopf
#define DRGBR_DT 11  // Definition Pins Drehgeber erster Drehsensor
#define DRGBR_CLK 9  // Definition Pins Drehgeber zweiter Drehsensor

#define Pin_Oben_Heiz_1 0        //Definition der Pinne für die aktoren/sensoren
#define Pin_Oben_Umwaelzpumpe 1  //Zahlen der Pinne sind alle noch komplett FALSCH !!!!!!
#define Pin_Oben_Ruehrwerk 2
#define Pin_Unten_Heiz_1 4
#define Pin_Unten_Heiz_2 4
#define Pin_Oben_Temp_1 6
#define Pin_Oben_Temp_2 7
#define Pin_Unten_Temp_1 8


#define DHTPIN 14      // Auf dem PIN liegt der DHT 22
#define DHTTYPE DHT22  // Typedef DHT 22

#define DS18BUSPIN 15             // Hier liegen die DT18B20 mit Pullup 4.7 k
#define TEMPERATURE_PRECISION 12  // 12 Bits sollen auf dem OneWireBus der DT18B20 gelesen werden

#define BBBLPIN 16

// Globale Variablen
constexpr uint32_t BAUDRATE = 9600;          // infos für den modbus
constexpr uint32_t POLL_INTERVAL_MS = 2000;  // infos für den modbus


int coolingSleepmode = 0;  //sleep mode for cooling part
int boilerSleepmode = 0;   // sleep mode for boiler

int Oben_Heiz_1 = 0;  //status für an aus bei den Bauteilen (1==An 0==Aus)
int Unten_Heiz_2 = 0;
int Unten_Heiz_1 = 0;
int Oben_Umwaelzpumpe = 0;
int Oben_Ruehrwerk = 0;

int schaltOben = 0;  //wenn auf 1 dann wird oben geheitzt, wenn 0 dann wird oben nicht geheitzt(heitzstäbe aus)
int schaltUnten = 0;


static unsigned long letzteRegelung = 0;
static unsigned long letzteSendung = 0;
const float HYSTERESE = 0.5;  // +/- Grad um den Sollwert
int brewId = 1;               //Id des Brauprozesses
float Oben_maxts = 80.0;      //Maxeinstellwert für Oben_Ts
float Oben_mints = -9.9;      //Mineinstellwert für Oben_Ts
float Unten_maxts = 80.0;     //Maxeinstellwert für Unten_Ts
float Unten_mints = -9.9;     //Mineinstellwert für Unten_Ts
float Oben_ts = 25.0;         //Solltemperatur Oben
float Unten_ts = 25.0;        //Solltemperatur Unten
float Oben_Temp_1 = 0;        //Temp 1 Oben
float Oben_Temp_2 = 0;        //Temp 2 Oben
float Unten_Temp_1 = 0;       //Temp 1 Unten
float tibuff = 16.5;          //Puffer bei Falschwertlesen
float tr;                     //Raumtemperatur
float hr;                     //Luftfeuchtigkeit
boolean DRGBR_PRSSD = false;  //Interupt Boolean of Drehgeber Knopf gedrück ist

int number_DT18Devices;          //Zählt die DT18B20er auf dem Bus
float time_int_Tmeasure = 30;    //Messinterval in s nicht zu klein wählen da sonst Bubbles übersehen werden während man gerade misst  - kein Multitasking
long time_for_Tmeasure;          //Variable die hochgezählt wird wann T gemessen werden soll
long messIntervall = 30000;      //Eingabe in Millisekunden
float time_int_reconnect = 600;  //Intervall für MQTT Reconnect in s
long time_for_reconnect;

char state[5] = "None";

unsigned long zeit;
unsigned long zeitVergangen = 0;

int numberOfTries = 0;  //Zähler für Verbindungsversuche
int maxTries = 3;       //Maximale Verbindungsversuche

//WLAN Konfiguration
char ssid[] = "ISAVE";         // "DESKTOP-DBBLJ8U 7249";        // Netzwerk WLAN SSID (name) - HSD "ISAVE"
char pass[] = "wiwti5zetxux";  // WLAN WPA Passwort - HSD  "wiwti5zetxux"
int status = WL_IDLE_STATUS;   // WLAN Status
WiFiClient wifiClient;         // WLAN Client

//MQTT Konfiguration
IPAddress broker(10, 40, 72, 58);     //IP Mqtt Broker
PubSubClient mqttClient(wifiClient);  //Mqtt Ardunio Client

//Realtime Clock
RTCZero rtc;
unsigned long epoch;  //Zur Überprüfung eines validen Zeitstempels
const int GMT = 2;
char startTime[9];
char startDate[11];
char timeStamp[9];
char dateStamp[11];

// Initialize the library with the numbers of the interface pins and required settings
Adafruit_SH1106G lcd = Adafruit_SH1106G(128, 64, &Wire, -1);
//LiquidCrystal_I2C lcd(0x27, 20, 4);      // Hier wird das Display benannt (Adresse/Zeichen pro Zeile/Anzahl Zeilen). In unserem Fall „lcd“. Die Adresse des I²C Displays kann je nach Modul variieren.
Encoder myEncoder(DRGBR_DT, DRGBR_CLK);  // An dieser Stelle wird ein neues Encoder Projekt erstellt. Dabei wird die Verbindung über die zuvor definierten Varibalen (DT und CLK) hergestellt.
OneWire oneWire(DS18BUSPIN);             // Onepin BUS für DS18S20 einrichten
DallasTemperature sensors(&oneWire);     // Bindung der Sensoren an den OneWire Bus
DeviceAddress tempDeviceAddress;         // Verzeichniss zum Speichern von Sensor Adressen
DHT dht(DHTPIN, DHTTYPE);                // Raumluftsensor


// Initialize the hardware und setze Display auf
void setup() {
  Serial.begin(9600);  // Falls man da mal was ausgeben mag Serielle Schnittstelle initiieren

  pinMode(DRGBR_SW, INPUT_PULLUP);                                       // Hier wird der Interrupt installiert.
  attachInterrupt(digitalPinToInterrupt(DRGBR_SW), Interrupt, FALLING);  // Sobald sich der Status (CHANGE) des Interrupt Pins (DRGBR_SW = D2) ändern, soll der Interrupt Befehl (onInterrupt)ausgeführt werden.
                                                                         //pinMode(BBBLPIN, INPUT);
                                                                         //pinMode(Pin_Oben_Heiz_1, OUTPUT);
                                                                         //pinMode(Pin_Oben_Heiz_2, OUTPUT);
                                                                         //pinMode(Pin_Unten_Heiz_1, OUTPUT);
  // pinMode(Pin_Oben_Umwaelzpumpe, OUTPUT);
  //pinMode(Pin_Oben_Ruehrwerk, OUTPUT);

  //pinMode(Pin_Oben_Temp_1, INPUT);
  //pinMode(Pin_Oben_Temp_2, INPUT);
  // pinMode(Pin_Unten_Temp_1, INPUT);

  pinMode(0, OUTPUT);
  pinMode(1, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(20, OUTPUT);
  pinMode(21, OUTPUT);

  lcd_init(Oben_ts);

  for (int i = 0; i < number_DT18Devices; i++) {
    if (sensors.getAddress(tempDeviceAddress, i)) {
      sensors.setResolution(tempDeviceAddress, TEMPERATURE_PRECISION);
      //         lcd.setCursor(0, 2);
      //         lcd.print("Sensor ");
      //         lcd.print(i);
      //         lcd.print(" hat Prec.");
      //         lcd.print(sensors.getResolution(tempDeviceAddress), DEC);
      //         delay(1000);
      //         lcd.setCursor(0, 2);
      //         lcd.print("                    ");
      // lcd_print("Sensor " + String(i) + " hat Prec." + String(sensors.getResolution(tempDeviceAddress)));
    }
  }
  //dht.begin();

  time_for_Tmeasure = millis() + 1000 * time_int_Tmeasure;
  //messIntervall = messIntervall*60*1000;  //Umrechnung in ms

  Serial.begin(115200);  //anfang setup für modbus

  unsigned long startTime = millis();
  while (!Serial && millis() - startTime < 3000) {
  }

  Serial.println("Opta + 2x N4DSB03 startet");

  if (!ModbusRTUClient.begin(BAUDRATE, SERIAL_8N1)) {
    Serial.println("Modbus konnte nicht gestartet werden");

    while (true) {
      delay(1000);
    }
  }

  // Wichtig für Opta RS-485
  RS485.setDelays(0, 1200);

  ModbusRTUClient.setTimeout(1000);  //

  Serial.println("Modbus gestartet");  //ende setup für modbus    //

  // WLAN/MQTT Verbindungsaufbau, RTC Initialisierung
  initConnections();
}

// Verbindungsaufbau WLAN/MQTT, Init RTC
void initConnections() {
  if (WiFi.status() == WL_NO_MODULE) {
    // lcd.setCursor(0, 2);
    //lcd.print("WLAN Error!");
    Serial.print("Error");
    //lcd.setCursor(0, 2);
    // lcd.print("                    ");
    delay(2000);
  } else {
    String fv = WiFi.firmwareVersion();

    if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
      // lcd.setCursor(0, 2);
      // lcd.print("WLAN FW Outdated!");
      delay(2000);
      //lcd.setCursor(0, 2);
      // lcd.print("                    ");
    }

    while (status != WL_CONNECTED && numberOfTries < maxTries) {
      //lcd.setCursor(0, 2);
      //lcd.print("WLAN Connect(");
      // lcd.print(numberOfTries);
      // lcd.print(")...");


      numberOfTries = numberOfTries + 1;

      status = WiFi.begin(ssid, pass);

      delay(10000);
      // lcd.setCursor(0, 2);
      // lcd.print("                    ");
    }

    if (status == WL_CONNECTED) {

      numberOfTries = 0;

      // lcd.setCursor(0, 2);
      // lcd.print("WLAN Connected!");
      Serial.print("wlan Connected");
      delay(2000);
      //lcd.setCursor(0, 2);
      // lcd.print("                    ");

      //Verbindungsaufbau MQTT Broker
      // lcd.setCursor(0, 2);
      // lcd.print("MQTT Connect...");

      mqttClient.setServer(broker, 1883);

      if (mqttClient.connect("ArduinoClient")) {   //Verbindungsaufbau zum Broker
        mqttClient.setCallback(subscribeReceive);  //Event Handler/Callback Funktion zuweisen

        Serial.println(mqttClient.subscribe("#") ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("top_ts", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("bottom_ts", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("heater_top_1", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("heater_bottom_1", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("heater_bottom_2", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("pump", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("mixer", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("temperature_top_1", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("temperature_top_2", 1) ? "ok" : "FEHLER");
        Serial.println(mqttClient.subscribe("heater_bottom_2", 1) ? "ok" : "FEHLER");


        // lcd.setCursor(0, 2);
        // lcd.print("MQTT Connected!");
        Serial.print("Mqtt Connected");
        // delay(2000);
        // lcd.setCursor(0, 2);
        // lcd.print("                    ");
      } else {
        // lcd.setCursor(0, 2);
        //  lcd.print("MQTT Failed!");
        Serial.print("MQTT Failed");
        Serial.print(mqttClient.state());
        delay(2000);
        //  lcd.setCursor(0, 2);
        //  lcd.print("                    ");
      }

      //RTC für Zeitstempel initialisieren
      rtc.begin();

      do {
        epoch = WiFi.getTime();
        numberOfTries++;
      } while ((epoch == 0) && (numberOfTries < maxTries));

      if (numberOfTries > maxTries) {
        // lcd.setCursor(0, 2);
        // lcd.print("NTP Unreachable!");
        Serial.print("NTP unrechable");
        delay(2000);
        //lcd.setCursor(0, 2);
        //lcd.print("                    ");
      } else {
        numberOfTries = 0;

        rtc.setEpoch(epoch);

        sprintf(startTime, "%02d:%02d:%02d", rtc.getHours() + GMT, rtc.getMinutes(), rtc.getSeconds());
        sprintf(startDate, "%02d.%02d.%02d", rtc.getDay(), rtc.getMonth(), rtc.getYear());

        //lcd.setCursor(0, 2);
        // lcd.print("RTC Initialized!");
        Serial.print("RTC initialized");
        delay(2000);
        // lcd.setCursor(0, 2);
        // lcd.print("                    ");
      }
    } else {
      //lcd.setCursor(0, 2);
      //lcd.print("WLAN Failed!");
      // delay(2000);
      // lcd.setCursor(0, 2);
      //lcd.print("                    ");
    }
  }
}

void Interrupt() {     // Beginn des Interrupts. Wenn der Rotary Knopf betätigt wird, springt das Programm automatisch an diese Stelle. Nachdem...
  DRGBR_PRSSD = true;  //Switch ist gedrückt
}

float getValue(float Value, float Valuestep, float minV, float maxV, int x, int y)  //Funktion die den Drehgeberwert ausliest wenn Knopf gedrückt wurde und wieder bestätigt wird
{
  long altePosition = 0;  // Definition der "alten" Position (Diese fiktive alte Position wird benötigt, damit die aktuelle Position später im seriellen Monitor nur dann angezeigt wird, wenn wir den Rotary Head bewegen)
  long neuePosition = 0;

  while (DRGBR_PRSSD == false) {
    neuePosition = myEncoder.read();   // Die "neue" Position des Encoders wird definiert. Dabei wird die aktuelle Position des Encoders über die Variable.Befehl() ausgelesen.
    if (neuePosition != altePosition)  // Sollte die neue Position ungleich der alten (-999) sein (und nur dann!!)...
    {
      if (altePosition < neuePosition) {
        Value = Value + Valuestep;
      }
      if (altePosition > neuePosition) {
        Value = Value - Valuestep;
      }
      if (Value > maxV) {
        Value = maxV;
      }
      if (Value < minV) {
        Value = minV;
      }
      altePosition = neuePosition;

      lcd_print_row_line(24, 8, String(Value, 2));
    }
  }
  DRGBR_PRSSD = false;
  return (Value);
}



void updateTimeStamp() {
  sprintf(timeStamp, "%02d:%02d:%02d", rtc.getHours() + GMT, rtc.getMinutes(), rtc.getSeconds());
  sprintf(dateStamp, "%02d.%02d.%02d", rtc.getDay(), rtc.getMonth(), rtc.getYear());
}

void sendMqtt(const char* topic) {

  DynamicJsonDocument JSONencoder(1024);

  updateTimeStamp();

  JsonDocument doc;

  JSONencoder["measure_interval"] = messIntervall;
  JSONencoder["time_stamp"] = timeStamp;
  JSONencoder["date_stamp"] = dateStamp;
  JSONencoder["temperature_top_1"] = Oben_Temp_1;
  JSONencoder["temperature_top_2"] = Oben_Temp_2;
  JSONencoder["temperature_bottom_1"] = Unten_Temp_1;
  JSONencoder["heater_top_1"] = Oben_Heiz_1;
  JSONencoder["heater_bottom_1"] = Unten_Heiz_1;
  JSONencoder["heater_bottom_2"] = Unten_Heiz_2;
  JSONencoder["pump"] = Oben_Umwaelzpumpe;
  JSONencoder["mixer"] = Oben_Ruehrwerk;

  char JSONmessageBuffer[300];
  mqttClient.setBufferSize(512);

  serializeJson(JSONencoder, JSONmessageBuffer);

  mqttClient.publish(topic, JSONmessageBuffer);
  Serial.print("Mqtt message sent");
}

void subscribeReceive(char* topic, byte* payload, unsigned int length) {

  Serial.print("Nachricht auf: ");
  Serial.println(topic);

  if (strcmp(topic, "top_ts") == 0) {  // SollTemperatur für oben erhalten
    String s = String((char*)payload);
    float f = s.toFloat();

    Oben_ts = f;
    lcd.setCursor(14, 0);
    lcd.print(Oben_ts, 1);

    Serial.println("Nachricht bekommen temperature_top: ");
    Serial.print(f);
  }

  if (strcmp(topic, "bottom_ts") == 0) {  // SollTemperatur für unten erhalten
    String s = String((char*)payload);
    float f = s.toFloat();

    Unten_ts = f;
    lcd.setCursor(14, 0);
    lcd.print(Unten_ts, 1);

    Serial.println("Nachricht bekommen temperature_bottom: ");
    Serial.print(f);
  }

  if (strcmp(topic, "heater_top_1") == 0) {  // Heizer im Oberen kessel ein oder auschalten empfangen
    String s = String((char*)payload);
    int i = s.toInt();

    Oben_Heiz_1 = i;
    lcd.setCursor(14, 0);
    lcd.print(Oben_Heiz_1, 1);

    Serial.println("Nachricht bekommen heater_top: ");
    Serial.print(i);
  }

  if (strcmp(topic, "heater_bottom_1") == 0) {  // Heizer im Unteren kessel ein oder auschalten empfangen
    String s = String((char*)payload);
    int i = s.toInt();

    Unten_Heiz_1 = i;
    Unten_Heiz_2 = i;
    lcd.setCursor(14, 0);
    lcd.print(Oben_Heiz_1, 1);

    Serial.println("Nachricht bekommen heater_bottom: ");
    Serial.print(i);
  }

  if (strcmp(topic, "pump") == 0) {  // Umwälzpumpe ein oder auschalten empfangen
    String s = String((char*)payload);
    int i = s.toInt();

    Oben_Umwaelzpumpe = i;
    lcd.setCursor(14, 0);
    lcd.print(Oben_Umwaelzpumpe, 1);

    Serial.println("Nachricht bekommen pump: ");
    Serial.print(i);
  }

  if (strcmp(topic, "mixer") == 0) {  // Rührwerk ein oder auschalten empfangen
    String s = String((char*)payload);
    int i = s.toInt();

    Oben_Ruehrwerk = i;
    lcd.setCursor(14, 0);
    lcd.print(Oben_Ruehrwerk, 1);

    Serial.println("Nachricht bekommen mixer: ");
    Serial.print(i);
  }
}

void lcd_init(const float& target_temperature) {

  delay(250);             // Delay for OLED bootup
  lcd.begin(0x3c, true);  // Sets up the link and displays a splash screen
  lcd.display();          // display function has to be called everytime something is drawn/written
  delay(2000);            // Duration of the splash screen, value chosen arbitrarily

  lcd.clearDisplay();

  lcd.setTextSize(1);                            // Argument works as a multiplier (e.g. 1 = standard size, 2 = double size)
  lcd.setTextColor(SH110X_WHITE, SH110X_BLACK);  // Monochrome OLED Display

  // Columns and Rows on the OLED don't work the same way they did on the old display, going 8 rows down is equivalent to going one row down on the old display
  // The same goes for the columns, multiply by a factor of 8 (This value has been determined through trial and error, and as such may not be ideal)
  lcd.setCursor(0, 0);
  lcd.print("Ti:         ");
  lcd.print("C");

  lcd.setCursor(0, 8);
  lcd.print("Ts:         ");
  lcd.print("C");
  lcd.setCursor(24, 8);
  lcd.print(target_temperature, 1);

  lcd.setCursor(0, 16);
  lcd.print("Tr:         ");
  lcd.print("C");

  lcd.setCursor(0, 24);
  lcd.print("Avg Bubbles:     ");

  lcd.setCursor(0, 32);
  lcd.print("Total Bubbles:");
  lcd.setCursor(88, 32);
  lcd.print("0.00");

  lcd.display();
}

void lcd_print(String text) {
  if (sizeof(text) > 20) { text = "Err.: Too much text"; }
  lcd.setCursor(0, 48);
  lcd.print("                    ");
  lcd.setCursor(0, 48);
  lcd.print(text);
  lcd.display();
  /*
  delay(2000);
  lcd.setCursor(0, 2);
  lcd.print("                    ");
  */
}

void lcd_print_row_line(const int row, const int line, String text) {
  if (sizeof(text) > 20) { text = "Err.: Too much text"; }
  lcd.setCursor(row, line);
  lcd.print(text);
  lcd.display();
}

void lcd_clear() {
  lcd.clearDisplay();
}

int zweipunkt(float ist, float soll, int zustandAlt) {
  if (soll <= 0.0) return 0;             // kein Sollwert -> aus
  if (ist < soll - HYSTERESE) return 1;  // zu kalt -> an
  if (ist > soll + HYSTERESE) return 0;  // zu warm -> aus
  return zustandAlt;                     // im Fenster -> nichts aendern
}

void temperaturRegeln() {

  readModule(1);  //auslesen der zwei oberen temperatur sensoren
  readModule(2);  // auslesen des unteren Temperatur sensors

  if (Oben_Heiz_1 == 1)  //steuerung der beiden Oberen Heizer
  {
    float Oben_Ist = (Oben_Temp_1 + Oben_Temp_2) / 2.0;
    schaltOben = zweipunkt(Oben_Ist, Oben_ts, schaltOben);


    if (Oben_Temp_1 > Oben_maxts || Oben_Temp_2 > Oben_maxts) {
      schaltOben = 0;
      schaltOben = 0;
    }

    digitalWrite(Pin_Oben_Heiz_1, schaltOben);

    digitalWrite(7, schaltOben);  //tei der testumgebung
    digitalWrite(6, schaltOben * -1);
  }

  if (Unten_Heiz_1 && Unten_Heiz_2 == 1)  //steuerung des Unteren Heizers
  {
    schaltUnten = zweipunkt(Unten_Temp_1, Unten_ts, schaltUnten);
    if (Unten_Temp_1 > Unten_maxts) schaltUnten = 0;

    digitalWrite(Pin_Unten_Heiz_1, schaltUnten);
    digitalWrite(Pin_Unten_Heiz_2, schaltUnten);

    digitalWrite(20, schaltUnten);  //teil der testumgebung
    digitalWrite(21, schaltUnten * -1);
  }
}

bool readModule(uint8_t id) {
  bool ok = ModbusRTUClient.requestFrom(
    id,
    HOLDING_REGISTERS,
    0x0000,
    2);

  if (!ok) {
    // Serial.print("Modul ID ");
    // Serial.print(id);
    // Serial.print(" Fehler: ");
    // Serial.println(ModbusRTUClient.lastError());
    return false;
  }

  if (ModbusRTUClient.available() < 2) {
    // Serial.print("Modul ID ");
    // Serial.print(id);
    // Serial.println(": zu wenige Daten");
    return false;
  }

  uint16_t rawD1 = static_cast<uint16_t>(ModbusRTUClient.read());
  uint16_t rawD2 = static_cast<uint16_t>(ModbusRTUClient.read());

  // Serial.print("Modul ID ");
  // Serial.println(id);

  if (id == 1) {
    //printTemperature("Sensor 1 / Modul 1 D1", rawD1);
    Oben_Temp_1 = rawD1;
    // printTemperature("Sensor 2 / Modul 1 D2", rawD2);
    Oben_Temp_2 = rawD2;

  } else if (id == 2) {
    //printTemperature("Sensor 3 / Modul 2 D1", rawD1);
    Unten_Temp_1 = rawD1;
    //printTemperature("Sensor 4 / Modul 2 D2", rawD2);
  }

  Serial.println();
  return true;
}

void loop() {
  while (DRGBR_PRSSD == false) {

   mqttClient.loop();

    if (millis() - letzteSendung >= 10000) {  // alle 10 Sekunden sollen einmal die Mqtt daten geschickt werden
      letzteSendung = millis();
      sendMqtt("brewery/1/status");
      Serial.print(mqttClient.state());
    }


    if (millis() - letzteRegelung >= 1000) {  // Jede Sekunde soll einmal die Temperaturregelung ausgeführt werden
      letzteRegelung = millis();
      temperaturRegeln();
    }


    if (Oben_Umwaelzpumpe == 1) digitalWrite(Pin_Oben_Umwaelzpumpe, HIGH);  //steuerung der Umwälzpumpe
    else digitalWrite(Pin_Oben_Umwaelzpumpe, LOW);

    if (Oben_Ruehrwerk == 1) digitalWrite(Pin_Oben_Ruehrwerk, HIGH);  //steuerung des Rührwerks
    else digitalWrite(Pin_Oben_Ruehrwerk, LOW);
  }

  if (DRGBR_PRSSD == true) {
    //lcd.backlight();                          //Hintergrundbeleuchtung einschalten (0 schaltet die Beleuchtung aus)
    DRGBR_PRSSD = false;
    // Oben_ts = getValue(ts, 0.1, mints, maxts, 14, 0);
    //lcd.noBacklight();                        //Hintergrundbeleuchtung ausschalten am besten mit Zeitverzögerung

    //    if(mqttClient.state() == 0){
    //      mqttClient.loop();
    //    }
    //    else{
    //      if (millis() > time_for_reconnect){
    //        WiFi.end();
    //        initConnections();
    //
    //        time_for_reconnect = millis() + 1000 * time_int_reconnect;
    //      }
  }
}
