function splitTable(selector, columnNumber) {
    document.addEventListener("DOMContentLoaded", function () {
        const tableHTML = document.querySelector(selector);
        let groupValues = {};
         
        Array.from(tableHTML.getElementsByTagName("tr")).forEach(function (row, index) {
            if (index !== 0) { // Skip the header row
                const groupName = row.getElementsByTagName('td')[columnNumber].textContent;
                if (!groupValues[groupName]) {
                    groupValues[groupName] = [];
                }
                groupValues[groupName].push(row);
            }
        });
         
        var mainContent = document.getElementById("main-content");
        const titleText = document.getElementById("title-text").outerText;
         
        for (const groupName in groupValues) {
            const header = document.createElement('h2');
            header.textContent = groupName;
            var newId = "id-" + titleText + "-" + groupName;
            header.id = newId.replaceAll(" ", "");
            mainContent.insertAdjacentElement("beforeEnd", header);
             
            const newTable = document.createElement('table');
            newTable.classList.add("confluenceTable");
            newTable.appendChild(tableHTML.rows[0].cloneNode(true)); // Clone the header row
             
            groupValues[groupName].forEach(function (row) {
                newTable.appendChild(row.cloneNode(true));
            });
             
            mainContent.insertAdjacentElement("beforeEnd", newTable);
        }
    });
}