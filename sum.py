import time
import paho.mqtt.client as mqtt
MQTT_BROKER = "b612f0d055f64ead8e43886e51117e83.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "test11"
MQTT_PASSWORD = "Password1111"



def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
    else:
        print(f"❌ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"📩 Received message: {msg.topic} → {msg.payload.decode()}")

mqtt_client = mqtt.Client()
mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

print("🔄 Connecting...")
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

mqtt_client.loop_start()  # Keep listening for messages

