#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#include "config.h"

ESP8266WebServer server(80);
IPAddress apIP(192, 168, 100, 1);

void handleRoot()
{
  if (server.method() != HTTP_POST)
  {
    digitalWrite(LED_BUILTIN, LOW);
    server.send(405, "text/plain", "Method Not Allowed");
    digitalWrite(LED_BUILTIN, HIGH);
    return;
  }

  digitalWrite(LED_BUILTIN, LOW);
  String token;
  for (uint8_t i = 0; i < server.args(); i++)
    if (server.argName(i) == "token")
      token += server.arg(i);

  if (token.length() < 5)
  {
    server.send(200, "application/json", "{\"error\":true,\"code\":3}");
    digitalWrite(LED_BUILTIN, HIGH);
    return;
  }

  while ((WiFi.status() != WL_CONNECTED))
    delay(10);

  WiFiClient client;
  HTTPClient http;

  if (!http.begin(client, HOST URL_DEVICE_PATH + token))
    return;

  http.addHeader("Authorization", AUTHORIZATION);

  if (http.GET() != HTTP_CODE_OK)
    return;

  DynamicJsonDocument doc(64);
  DeserializationError error_json = deserializeJson(doc, http.getString());
  if (error_json)
  {
    http.end();
    server.send(200, "application/json", "{\"error\":true,\"code\":2}");
  }
  else
  {
    bool error = doc["error"].as<bool>();
    http.end();

    if (error)
    {
      server.send(200, "application/json", "{\"error\":true,\"code\":1}");
    }
    else
    {
      digitalWrite(D6, HIGH);
      delay(100);
      digitalWrite(D6, LOW);

      server.send(200, "application/json", "{\"error\":false,\"code\":0}");
    }
  }

  digitalWrite(LED_BUILTIN, HIGH);
}

void setup()
{
  Serial.begin(115200);
  delay(2500);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(D6, OUTPUT);

  digitalWrite(LED_BUILTIN, HIGH);
  digitalWrite(D6, LOW);

  WiFi.mode(WIFI_AP_STA);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP(APSSID);

  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  server.on("/", handleRoot);
  server.begin();
  Serial.println("HTTP server started");

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(STASSID);

  WiFi.begin(STASSID, STAPSK);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() { server.handleClient(); }
