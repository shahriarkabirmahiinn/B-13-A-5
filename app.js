// Get necessary HTML elements
const loginPage = document.getElementById("login-page");
const mainPage = document.getElementById("main-page");
const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");
const pageTransitionLoader = document.getElementById("page-transition-loader");

const issueContainer = document.getElementById("issue-container");
const loadingSpinner = document.getElementById("loading-spinner");
const totalIssuesText = document.getElementById("total-issues");

// Global variable to hold data
let allIssuesData = [];

// === Login System ===
loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let userVal = document.getElementById("username").value;
    let passVal = document.getElementById("password").value;

    if (userVal === "admin" && passVal === "admin123") {
        
        pageTransitionLoader.classList.remove("hidden");
        
        setTimeout(function() {
            pageTransitionLoader.classList.add("hidden"); 
            loginPage.classList.add("hidden");            
            mainPage.classList.remove("hidden");          
            
            fetchIssuesFromAPI(); // Fetch the real API data
        }, 800);

    } else {
        errorMsg.classList.remove("hidden");
    }
});

// === Fetch Real Data from API & Modify Titles/Labels for UI ===
async function fetchIssuesFromAPI() {
    loadingSpinner.classList.remove("hidden");
    issueContainer.innerHTML = ""; 

    try {
        let response = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
        let data = await response.json();
        let apiIssues = data.data || data || []; 

        // Map through the REAL API data and override exactly what you asked for
        let modifiedIssues = apiIssues.map((issue, index) => {
            
            // Default labels for all cards
            let customLabels = ["bug", "help wanted"];
            
            // 6th card (index 5) gets only "ENHANCEMENT"
            if (index === 5) {
                customLabels = ["enhancement"];
            }

            return {
                ...issue, // Keep actual ID, status, priority, author from API
                title: "Fix Navigation Menu On Mobile Devices",
                description: "The navigation menu doesn't collapse properly on mobile devices. Need to fix the responsive behavior.",
                labels: customLabels
            };
        });

        allIssuesData = modifiedIssues; 
        displayIssues(allIssuesData);
    } catch (error) {
        console.log("Error finding issues:", error);
    }

    loadingSpinner.classList.add("hidden");
}

// === Display Cards on Screen ===
function displayIssues(issuesArray) {
    issueContainer.innerHTML = ""; 
    totalIssuesText.innerText = issuesArray.length; 

    issuesArray.forEach(function(issue) {
        
        // 1. Logic for Open/Closed status styling
        let isClosed = false;
        if(issue.status && issue.status.toLowerCase() === "closed") {
            isClosed = true;
        }

        let borderColorClass = isClosed ? "border-brand-purple" : "border-brand-green";
        let iconColorClass = isClosed ? "brand-purple" : "brand-green";
        
        // 2. Logic for Priority styling
        let priorityText = issue.priority ? issue.priority.toUpperCase() : "LOW";
        let priorityStyle = "text-gray-500 bg-gray-100"; // default
        if (priorityText === "HIGH") {
            priorityStyle = "text-red-500 bg-red-50";
        } else if (priorityText === "MEDIUM") {
            priorityStyle = "text-orange-500 bg-orange-50";
        }

        // 3. Logic for Labels styling
        let labelsHtml = "";
        if (issue.labels && Array.isArray(issue.labels)) {
            issue.labels.forEach(function(label) {
                let labelStyle = "border-gray-200 text-gray-600"; // default
                let labelText = label.toUpperCase();
                
                if (labelText.includes("BUG")) {
                    labelStyle = "border-red-200 text-red-500";
                } else if (labelText.includes("HELP WANTED")) {
                    labelStyle = "border-orange-200 text-orange-500";
                } else if (labelText.includes("ENHANCEMENT")) {
                    labelStyle = "border-green-200 text-green-500";
                }

                labelsHtml += `<span class="border rounded-full px-2 py-0.5 text-[10px] font-bold ${labelStyle}">${labelText}</span>`;
            });
        }

        // 4. Date format
        let issueDate = issue.createdAt || issue.date;
        let formattedDate = issueDate ? new Date(issueDate).toLocaleDateString() : "Unknown Date";

        // Creating the HTML Card
        let cardHTML = `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-t-4 ${borderColorClass} flex flex-col cursor-pointer hover:shadow-md transition-shadow" onclick="showIssueDetails('${issue._id || issue.id}')">
                
                <div class="flex justify-between items-start mb-3">
                    <div class="${iconColorClass}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5A.5.5 0 0 1 8 4z"/></svg>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityStyle}">${priorityText}</span>
                </div>
                
                <h3 class="font-bold text-sm text-gray-800 mb-2 line-clamp-2">${issue.title}</h3>
                <p class="text-xs text-gray-500 mb-4 line-clamp-2">${issue.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${labelsHtml}
                </div>
                
                <div class="mt-auto"></div>

                <div class="border-t pt-2 mt-2">
                    <p class="text-[11px] text-gray-400 mb-1">#${(issue._id || "000").substring(0,5)} by ${issue.author || "Unknown"}</p>
                    <p class="text-[11px] text-gray-400">${formattedDate}</p>
                </div>
            </div>
        `;

        issueContainer.innerHTML += cardHTML;
    });
}

