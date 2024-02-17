function createIdLink(pageTitle, headerText) {
    var id = "id-" + pageTitle + "-" + headerText;
    return id.replace(" ", "");
}

function createHeader(lvl, text, pageTitle) {
    try {
        id = createIdLink(pageTitle, text)
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
            const pageTitle = $("#title-text").text().trim();

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

function addLinkToColumn(link, tableSelector, columnNumber) {
    $(document).ready(function () {
        const sourceTable = $(tableSelector);

        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                pageTitle = html.match(/<title>(.*?) -.*?<\/title>/i)[1];

                sourceTable.find('tr').each(function (index, row) {
                    if (index > 0) {
                        const tdElements = $(row).find('td');
                        if (tdElements.length >= columnNumber) {
                            const cell = $(row).find(`td:eq(${columnNumber - 1})`);
                            const cellText = cell.text();
                            let cellLink = link + '#' + createIdLink(pageTitle, cellText);
                            const linkElement = $('<a></a>').attr('href', cellLink).attr('rel', 'nofollow').text(cellText);
                            cell.empty().append(linkElement);
                        } else {
                            console.log("Not enough <td> elements in the row.");
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error during fetch:', error);
            });
    });
}

// Пример использования функции
const cfLink = "https://confluence.rt.ru/pages/viewpage.action?pageId=668685625";
addLinkToColumn(cfLink, '[data-name="formula_product_set"] > div > table', 5);