#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ArduinoJson.h>

#include "config.h"

WiFiMulti wifiMulti;

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
    delay(100);
}

class MyCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *pCharacteristic)
    {
        std::string token = pCharacteristic->getValue();

        if (token.length() > 0)
        {
            for (int i = 0; i < token.length(); i++)
                if (!(isalnum(token[i]) || token[i] == '-'))
                    return run_on_error();

            while (wifiMulti.run() != WL_CONNECTED)
                delay(100);

            std::string url = SERVER_URL;
            url.append(token);

            HTTPClient http;
            http.begin(url.c_str());
            http.addHeader("Authorization", DEVICE_ID);

            if (http.GET() != HTTP_CODE_OK)
                return run_on_error();

            String payload = http.getString();
            http.end();

            DynamicJsonDocument doc(128);

            if (deserializeJson(doc, payload.c_str()))
                return run_on_error();

            if (doc['error'])
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

    BLEDevice::init("GATE-IOT");
    BLEServer *pServer = BLEDevice::createServer();

    BLEService *pService = pServer->createService(SERVICE_UUID);

    BLECharacteristic *pCharacteristic = pService->createCharacteristic(TOKEN_UUID, BLECharacteristic::PROPERTY_WRITE);
    pCharacteristic->setCallbacks(new MyCallbacks());
    pService->start();

    BLEAdvertising *pAdvertising = pServer->getAdvertising();
    pAdvertising->start();
}

void loop()
{
    wifiMulti.run();
    delay(1000);
}
