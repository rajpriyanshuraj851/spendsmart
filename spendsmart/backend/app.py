from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

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
        "category": data.get("category", "Other"),
        "created_at":
        datetime.now().astimezone().isoformat(timespec="seconds")
    }

    expenses.append(expense)
    return jsonify(expense), 201

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    for expense in expenses:
        if expense["id"] == expense_id:
            expenses.remove(expense)
            return jsonify({"message": "Expense deleted successfully"})

    return jsonify({"error": "Expense not found"}), 404
if __name__ == "__main__":
    app.run(debug=True)
    