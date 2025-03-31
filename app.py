from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector # MySQL connector
import paho.mqtt.publish as publish
import json
import logging
import paho.mqtt.client as mqtt
import threading
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Allows frontend requests
@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

# MySQL Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "home_admin",
    "password": "your_password",
    "database": "home_automation"
}
# MQTT Configuration
MQTT_BROKER = "broker.mqtt.cool"
MQTT_TOPIC_TEMPERATURE = "home/temperature"
MQTT_TOPIC_HUMIDITY = "home/humidity"
MQTT_TOPIC_DEVICE_CONTROL = "home/device/"
MQTT_TOPIC_AC_MODE = "home/ac/mode"
MQTT_TOPIC_AC_FAN = "home/ac/fan"
MQTT_TOPIC_AC_TEMP = "home/ac/temp"
MQTT_TOPIC_AC_POWER = "home/ac/power"

# MQTT Client for Receiving Messages
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)  
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.subscribe([(MQTT_TOPIC_TEMPERATURE, 0), (MQTT_TOPIC_HUMIDITY, 0)])

sensor_data = {"temperature": 0, "humidity": 0}

def on_message(client, userdata, msg):
    topic = msg.topic
    value = msg.payload.decode()
    
    if topic == MQTT_TOPIC_TEMPERATURE:
        sensor_data["temperature"] = float(value)
    elif topic == MQTT_TOPIC_HUMIDITY:
        sensor_data["humidity"] = float(value)
        
    
        
    save_sensor_data(sensor_data["temperature"], sensor_data["humidity"])
    
mqtt_client.on_message = on_message
mqtt_client.loop_start()

# Database Connection Function
def connect_db():
    return mysql.connector.connect(**DB_CONFIG)

# Function to Execute Actions
def trigger_action(action):
    if action.startswith("turn on") or action.startswith("turn off"):
        device = action.split("turn ")[1]  # Extract device name
        state = action.split(" ")[1]
        publish.single(MQTT_TOPIC_DEVICE_CONTROL + device, state, hostname=MQTT_BROKER)
    elif "set ac mode" in action:
        mode = action.split("set ac mode ")[1]
        publish.single(MQTT_TOPIC_AC_MODE, mode, hostname=MQTT_BROKER)
    elif "set ac fan speed" in action:
        speed = action.split("set ac fan speed ")[1]
        publish.single(MQTT_TOPIC_AC_FAN, speed, hostname=MQTT_BROKER)
    elif action == "increase ac temp":
        publish.single(MQTT_TOPIC_AC_TEMP, "up", hostname=MQTT_BROKER)
    elif action == "decrease ac temp":
        publish.single(MQTT_TOPIC_AC_TEMP, "down", hostname=MQTT_BROKER)
    elif action == "power on ac":
        publish.single(MQTT_TOPIC_AC_POWER, "on", hostname=MQTT_BROKER)
    elif action == "power off ac":
        publish.single(MQTT_TOPIC_AC_POWER, "off", hostname=MQTT_BROKER)
        
