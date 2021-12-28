#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ArduinoJson.h>

#include "config.h"

WiFiMulti wifiMulti;

void run_on_request_error()
{
    Serial.println("request fail! :\\");
}

void run_on_sucess()
{
    Serial.println("sucess! :)");
    digitalWrite(16, HIGH);
    delay(100);
    digitalWrite(16, LOW);
}

void run_on_error()
{
    Serial.println("error! :/");
}

void setClock()
{
    configTime(0, 0, "pool.ntp.org");

    Serial.print(F("Waiting for NTP time sync: "));
    time_t nowSecs = time(nullptr);
    while (nowSecs < 8 * 3600 * 2)
    {
        delay(500);
        Serial.print(F("."));
        yield();
        nowSecs = time(nullptr);
    }

    Serial.println();
    struct tm timeinfo;
    gmtime_r(&nowSecs, &timeinfo);
    Serial.print(F("Current time: "));
    Serial.print(asctime(&timeinfo));
}

class MyCallbacks : public BLECharacteristicCallbacks
{
private:
    String url = SERVER_URL;

public:
    void onWrite(BLECharacteristic *pCharacteristic)
    {
        std::string token = pCharacteristic->getValue();
        WiFiClientSecure *client;

        if (token.length() > 0)
        {
            for (int i = 0; i < token.length(); i++)
                if (!(isalnum(token[i]) || token[i] == '-'))
                    return run_on_request_error();

            while (wifiMulti.run() != WL_CONNECTED)
                delay(100);

            HTTPClient http;
            if (IS_HTTPS)
            {
                client = new WiFiClientSecure;
                if (!client)
                    return run_on_request_error();

                client->setCACert(HTTPS_CERTIFICATE);
                http.begin(*client, url + token.c_str());
            }
            else
                http.begin(url + token.c_str());
            http.addHeader("Authorization", DEVICE_ID);

            if (http.GET() != HTTP_CODE_OK)
                return run_on_request_error();

            String payload = http.getString();
            http.end();
            delete client;

            DynamicJsonDocument doc(128);

            if (deserializeJson(doc, payload.c_str()))
                return run_on_request_error();

            if (doc["error"].as<bool>())
                return run_on_error();

            return run_on_sucess();
        }
    }
};

void setup()
{
    Serial.begin(115200);

    wifiMulti.addAP(SSID_PARAMS_1);
    wifiMulti.addAP(SSID_PARAMS_2);

    Serial.print("Waiting for WiFi to connect...");
    while ((wifiMulti.run() != WL_CONNECTED))
    {
        Serial.print(".");
    }
    Serial.println(" connected");

    setClock();

    BLEDevice::init("GATE-IOT");
    BLEServer *pServer = BLEDevice::createServer();

    BLEService *pService = pServer->createService(SERVICE_UUID);

    BLECharacteristic *pCharacteristic = pService->createCharacteristic(TOKEN_UUID, BLECharacteristic::PROPERTY_WRITE);
    pCharacteristic->setCallbacks(new MyCallbacks());
    pService->start();

    BLEAdvertising *pAdvertising = pServer->getAdvertising();
    pAdvertising->start();
}

void loop() { delay(1000); }
