// ==========================================
// 1. DATA MANAGEMENT (Local Storage)
// ==========================================
let transactions = JSON.parse(localStorage.getItem('fluid_ledger_txns')) || [];

function saveToLocalStorage() {
    localStorage.setItem('fluid_ledger_txns', JSON.stringify(transactions));
}

// ==========================================
// 2. DATABASE OPERATIONS (CRUD)
// ==========================================
function saveTransaction() {
    const titleInput = document.getElementById("tName");
    const amountInput = document.getElementById("tAmount");
    const typeInput = document.getElementById("tType");

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;

    if (!title || isNaN(amount) || amount <= 0) {
        return alert("Please enter a valid Title and Amount!");
    }

    const newTxn = {
        id: Date.now(), // Generate a unique ID based on timestamp
        title, 
        amount, 
        type, 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    // Nayi transaction ko list ke shuru mein daalo
    transactions.unshift(newTxn);
    saveToLocalStorage();

    titleInput.value = "";
    amountInput.value = "";
    toggleModal(false);
    renderUI();
}

function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    transactions = transactions.filter(txn => txn.id !== id);
    saveToLocalStorage();
    renderUI();
}

function clearAllData() {
    if (confirm("Are you 100% sure? This will delete all your transactions permanently!")) {
        transactions = [];
        localStorage.removeItem('fluid_ledger_txns');
        renderUI();
        alert("All data has been cleared.");
    }
}

// ==========================================
// 3. UI RENDERING & LOGIC
// ==========================================
function toggleModal(show) {
    const modal = document.getElementById("addModal");
    if(modal) modal.style.display = show ? "flex" : "none";
}

function createTransactionHTML(txn) {
    const amountSign = txn.type === "income" ? "+" : "-";
    const amountClass = txn.type === "income" ? "amount-income" : "amount-expense";
    const icon = txn.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up';

    return `
        <div class="transaction-item">
            <div class="transaction-left">
                <div class="transaction-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="transaction-info">
                    <h4>${txn.title}</h4>
                    <p>${txn.date}</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="transaction-amount ${amountClass}">
                    ${amountSign}$${txn.amount.toFixed(2)}
                </div>
                <button onclick="deleteTransaction(${txn.id})" class="delete-btn" title="Delete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `;
}

function updateDashboard() {
    const recentContainer = document.getElementById("recent-transactions");
    if (!recentContainer) return;

    let totalIncome = 0, totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === "income") totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    document.getElementById("totalBalance").innerText = "$" + (totalIncome - totalExpense).toFixed(2);
    document.getElementById("totalIncome").innerText = "$" + totalIncome.toFixed(2);
    document.getElementById("totalExpense").innerText = "$" + totalExpense.toFixed(2);

    if (transactions.length === 0) {
        recentContainer.innerHTML = "<p class='empty-state'>No transactions yet.</p>";
    } else {
        recentContainer.innerHTML = transactions.slice(0, 4).map(createTransactionHTML).join("");
    }
}

window.filterData = function(type, clickedButton) {
    const allContainer = document.getElementById("all-transactions");
    if (!allContainer) return; 

    if (clickedButton) {
        document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
    }

    let filteredTransactions = transactions; 
    if (type !== 'all') {
        filteredTransactions = transactions.filter(txn => txn.type === type);
    }

    if (filteredTransactions.length === 0) {
        allContainer.innerHTML = `<p class='empty-state'>No ${type === 'all' ? '' : type} records found.</p>`;
    } else {
        allContainer.innerHTML = filteredTransactions.map(createTransactionHTML).join("");
    }
}

function renderUI() {
    if (document.getElementById("dashboard-page")) updateDashboard();
    if (document.getElementById("activity-page")) {
        const activeTab = document.querySelector('.filter-tab.active') || document.querySelector('.filter-tab');
        const type = activeTab.innerText.toLowerCase();
        filterData(type, activeTab);
    }
}

// ==========================================
// 4. INITIALIZE APP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    renderUI();
});