def save_sensor_data(temperature, humidity):
    """Stores sensor data in the database."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sensor_logs (temperature, humidity) VALUES (%s, %s)", (temperature, humidity))
    conn.commit()
    cursor.close()
    conn.close()

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")  # No hashing for now
    conn = connect_db()
    cursor = conn.cursor()

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    try:
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", 
                       (username, email, password))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409

# 🔵 Login User Endpoint
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    conn = connect_db()
    cursor = conn.cursor()
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Check if user exists
    cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    if user and user[1] == password:  # Checking password directly (not secure)
        status = "SUCCESS"
        message = "Login successful"
    else:
        status = "FAILED"
        message = "Invalid credentials"

    # Log the login attempt
    cursor.execute("INSERT INTO login_logs (user_id, login_time, status) VALUES (%s, %s, %s)",
                   (user[0] if user else None, datetime.now(), status))
    conn.commit()

    if status == "SUCCESS":
        return jsonify({"message": message}), 200
    else:
        return jsonify({"error": message}), 401


# API to Get Sensor Data
@app.route('/sensor-data', methods=['GET'])
def get_sensor_data():
    return jsonify(sensor_data), 200

@app.route('/sensor-history', methods=['GET'])
def get_sensor_history():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT temperature, humidity, timestamp FROM sensor_logs ORDER BY timestamp DESC LIMIT 50;")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data), 200

# API to Control Devices
@app.route('/device/<device_name>', methods=['POST'])
def control_device(device_name):
    data = request.json
    state = data.get("state")  # "on" or "off"

    if state not in ["on", "off"]:
        return jsonify({"error": "Invalid state. Use 'on' or 'off'"}), 400

    # Publish the state change to MQTT without storing it in the database
    topic = f"{MQTT_TOPIC_DEVICE_CONTROL}{device_name}"
    print(topic)
    publish.single(topic, state, hostname=MQTT_BROKER)

    return jsonify({"message": f"{device_name} turned {state}"}), 200

# API to Control AC
@app.route('/ac', methods=['POST'])
def control_ac():
    data = request.json
    mode = data.get("mode")  # "cool", "hot", "fan"
    fan_speed = data.get("fan_speed")  # "low", "medium", "high"
    temperature = data.get("temperature")  # int
    power = data.get("power")  # "on" or "off"

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE ac_control SET mode=%s, fan_speed=%s, temperature=%s, power=%s WHERE id=1",
                   (mode, fan_speed, temperature, power))
    conn.commit()
    
    cursor.close()
    conn.close()

    publish.single(MQTT_TOPIC_AC_MODE, mode, hostname=MQTT_BROKER)
    publish.single(MQTT_TOPIC_AC_FAN, fan_speed, hostname=MQTT_BROKER)
    publish.single(MQTT_TOPIC_AC_TEMP, temperature, hostname=MQTT_BROKER)
    publish.single(MQTT_TOPIC_AC_POWER, power, hostname=MQTT_BROKER)

    return jsonify({"message": f"AC set to {mode} mode, {fan_speed} fan speed, {temperature}°C, power {power}"}), 200

# Handle CORS preflight request
@app.route('/rules', methods=['OPTIONS'])
def rules_options():
    logging.debug("Handling OPTIONS preflight request for /rules")
    response = jsonify({"message": "CORS preflight OK"})
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response, 200


# Fetch all automation rules with corresponding action values
@app.route('/rules', methods=['GET'])
def get_rules():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.id, r.sensor_type, r.condition_type, r.condition_value, r.action_type, 
                   a.toggle_state, a.fan_speed, a.ac_mode, a.temperature, a.power_state
            FROM automation_rules r
            LEFT JOIN action_values a ON r.id = a.rule_id;
        """)
        rules = cursor.fetchall()
        cursor.close()
        conn.close()

        rule_list = [
            {
                "id": row[0],
                "sensor_type": row[1],
                "condition_type": row[2],
                "condition_value": row[3],
                "action_type": row[4],
                "toggle_state": row[5],
                "fan_speed": row[6],
                "ac_mode": row[7],
                "temperature": row[8],
                "power_state": row[9]
            }
            for row in rules
        ]
        return jsonify(rule_list), 200

    except Exception as e:
        logging.error(f"Error fetching rules: {e}")
        return jsonify({"error": "Failed to fetch rules"}), 500

