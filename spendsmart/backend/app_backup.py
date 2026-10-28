from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

expenses = []

@app.route("/")
def home():
    return jsonify({"message": "SpendSmart backend is running!"})

@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    return jsonify(expenses)

@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Expense data required"}), 400

    expense = {
        "id": len(expenses) + 1,
        "title": data.get("title", ""),
        "amount": data.get("amount", 0),
        "category": data.get("category", "Other")
    }

    expenses.append(expense)
    return jsonify(expense), 201

if __name__ == "__main__":
    app.run(debug=True)
    