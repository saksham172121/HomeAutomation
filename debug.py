from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Allow requests from frontend (5500) with all methods and headers
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.route('/sensor-data')
def get_sensor_data():
    return jsonify({"message": "Sensor data fetched successfully"})

@app.route('/sensor-history')
def get_sensor_history():
    return jsonify({"message": "Sensor history fetched successfully"})

# Handle OPTIONS request for preflight
@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200

if __name__ == '__main__':
    app.run(debug=True)