# Add a new automation rule with action values
@app.route('/rules', methods=['POST'])
def add_rule():
    try:
        data = request.json
        print("Received Data:", data)  # Debugging

        # Extract main automation rule fields
        sensor_type = data.get("sensor_type")
        condition_type = data.get("condition_type")
        condition_value = data.get("condition_value")
        action_type = data.get("action_type")

        # Extract action-specific values
        toggle_state = data.get("toggle_state") if action_type == "toggle" else None
        fan_speed = data.get("fan_speed") if action_type == "fan_speed" else None
        ac_mode = data.get("ac_mode") if action_type == "ac_control" else None
        temperature = data.get("temperature") if action_type == "ac_control" else None
        power_state = data.get("power_state") if action_type == "ac_control" else None

        # Validate required fields
        if not all([sensor_type, condition_type, condition_value, action_type]):
            return jsonify({"error": "Missing required fields"}), 400

        conn = connect_db()
        cursor = conn.cursor()

        # Insert into automation_rules
        cursor.execute("""
            INSERT INTO automation_rules (sensor_type, condition_type, condition_value, action_type)
            VALUES (%s, %s, %s, %s)
        """, (sensor_type, condition_type, condition_value, action_type))
        
        rule_id = cursor.lastrowid  # Get the newly inserted rule's ID

        # Insert into action_values if applicable
        if action_type in ['toggle', 'fan_speed', 'ac_control']:
            cursor.execute("""
                INSERT INTO action_values (rule_id, toggle_state, fan_speed, ac_mode, temperature, power_state)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (rule_id, toggle_state, fan_speed, ac_mode, temperature, power_state))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Rule added successfully!", "id": rule_id}), 201

    except Exception as e:
        logging.error(f"Error adding rule: {e}")
        return jsonify({"error": "Failed to add rule", "details": str(e)}), 500

    
@app.route('/rules/<int:rule_id>', methods=['OPTIONS', 'DELETE'])
def delete_rule(rule_id):
    if request.method == 'OPTIONS':  # Handle preflight request
        return _build_cors_prelight_response()

    logging.debug(f"Handling DELETE request for /rules/{rule_id}")

    try:
        conn = connect_db()
        cursor = conn.cursor()
        print(f"Received rule_id for deletion: {rule_id}")

        # Check if rule exists
        cursor.execute("SELECT * FROM automation_rules WHERE id = %s", (rule_id,))
        rule = cursor.fetchone()
        if not rule:
            return _build_cors_response(jsonify({"error": "Rule not found"}), 404)

        # Delete from automation_rule_actions first (to maintain foreign key integrity)
        cursor.execute("DELETE FROM action_values WHERE rule_id = %s", (rule_id,))

        # Delete from automation_rules
        cursor.execute("DELETE FROM automation_rules WHERE id = %s", (rule_id,))
        

        conn.commit()
        return _build_cors_response(jsonify({"success": True, "message": "Rule deleted successfully"}), 200)

    except Exception as e:
        logging.error(f"Error deleting rule: {e}")
        return _build_cors_response(jsonify({"error": "Failed to delete rule", "details": str(e)}), 500)

    finally:
        conn.commit()
        cursor.close()
        conn.close()

@app.route('/favorites', methods=['GET'])
def get_favorites():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT rule_id FROM favorite_rules;")
        favorite_rule_ids = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        return jsonify(favorite_rule_ids), 200  # Return only the favorite rule IDs

    except Exception as e:
        logging.error(f"Error fetching favorites: {e}")
        return jsonify({"error": "Failed to fetch favorite rules"}), 500
    
    
@app.route('/favorites/<int:rule_id>', methods=['POST'])
def add_favorite(rule_id):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Check how many favorites exist
        cursor.execute("SELECT COUNT(*) FROM favorite_rules")
        count = cursor.fetchone()[0]

        if count >= 4:
            return jsonify({"error": "Maximum of 4 favorite rules allowed"}), 400

        # Insert the favorite rule
        cursor.execute("INSERT IGNORE INTO favorite_rules (rule_id) VALUES (%s)", (rule_id,))
        cursor.execute("UPDATE automation_rules SET is_favorite = 1 WHERE id = %s",(rule_id,))
        conn.commit()

        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Rule marked as favorite"}), 200

    except Exception as e:
        logging.error(f"Error adding favorite: {e}")
        return jsonify({"error": "Failed to add favorite", "details": str(e)}), 500

@app.route('/favorites/<int:rule_id>', methods=['DELETE'])
def remove_favorite(rule_id):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM favorite_rules WHERE rule_id = %s", (rule_id,))
        cursor.execute("UPDATE automation_rules SET is_favorite = 0 WHERE id = %s",(rule_id,))
        conn.commit()

        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Favorite rule removed"}), 200

    except Exception as e:
        logging.error(f"Error removing favorite: {e}")
        return jsonify({"error": "Failed to remove favorite"}), 500

@app.route('/favorites/descriptions', methods=['GET'])
def get_favorite_descriptions():
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT ar.id, ar.sensor_type, ar.condition_type, ar.condition_value, ar.action_type,
                   av.toggle_state, av.fan_speed, av.ac_mode, av.temperature, av.power_state
            FROM automation_rules ar
            LEFT JOIN action_values av ON ar.id = av.rule_id
            WHERE ar.is_favorite = 1
            LIMIT 4;
        """)
        favorites = cursor.fetchall()
        print(favorites)
        cursor.close()
        conn.close()

        def format_description(rule):
            """Generate a readable description for the rule."""
            action_desc = ""
            if rule["action_type"] == "ac_control":
                parts = []
                if rule["temperature"]:
                    parts.append(f"Temperature to {rule['temperature']}°C")
                if rule["ac_mode"]:
                    parts.append(f"Mode: {rule['ac_mode']}")
                if rule["power_state"]:
                    parts.append(f"Power: {rule['power_state']}")
                action_desc = f"Set AC {', '.join(parts)}"
            elif rule["action_type"] == "fan_speed":
                action_desc = f"Set fan speed to {rule['fan_speed']}"
            elif rule["action_type"] == "toggle":
                action_desc = f"Turn {rule['toggle_state']}"
            
            return f"If {rule['sensor_type']} is {rule['condition_type']} than {rule['condition_value']}, {action_desc}"

        formatted_favorites = [{"id": rule["id"], "description": format_description(rule)} for rule in favorites]

        return jsonify(formatted_favorites), 200

    except Exception as e:
        logging.error(f"Error fetching favorite descriptions: {e}")
        return jsonify({"error": "Failed to fetch favorite descriptions"}), 500


