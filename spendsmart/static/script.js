const API_URL = "http://127.0.0.1:5000/api/expenses";

const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expenseList");
const totalSpentElement = document.getElementById("totalSpent");
const moneyLeftElement = document.getElementById("moneyLeft");

const budgetForm = document.getElementById("budgetForm");
const budgetInput = document.getElementById("budgetAmount");
const budgetMessage = document.getElementById("budgetMessage");
const monthlyBudgetElement = document.getElementById("monthly-budget");

let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 5000;

async function loadExpenses() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load expenses");
        }

        const expenses = await response.json();
        displayExpenses(expenses);
    } catch (error) {
        console.error("Backend connection failed:", error);
        alert("Backend connect nahi hua. Check karo Flask server running hai.");
    }
}

function displayExpenses(expenses) {
    expenseList.innerHTML = "";
    let total = 0;

    if (expenses.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No expenses yet. Add your first one!";
        expenseList.appendChild(item);
    }

    expenses.forEach((expense) => {
        total += Number(expense.amount) || 0;

        const details = document.createElement("span");

let dateTimeText = "Date/time unavailable";

if (expense.created_at) {
    const date = new Date(expense.created_at);

    if (!Number.isNaN(date.getTime())) {
        dateTimeText = date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }
}

details.textContent =
    `${expense.title} — ₹${expense.amount} (${expense.category}) | ${dateTimeText}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.style.marginLeft = "12px";
        deleteButton.style.backgroundColor = "#dc3545";
        deleteButton.style.color = "white";
        deleteButton.style.border = "none";
        deleteButton.style.padding = "6px 10px";
        deleteButton.style.borderRadius = "6px";
        deleteButton.style.cursor = "pointer";

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                `Delete "${expense.title}" (₹${expense.amount})?`
            );

            if (!confirmed) return;

            deleteButton.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/${expense.id}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error("Could not delete expense");
                }

                await loadExpenses();
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Expense delete nahi hua. Flask server check karo.");
                deleteButton.disabled = false;
            }
        });

        item.appendChild(details);
        item.appendChild(deleteButton);
        expenseList.appendChild(item);
    });

    totalSpentElement.textContent = `₹${total.toFixed(2)}`;
    updateBudgetDisplay(total);
}

function updateBudgetDisplay(spent) {
    if (monthlyBudgetElement) {
        monthlyBudgetElement.textContent =
            `₹${monthlyBudget.toLocaleString("en-IN")}`;
    }

    if (budgetInput) {
        budgetInput.value = monthlyBudget;
    }

    if (moneyLeftElement) {
        if (spent === undefined) {
            spent = Number(
                totalSpentElement.textContent.replace(/[₹,]/g, "")
            ) || 0;
        }

        moneyLeftElement.textContent =
            `₹${(monthlyBudget - spent).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const expense = {
        title: titleInput.value.trim(),
        amount: Number(amountInput.value),
        category: categoryInput.value
    };

    if (!expense.title || expense.amount <= 0 || !expense.category) {
        alert("Please enter a valid expense.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            throw new Error("Could not save expense");
        }

        form.reset();
        await loadExpenses();
    } catch (error) {
        console.error("Saving failed:", error);
        alert("Expense save nahi hua. Check karo Flask server running hai.");
    }
});

if (budgetForm) {
    budgetForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const newBudget = Number(budgetInput.value);

        if (!Number.isFinite(newBudget) || newBudget <= 0) {
            budgetMessage.textContent = "Please enter a valid budget.";
            return;
        }

        monthlyBudget = newBudget;
        localStorage.setItem("monthlyBudget", String(monthlyBudget));

        updateBudgetDisplay();
        budgetMessage.textContent = "Budget saved successfully! ✅";
    });
}

updateBudgetDisplay();
loadExpenses();