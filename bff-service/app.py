import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DAL_URL = os.getenv("DAL_URL", "http://dal:8001")

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    try:
        response = requests.get(f"{DAL_URL}/tasks/")
        response.raise_for_status()
        tasks = response.json()
        # Optional: Format date strings if needed, for now just pass through
        return jsonify(tasks), response.status_code
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 503

@app.route("/api/tasks", methods=["POST"])
def create_task():
    try:
        data = request.json
        response = requests.post(f"{DAL_URL}/tasks/", json=data)
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 503

@app.route("/api/tasks/<int:task_id>/complete", methods=["PATCH"])
def complete_task(task_id):
    try:
        # Specific endpoint to mark as complete, calls DAL generic patch
        response = requests.patch(f"{DAL_URL}/tasks/{task_id}", json={"is_completed": True})
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 503

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
