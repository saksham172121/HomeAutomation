from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow all origins (for development)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/rules', methods=['POST'])
def add_rule():
    data = request.json
    print("Received data:", data)  # Debugging
    return jsonify({"message": "Rule added successfully"}), 200