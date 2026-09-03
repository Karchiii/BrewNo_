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

## MQTT Verbindung Einrichtung

1. Firewall-Einstellungen für Port 1883 ändern mit folgendem Befehl:
   ```
   netsh advfirewall firewall add rule name="Mosquitto MQTT 1883" dir=in action=allow protocol=TCP localport=1883
   ```

2. In der `mosquitto.conf`-Datei (zu finden unter `C:\Program Files\Mosquitto`) folgende zwei Zeilen hinzufügen:
   ```
   listener 1883
   allow_anonymous true
   ```

3. Mosquitto mit folgendem Befehl starten:
   ```
   mosquitto -v -c "C:\Program Files\Mosquitto\mosquitto.conf"
   ```

