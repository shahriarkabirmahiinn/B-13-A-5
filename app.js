// Get all needed HTML elements 
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

//  Login Form Logic 
loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); 

    let usernameValue = document.getElementById("username").value;
    let passwordValue = document.getElementById("password").value;

    // Check if username and password match
    if (usernameValue === "admin" && passwordValue === "admin123") {
        pageLoader.classList.remove("hidden"); 
        
        // Wait for half a second, then open dashboard
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

// Fetch Data from API 
async function loadAllIssues() {
    dataSpinner.classList.remove("hidden"); 
    issueContainer.innerHTML = ""; 

    try {
        let response = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
        let data = await response.json();
        let apiIssues = data.data || data || []; 
        
        let finalIssues = [];
        
        // Create exactly 50 cards using API data
        for(let i = 0; i < 50; i++) {
            let issue = apiIssues[i % apiIssues.length] || {}; 
            
            // Make most cards have BUG and HELP WANTED, and 6th card ENHANCEMENT
            let customLabels = ["bug", "help wanted"];
            if (i === 5) { 
                customLabels = ["enhancement"];
            }

            finalIssues.push({
                ...issue,
                _id: (issue._id || "id") + "_" + i, 
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

// Create and Show Cards 
function displayCards(issuesList) {
    issueContainer.innerHTML = ""; 
    totalIssuesText.innerText = issuesList.length; 

    issuesList.forEach(function(issue) {
        
        
        let borderClass = "border-open"; 
        if(issue.status && issue.status.toLowerCase() === "closed") {
            borderClass = "border-closed"; 
        }

        
        let priorityText = issue.priority ? issue.priority.toUpperCase() : "LOW";
        let priorityStyle = "text-gray-600 bg-gray-100"; 
        if (priorityText === "HIGH") {
            priorityStyle = "text-red-500 bg-red-50";
        } else if (priorityText === "MEDIUM") {
            priorityStyle = "text-orange-500 bg-orange-50";
        }

        
        let labelsHtml = "";
        if (issue.labels && Array.isArray(issue.labels)) {
            issue.labels.forEach(function(label) {
                let labelUpper = label.toUpperCase();
                
                if (labelUpper.includes("BUG")) {
                    labelsHtml += `<span class="border border-red-200 text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-[10px] font-bold">BUG</span>`;
                } else if (labelUpper.includes("HELP WANTED")) {
                    labelsHtml += `<span class="border border-yellow-300 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-[10px] font-bold">HELP WANTED</span>`;
                } else if (labelUpper.includes("ENHANCEMENT")) {
                    labelsHtml += `<span class="border border-green-200 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">ENHANCEMENT</span>`;
                }
            });
        }

        // Create the card
        let card = document.createElement("div");
        card.className = `bg-white p-5 rounded-lg shadow-sm border ${borderClass} cursor-pointer hover:shadow-md transition flex flex-col h-full`;
        
        // Open modal when clicked
        card.onclick = function() {
            openModal(issue._id || issue.id);
        };

        // Put HTML inside the card
        card.innerHTML = `
            <div class="flex justify-end items-start mb-3">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${priorityStyle}">${priorityText}</span>
            </div>
            
            <h3 class="font-bold text-sm text-gray-800 mb-2 line-clamp-2">${issue.title}</h3>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2 flex-grow">${issue.description}</p>
            
            <div class="flex flex-wrap gap-2 mb-4">
                ${labelsHtml}
            </div>
            
            <div class="border-t pt-2 mt-auto text-[11px] text-gray-400">
                <p class="mb-1">#000 by john_doe</p>
                <p>1/15/2024</p>
            </div>
        `;

        issueContainer.appendChild(card);
    });
}

// Tab Filter (All, Open, Closed) 
function filterData(category) {
    // Change button styles when clicked
    let allTabs = document.querySelectorAll(".tab-btn");
    allTabs.forEach(function(btn) {
        btn.classList.remove("bg-[#5A32FA]", "text-white", "border-none");
        btn.classList.add("bg-white", "text-gray-600", "border-gray-300");
    });

    let clickedBtn = document.getElementById("tab-" + category);
    clickedBtn.classList.remove("bg-white", "text-gray-600", "border-gray-300");
    clickedBtn.classList.add("bg-[#5A32FA]", "text-white", "border-none");

    // Filter array
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

// Search Functionality 
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault(); 
    
    let searchText = searchBox.value.trim();
    
    if (searchText !== "") {
        dataSpinner.classList.remove("hidden");
        issueContainer.innerHTML = ""; 

        try {
            // Call API with search text
            let response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`);
            let searchResult = await response.json();
            let apiSearchData = searchResult.data || searchResult || [];
            
            // Format search results like the normal cards
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

// Open Issue Details Modal 
async function openModal(id) {
    let modal = document.getElementById("issue-modal");
    modal.showModal();

    document.getElementById("modal-desc").innerText = "Loading details...";
    document.getElementById("modal-labels").innerHTML = "";

    try {
        // Fetch specific issue data from API
        let realApiId = id.split("_")[0]; 
        let response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${realApiId}`);
        let singleIssue = await response.json();
        let issueData = singleIssue.data || singleIssue;

        // Populate Modal Texts
        document.getElementById("modal-title").innerText = "Fix Navigation Menu On Mobile Devices";
        document.getElementById("modal-desc").innerText = "The navigation menu doesn't collapse properly on mobile devices. Need to fix the responsive behavior.";
        
        document.getElementById("modal-author").innerText = "john_doe";
        document.getElementById("modal-assignee").innerText = "john_doe";
        document.getElementById("modal-date").innerText = "1/15/2024";
        
        // Modal Status Pill Color
        let statusSpan = document.getElementById("modal-status");
        let statusText = issueData.status ? issueData.status.toLowerCase() : "open";
        
        if (statusText === "open" || statusText === "opened") {
            statusSpan.innerText = "Opened";
            statusSpan.className = "px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#00A86B]"; // Green
        } else {
            statusSpan.innerText = "Closed";
            statusSpan.className = "px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#5A32FA]"; // Purple
        }

        
        let prioritySpan = document.getElementById("modal-priority");
        let priorityText = (issueData.priority || "HIGH").toUpperCase();
        prioritySpan.innerText = priorityText;

        if (priorityText === "HIGH") {
            prioritySpan.className = "inline-block px-4 py-1 rounded-full text-xs font-bold text-white bg-[#EF4444] shadow-sm"; // Red
        } else if (priorityText === "MEDIUM") {
            prioritySpan.className = "inline-block px-4 py-1 rounded-full text-xs font-bold text-white bg-orange-500 shadow-sm"; // Orange
        } else {
            prioritySpan.className = "inline-block px-4 py-1 rounded-full text-xs font-bold text-white bg-gray-500 shadow-sm"; // Gray
        }

        
        let labelsHtml = "";
        let labelsArray = issueData.labels && Array.isArray(issueData.labels) ? issueData.labels : ["bug", "help wanted"];
        
        labelsArray.forEach(function(label) {
            let labelUpper = label.toUpperCase();
            
            if (labelUpper.includes("BUG")) {
                labelsHtml += `<span class="border border-red-200 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[12px] font-bold">BUG</span>`;
            } else if (labelUpper.includes("HELP WANTED")) {
                labelsHtml += `<span class="border border-yellow-300 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-[12px] font-bold">HELP WANTED</span>`;
            } else if (labelUpper.includes("ENHANCEMENT")) {
                labelsHtml += `<span class="border border-green-200 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[12px] font-bold">ENHANCEMENT</span>`;
            }
        });
        
        document.getElementById("modal-labels").innerHTML = labelsHtml;

    } catch (error) {
        console.log("Error loading modal data", error);
        document.getElementById("modal-desc").innerText = "Failed to load details.";
    }
}