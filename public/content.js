let result = [];

function getDb() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("whale_db", 1);
        request.onsuccess = function (event) {
            const db = request.result;
            resolve(db);
        };
        request.onerror = function (event) {
            reject(event);
        };
    });
}

function getObjectStore() {
    return new Promise((resolve, reject) => {
        getDb().then((db) => {
            const objectStore = db.transaction("whale_sdk", 'readwrite').objectStore("whale_sdk");
            resolve(objectStore);
        });
    });
}

function getResult() {
    result = []
    return getObjectStore().then((objectStore) => {
        return new Promise((resolve, reject) => {
            objectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                try {
                    const { id, value } = cursor.value
                    result.push({ id, value: JSON.parse(value) });
                    cursor.continue();
                } catch (e) {
                    resolve(result);
                }
            };
        });
    });
}

function clearResult(key) {
    return new Promise((resolve, reject) => {
        getObjectStore().then((objectStore) => {
            const request = objectStore.delete(key)
            request.onsuccess = function (event) {
                // console.log(`${key} 删除成功`)
                resolve(event);
            }
            request.onerror = function (err) {
                // console.log(`${key} 删除失败`)
                reject(err);
            }
        })
    })
}

function init() {
    getResult().then((result) => {
        chrome.runtime.sendMessage(
            {
                type: 'content-query',
                data: result
            }
        );
    })
}

function clear() {
    if (result.length > 0) {
        result.forEach((item) => {
            clearResult(item.id);
        })
    }
}

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        switch (message.type) {
            case "popup-query":
                init();
                sendResponse('查询DB数据');
                break;
            case "popup-delete":
                clear();
                sendResponse('删除DB数据');
                break;
        }
    }
);