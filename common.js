const ID = {
    DB_TB: '664677863',
    API: '671341366',
    ROLE: '674301853',
    FORM: '664677976',
    FT: '664677853',
    BT: '664676998'
}

const SERVER_URL = 'https://confluence.rt.ru'

function createIdLink(pageTitle, headerText) {
    var id = "id-" + pageTitle + "-" + headerText;
    return id.replace(/\s/g, "");
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
        return table[0];
    } catch (error) {
        console.log("Error in createTable function:", error);
    }
}

function splitTable(selector, columnNumber) {
    try {
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

async function getTypeOfPage(pageId) {
    var parentsIds = [];
    await $.get(`${SERVER_URL}/rest/api/content/${pageId}?expand=ancestors`)
        .done(function (data) {
            ancestors = data.ancestors; //поиск родителей
            parentsIds = $.map(ancestors, function (obj) {
                return obj.id;
            });
            parentsIds.reverse();
        })
        .fail(function (error) {
            console.log('Error in function getTypeOfPage: ', error);
        })
    for (const id of parentsIds) {
        for (const type in ID) {
            if (id == ID[type]) {
                return ID[type];
            }
        }
    }
    return NaN;
}

async function getChildPages(pageId) {
    var arr = [];
    await $.get(`${SERVER_URL}/rest/api/content/${pageId}/child/page`)
        .done(function (data) {
            re = /(.*?)\s\((.*?)\)/;
            arr = data.results.map(obj => ({
                name_ru: obj.title.match(re)[1],
                name_en: obj.title.match(re)[2],
                link: obj._links.webui
            }));
        })
        .fail(function (error) {
            console.log('Error in function getDbTbPages: ', error);
        })
    return arr;
}

async function addUsingOnPage(pageType) {
    let dbTbPages = await getChildPages(ID.DB_TB);
    $(document).ready(function () {
        const mainContent = $("#main-content");
        const pageTitle = $("#title-text").text().trim();
        switch (pageType) {
            case ID.API:
                sourceTable = $('#description_table')[0]
                if (sourceTable) {
                    let tbAttr = []; //массив найденных таблиц и атрибутов в них
                    $(sourceTable).find('tr').each(function (index, row) {
                        if (index > 0) { // кроме заголовка
                            cells = $(row).find('td');
                            let re = /(\w*)\.(\w*)/
                            for (let i = 0; i < cells.length; i++) {
                                if ($(cells[i]).text() == 'БД') {
                                    cellText = $(cells[i + 1]).text();
                                    tbAttr.push({
                                        tb: cellText.match(/(\w*)\.(\w*)/)[1],
                                        attr: cellText.match(/(\w*)\.(\w*)/)[2]
                                    });
                                    break;
                                }
                            }
                        }
                    });
                    if (tbAttr.length) {
                        const h3db = $(`#${pageTitle}-Базаданных`.replace(/ /, '').replace(/\//, '\\/'))[0];
                        let tableHead = $("<tr>");
                        tableHead.append($("<td>").text("Таблица"));
                        tableHead.append($("<td>").text("Атрибут"));
                        let tableBody = [];
                        for (row of tbAttr) {
                            let tr = $("<tr>");
                            let link = '';
                            dbTbPages.forEach(function (page) {
                                if (page.name_en == row.tb) {
                                    link = page.link;
                                }
                            })
                            tr.append($("<td>").append($("<a>").attr("href", link).text(row.tb)));
                            tr.append($("<td>").text(row.attr));
                            tableBody.push(tr);
                        };

                        const newTable = createTable(tableHead, tableBody);
                        console.log(tableHead);
                        console.log(tableBody);
                        h3db.after(newTable);
                    }
                }
        }
    })
}

const pageId = $(location).attr('href').match(/.*=(\d*)/)[1];
pageType = "";
(async function () {
    pageType = await getTypeOfPage(pageId);
    if (pageType) {
        addUsingOnPage(pageType);
    }
})();