// === Filter Tabs (All, Open, Closed) ===
function filterIssues(category) {
    const tabs = ["all", "open", "closed"];
    tabs.forEach(tab => {
        let btn = document.getElementById("tab-" + tab);
        btn.classList.remove("bg-brand-purple", "text-white");
        btn.classList.add("bg-white", "text-gray-600", "border-gray-200");
    });

    let activeTab = document.getElementById("tab-" + category.toLowerCase());
    activeTab.classList.remove("bg-white", "text-gray-600", "border-gray-200");
    activeTab.classList.add("bg-brand-purple", "text-white", "border-none");

    issueContainer.innerHTML = "";
    loadingSpinner.classList.remove("hidden");

    setTimeout(function() {
        if (category === "All") {
            displayIssues(allIssuesData);
        } else {
            let filteredData = allIssuesData.filter(function(issue) {
                return issue.status && issue.status.toLowerCase() === category.toLowerCase();
            });
            displayIssues(filteredData);
        }
        loadingSpinner.classList.add("hidden");
    }, 500); 
}

// === Search Functionality ===
document.getElementById("search-box").addEventListener("input", async function(event) {
    let searchText = event.target.value.trim();
    
    if (searchText !== "") {
        try {
            let response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`);
            let searchResult = await response.json();
            let apiSearchData = searchResult.data || searchResult || [];
            
            // Format search results with the same UI overrides
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
            
            displayIssues(modifiedSearchData);
        } catch (error) {
            console.log("Search error:", error);
        }
    } else {
        displayIssues(allIssuesData); 
    }
});

// === Show Modal Details ===
async function showIssueDetails(id) {
    let modal = document.getElementById("issue-modal");
    modal.showModal();

    document.getElementById("modal-desc").innerText = "Loading data...";
    document.getElementById("modal-labels").innerHTML = "";

    try {
        // Fetch real data from API for the specific issue
        let res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        let singleData = await res.json();
        let issue = singleData.data || singleData;

        // Set Texts from API Data
        document.getElementById("modal-title").innerText = issue.title || "Fix broken image uploads";
        document.getElementById("modal-desc").innerText = issue.description || "No description provided.";
        document.getElementById("modal-author").innerText = issue.author || "Fahim Ahmed";
        document.getElementById("modal-assignee").innerText = issue.assignee || "Fahim Ahmed";
        
        let priorityText = (issue.priority || "HIGH").toUpperCase();
        document.getElementById("modal-priority").innerText = priorityText;

        // Date format
        let issueDate = issue.createdAt || issue.date;
        document.getElementById("modal-date").innerText = issueDate ? new Date(issueDate).toLocaleDateString('en-GB') : "22/02/2026";

        // Status badge format (Opened / Closed)
        let statusBadge = document.getElementById("modal-status");
        let statusText = issue.status ? issue.status.toLowerCase() : "open";
        
        if(statusText === "open" || statusText === "opened") {
            statusBadge.innerText = "Opened";
            statusBadge.className = "px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#00A86B]"; // Green
        } else {
            statusBadge.innerText = "Closed";
            statusBadge.className = "px-3 py-1 rounded-full text-xs font-semibold text-white bg-brand-purple"; // Purple
        }

        // Labels mapping with matching SVGs for the Modal
        let labelsHtml = "";
        let labelsArray = issue.labels && Array.isArray(issue.labels) ? issue.labels : ["bug", "help wanted"];
        
        labelsArray.forEach(function(label) {
            let labelUpper = label.toUpperCase();
            
            if (labelUpper.includes("BUG")) {
                labelsHtml += `
                <span class="flex items-center gap-1.5 border border-red-200 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[11px] font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="16" height="14" x="4" y="8" rx="4"/><path d="M12 16v-6"/><path d="M8 12h8"/></svg>
                    BUG
                </span>`;
            } else if (labelUpper.includes("HELP WANTED")) {
                labelsHtml += `
                <span class="flex items-center gap-1.5 border border-yellow-300 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-[11px] font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    HELP WANTED
                </span>`;
            } else if (labelUpper.includes("ENHANCEMENT")) {
                labelsHtml += `
                <span class="flex items-center gap-1.5 border border-green-200 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[11px] font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    ENHANCEMENT
                </span>`;
            }
        });
        
        document.getElementById("modal-labels").innerHTML = labelsHtml;

    } catch (error) {
        console.log("Error loading modal data", error);
        document.getElementById("modal-desc").innerText = "Failed to load details!";
    }
}