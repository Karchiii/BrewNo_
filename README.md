# Allgemein

Das Projekt **brewno** beinhaltet eine Webanwendung zur Darstellung und Steuerung einer Bier-Brauanlage.
Arduino-Mikrocontroller automatisieren die Überwachung und Steuerung der dafür notwendigen Prozesse und liefern
von der Webanwendung grafisch darzustellende Informationen (s. https://projectbase.medien.hs-duesseldorf.de/isave/brewno-arduino).

In diesem Branch befindet sich das Projekt auf dem Stand des SoSe 2023.

## Oberfläche

Zur Realisierung und Darstellung der einzelnen Seiten der Anwendung wird das CMS KeystoneJS verwendet.

- https://keystonejs.com/

## Kommunikation

Zur Kommunikation zwischen Webservice und Mikrocontroller wird das MQTT-Protokoll verwendet. Dieses setzt als zentrale
Kommunikationsstelle einen Broker voraus, welcher für alle Teilnehmer im Netzwerk erreichbar sein muss.

- https://mqtt.org/
- https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/
- https://mqttx.app/

## Persistenz

Zur Persistierung von Daten wird MongoDB verwendet.

- https://www.mongodb.com/community

# Software

## Benötigte Umgebungen & Programme

* Node.js v16
* npm v8
* Eclipse Mosquitto v2
* mqtt-cli v4 (optional; zu Debugzwecken) 

## Webanwendung

### Installation der Node-Dependencies

Wenn alle genannten Programme installiert sind, müssen die benötigten Node-Module installiert werden. \
```
npm install --force
```

### Build-Prozess der Webinhalte

Um eine Anzeige der Webanwendung zu ermöglichen müssen die Web-Resourcen aus dem **frontend** Ordner compiliert werden.
Diese werden in den **public** Ordner geschrieben. \
```
npm run build
```

### Konfiguration

Die Webanwendung benötigt eine **.env**-Datei. Diese beinhaltet globale Parameter. Ein Template ist in der **.env-sample** Datei zu finden.
Die **.env**-Datei benötigt zumindest einen Parameter *COOKIE_SECRET*. Dieser kann beim ersten Einrichten des Projekts in einer Entwicklungsumgebung
auf einen beliebigen numerischen Wert gesetzt werden.

### Starten

Zunächst müssen die MongoDB-Instanz sowie mosquitto gestartet werden.
Anschließened kann mittels \
```
node keystone
```
die Webanwendung gestartet werden.



## MQTT 
pub -t brewery/1/status -m '{"time_stamp":"12:45:27","date_stamp":"10.05.2026","measure_interval":60,"temperature_top_1":22,"temperature_top_2":12,"temperature_bottom_1":10}'

Die Steuerseite veröffentlicht Befehle für die Solltemperaturen und Aktoren auf diesen Topics (Brew-ID `1`):

```text
brewery/1/temperature/top/target/set
brewery/1/temperature/bottom/target/set
brewery/1/heater/top_1/set
brewery/1/heater/top_2/set
brewery/1/heater/bottom_1/set
brewery/1/pump/set
brewery/1/mixer/set
```

Die Temperatur-Topics enthalten eine Zahl; die Aktor-Topics enthalten `on` oder `off`. Das Arduino veröffentlicht den Zustand der drei Heizungen als `heater_top_1`, `heater_top_2` und `heater_bottom_1` im Status-JSON.
