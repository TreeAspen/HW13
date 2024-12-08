#include <ArduinoJson.h>

void sendData(int a0Val, int a1Val, int d2Val) {
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");

  data["A0"] = a0Val;
  data["A1"] = a1Val;
  data["D2"] = d2Val;

  String resTxt = "";
  serializeJson(resJson, resTxt);
  Serial.println(resTxt);
}

void setup() {
  Serial.begin(9600);
  while (!Serial) {}

  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  pinMode(2, INPUT); 

void loop() {
  int a0Val = analogRead(A0);
  int a1Val = analogRead(A1);
  int d2Val = digitalRead(2);

  if (Serial.available() > 0) {
    int byteIn = Serial.read();
    if (byteIn == 0xAB) { 
      Serial.flush();
      sendData(a0Val, a1Val, d2Val);
    }
  }

  delay(500);
}
