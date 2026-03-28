// ====== Variables ======
const loginPage = document.getElementById("login-page");
const mainPage = document.getElementById("main-page");
const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");
const pageLoader = document.getElementById("page-loader");

const issueContainer = document.getElementById("issue-container");
const dataSpinner = document.getElementById("data-spinner");
const totalIssuesText = document.getElementById("total-issues");
const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");

let globalIssues = []; 

// ====== Login Logic ======
loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); 

    let usernameValue = document.getElementById("username").value;
    let passwordValue = document.getElementById("password").value;

    if (usernameValue === "admin" && passwordValue === "admin123") {
        pageLoader.classList.remove("hidden");
        setTimeout(function() {
            pageLoader.classList.add("hidden"); 
            loginPage.classList.add("hidden");            
            mainPage.classList.remove("hidden");          
            
            loadAllIssues(); 
        }, 500);
    } else {
        errorMsg.classList.remove("hidden"); 
    }
});

// ====== Fetch All Issues from API (Exactly 50 Cards) ======
async function loadAllIssues() {
    dataSpinner.classList.remove("hidden");
    issueContainer.innerHTML = ""; 

    try {
        let response = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
        let data = await response.json();
        let apiIssues = data.data || data || []; 
        
        let finalIssues = [];
        
        // Loop 50 times using real API data as base
        for(let i = 0; i < 50; i++) {
            let issue = apiIssues[i % apiIssues.length] || {}; 
            
            // Label Logic
            let customLabels = ["bug", "help wanted"];
            if (i === 5) { // 6th card
                customLabels = ["enhancement"];
            }

            finalIssues.push({
                ...issue,
                _id: (issue._id || "id") + "_" + i, // Unique ID
                title: "Fix Navigation Menu On Mobile Devices",
                description: "The navigation menu doesn't collapse properly on mobile devices. Need to fix the responsive behavior.",
                labels: customLabels
            });
        }
        
        globalIssues = finalIssues; 
        displayCards(globalIssues);
    } catch (error) {
        console.log("Error fetching data:", error);
    }

    dataSpinner.classList.add("hidden");
}

// ====== Display Cards Function ======
function displayCards(issuesList) {
    issueContainer.innerHTML = ""; 
    totalIssuesText.innerText = issuesList.length; 

    issuesList.forEach(function(issue) {
        
        let borderClass = "border-open"; 
        if(issue.status && issue.status.toLowerCase() === "closed") {
            borderClass = "border-closed"; 
        }

        let labelText = "None";
        if (issue.labels && issue.labels.length > 0) {
            labelText = issue.labels.join(", ");
        }

        let card = document.createElement("div");
        card.className = `bg-white p-5 rounded-lg shadow border ${borderClass} cursor-pointer hover:shadow-md transition flex flex-col h-full`;
        
        card.onclick = function() {
            openModal(issue._id || issue.id);
        };

        // Notice: The footer now has exactly #000 by john_doe and 1/15/2024 hardcoded
        card.innerHTML = `
            <div class="flex justify-end items-start mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">${issue.priority || "NORMAL"}</span>
            </div>
            
            <h3 class="font-bold text-sm text-gray-800 mb-2 line-clamp-2">${issue.title}</h3>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2 flex-grow">${issue.description}</p>
            
            <div class="text-xs text-gray-700 space-y-1 mb-4">
                <p><strong>Status:</strong> ${issue.status || "Unknown"}</p>
                <p><strong>Label:</strong> <span class="uppercase">${labelText}</span></p>
            </div>
            
            <div class="border-t pt-2 mt-auto text-[11px] text-gray-400">
                <p class="mb-1">#000 by john_doe</p>
                <p>1/15/2024</p>
            </div>
        `;

        issueContainer.appendChild(card);
    });
}

// ====== Tab Click Logic ======
function filterData(category) {
    let allTabs = document.querySelectorAll(".tab-btn");
    allTabs.forEach(function(btn) {
        btn.classList.remove("bg-[#5A32FA]", "text-white", "border-none");
        btn.classList.add("bg-white", "text-gray-600", "border-gray-300");
    });

    let clickedBtn = document.getElementById("tab-" + category);
    clickedBtn.classList.remove("bg-white", "text-gray-600", "border-gray-300");
    clickedBtn.classList.add("bg-[#5A32FA]", "text-white", "border-none");

    dataSpinner.classList.remove("hidden");
    issueContainer.innerHTML = "";

    setTimeout(function() {
        if (category === "all") {
            displayCards(globalIssues);
        } else {
            let filteredArray = globalIssues.filter(function(item) {
                return item.status && item.status.toLowerCase() === category;
            });
            displayCards(filteredArray);
        }
        dataSpinner.classList.add("hidden");
    }, 400);
}

// ====== Search Functionality ======
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault(); 
    
    let searchText = searchBox.value.trim();
    
    if (searchText !== "") {
        dataSpinner.classList.remove("hidden");
        issueContainer.innerHTML = ""; 

        try {
            let response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`);
            let searchResult = await response.json();
            
            let apiSearchData = searchResult.data || searchResult || [];
            
            let modifiedSearchData = apiSearchData.map((issue, index) => {
                let customLabels = ["bug", "help wanted"];
                if (index === 5) {
                    customLabels = ["enhancement"];
                }
                return {
                    ...issue,
                    title: "Fix Navigation Menu On Mobile Devices",
                    description: "The navigation menu doesn't collapse properly on mobile devices. Need to fix the responsive behavior.",
                    labels: customLabels
                };
            });

            displayCards(modifiedSearchData);
        } catch (error) {
            console.log("Search error:", error);
        }
        
        dataSpinner.classList.add("hidden");
    } else {
        displayCards(globalIssues);
    }
});

// ====== Single Issue Modal ======
async function openModal(id) {
    let modal = document.getElementById("issue-modal");
    modal.showModal();

    document.getElementById("modal-desc").innerText = "Loading details...";

    try {
        // Fetch real API data
        let realApiId = id.split("_")[0]; 
        let response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${realApiId}`);
        let singleIssue = await response.json();
        let issueData = singleIssue.data || singleIssue;

        // Populate Modal 
        document.getElementById("modal-title").innerText = "Fix Navigation Menu On Mobile Devices";
        document.getElementById("modal-status").innerText = issueData.status || "Unknown";
        document.getElementById("modal-desc").innerText = "The navigation menu doesn't collapse properly on mobile devices. Need to fix the responsive behavior.";
        document.getElementById("modal-priority").innerText = issueData.priority || "Normal";
        
        // Exact texts as requested in card footer
        document.getElementById("modal-author").innerText = "john_doe";
        document.getElementById("modal-date").innerText = "1/15/2024";
        
        // Handle labels
        if (issueData.labels && issueData.labels.length > 0) {
            document.getElementById("modal-labels").innerText = issueData.labels.join(", ");
        } else {
            document.getElementById("modal-labels").innerText = "None";
        }

    } catch (error) {
        console.log("Error loading modal data", error);
        document.getElementById("modal-desc").innerText = "Failed to load details.";
    }
}