# Get all rooms
from flask import jsonify

@app.route('/rooms', methods=['GET'])
def get_rooms():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM rooms")
    rooms = cursor.fetchall()

    # Convert list of tuples into list of dictionaries
    rooms_json = [{"id": room[0], "name": room[1]} for room in rooms]

    cursor.close()
    conn.close()

    return jsonify(rooms_json)  # Returns proper JSON format

# Add a new room
@app.route('/rooms', methods=['POST'])
def add_room():
    data = request.json
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO rooms (name) VALUES (%s)", (data['name'],))
    conn.commit()
    return jsonify({"message": "Room added"}), 201

# Update a room
@app.route('/rooms/<int:room_id>', methods=['PUT'])
def update_room(room_id):
    data = request.json
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE rooms SET name = %s WHERE id = %s", (data['name'], room_id))
    conn.commit()
    return jsonify({"message": "Room updated"})

# Delete a room
@app.route('/rooms/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM devices WHERE room_id = %s", (room_id,))
    cursor.execute("DELETE FROM rooms WHERE id = %s", (room_id,))
    conn.commit()
    return jsonify({"message": "Room deleted"})

# ------------------- DEVICE ROUTES -------------------

# Get devices in a room
@app.route('/rooms/<int:room_id>/devices', methods=['GET'])
def get_devices(room_id):
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)  # Ensures rows are returned as dictionaries
    cursor.execute("SELECT * FROM devices WHERE room_id = %s", (room_id,))
    devices = cursor.fetchall()  # Returns list of dictionaries
    return jsonify(devices)  # Now sends JSON objects

# Add a device to a room
@app.route('/rooms/<int:room_id>/devices', methods=['POST'])
def add_device(room_id):
    data = request.json  # Get JSON data from the frontend

    # Extract device details from request
    name = data.get("name")
    device_type = data.get("type")


    if not name or not device_type:
        return jsonify({"error": "Missing required fields"}), 400

    conn = connect_db()
    cursor = conn.cursor()

    # Insert into database
    cursor.execute("""
        INSERT INTO devices (name, type,room_id)
        VALUES (%s, %s, %s)
    """, (name, device_type, room_id))

    conn.commit()
    new_device_id = cursor.lastrowid  # Get the inserted device ID

    cursor.close()
    conn.close()

    return jsonify({"id": new_device_id, "message": "Device added successfully"}), 201

# Update a device
@app.route('/devices/<int:device_id>', methods=['PUT'])
def update_device(device_id):
    conn = connect_db()
    cursor = conn.cursor()
    data = request.json
    cursor.execute("UPDATE devices SET name = %s, status = %s WHERE id = %s",
                   (data['name'], data['status'], device_id))
    conn.commit()
    return jsonify({"message": "Device updated"})

# Delete a device
@app.route('/devices/<int:device_id>', methods=['DELETE'])
def delete_device(device_id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM devices WHERE id = %s", (device_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Device deleted"})

# Handle OPTIONS request for preflight
@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200


def _build_cors_prelight_response():
    response = jsonify({"message": "CORS preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response, 200

def _build_cors_response(response, status=200):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response, status

if __name__ == '__main__':
    app.run(debug=True)