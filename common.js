function createHeader(lvl, text, pageTitle) {
    try {
        var id = "id-" + pageTitle + "-" + text;
        id = id.replace(/ /g, "");
        const header = $("<" + lvl + "/>").text(text).attr("id", id);
        return header[0];
    } catch (error) {
        console.log("Error in createHeader function:", error);
    }
}

function createTable(tableHead, arrTableBody) {
    try {
        const table = $("<table>").addClass("confluenceTable");
        table.append(tableHead);
        arrTableBody.forEach(function (row) {
            table.append($(row).clone());
        });
        return table;
    } catch (error) {
        console.log("Error in createTable function:", error);
    }
}

function splitTable(selector, columnNumber) {
    try {
        $(document).ready(function () {
            const sourceTable = $(selector)[0];
            let groupColumnValue = {};

            $(sourceTable).find("tr").each(function (index, row) {
                if (index !== 0) { // Skip the header row
                    const columnValue = $(row).find('td').eq(columnNumber).text();
                    if (!groupColumnValue[columnValue]) {
                        groupColumnValue[columnValue] = [];
                    }
                    groupColumnValue[columnValue].push(row);
                }
            });

            const mainContent = $("#main-content");
            const pageTitle = $("#title-text").text();

            for (const columnValue in groupColumnValue) {
                const header = $(createHeader('h2', columnValue, pageTitle));
                mainContent.append(header);

                const newTable = createTable($(sourceTable).find("tr")[0].cloneNode(true),
                    groupColumnValue[columnValue]);
                mainContent.append(newTable);
            }
        });
    } catch (error) {
        console.log("Error in splitTable function:", error);
    }
}