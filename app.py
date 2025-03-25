from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import paho.mqtt.publish as publish
import paho.mqtt.client as mqtt
import os

app = Flask(__name__)
CORS(app)  # Allows frontend requests

# PostgreSQL Database Configuration (Replace with your Render DB details)
DB_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_NJr1KkC0TfLu@ep-empty-wave-a10w92mn-pooler.ap-southeast-1.aws.neon.tech/HomeAutomation?sslmode=require")

# MQTT Configuration
MQTT_BROKER = "broker.hivemq.com"
MQTT_TOPIC_LIGHT = "home/light"
MQTT_TOPIC_FAN = "home/fan"
MQTT_TOPIC_TEMPERATURE = "home/temperature"
MQTT_TOPIC_HUMIDITY = "home/humidity"

# MQTT Client for Receiving Messages
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)  # Use latest API version
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.subscribe([(MQTT_TOPIC_TEMPERATURE, 0), (MQTT_TOPIC_HUMIDITY, 0)])

sensor_data = {"temperature": 0, "humidity": 0}

def on_message(client, userdata, msg):
    topic = msg.topic
    value = msg.payload.decode()
    if topic == MQTT_TOPIC_TEMPERATURE:
        sensor_data["temperature"] = value
    elif topic == MQTT_TOPIC_HUMIDITY:
        sensor_data["humidity"] = value

mqtt_client.on_message = on_message
mqtt_client.loop_start()

# Database Connection
def connect_db():
    return psycopg2.connect(DB_URL, sslmode="require")

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/control/light', methods=['POST'])
def control_light():
    data = request.json
    state = data.get("state")  # "on" or "off"
    
    publish.single(MQTT_TOPIC_LIGHT, state, hostname=MQTT_BROKER)
    
    return jsonify({"message": f"Light turned {state}"}), 200

@app.route('/control/fan', methods=['POST'])
def control_fan():
    data = request.json
    speed = data.get("speed")  # 0-100
    
    publish.single(MQTT_TOPIC_FAN, speed, hostname=MQTT_BROKER)
    
    return jsonify({"message": f"Fan speed set to {speed}%"}), 200

@app.route('/sensor-data', methods=['GET'])
def get_sensor_data():
    return jsonify(sensor_data), 200

@app.route('/set-rule', methods=['POST'])
def set_automation_rule():
    data = request.json
    condition = data.get("if")  # Example: "temperature > 30"
    action = data.get("then")   # Example: "turn on fan"

    temp = float(sensor_data["temperature"])
    if condition == "temperature > 30" and temp > 30:
        publish.single(MQTT_TOPIC_FAN, "on", hostname=MQTT_BROKER)
        return jsonify({"message": "Automation rule triggered: Fan turned ON"}), 200

    return jsonify({"message": "Rule saved but not triggered"}), 200

if __name__ == '__main__':
    app.run(debug=True)