const BASE_URL = 'https://thinkful-list-api.herokuapp.com/jonny/bookmarks';

const listApiFetch = function (...args) {
    let error;
    return fetch(...args)
        .then(res => {
            if (!res.ok) {
                error = { code: res.status };
                if (!res.headers.get('content-type').includes('json')) {
                    error.message = res.statusText;
                    return Promise.reject(error);
                }
            }
            return res.json();
        })
        .then(data => {
            if (error) {
                error.message = data.message;
                return Promise.reject(error);
            }
            return data;
        });
};

const getBookmarks = function () {
    return listApiFetch(`${BASE_URL}`);
};

const createBookmark = function (bookmark) {

    const newBookmark = JSON.stringify(bookmark);
    return listApiFetch(`${BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: newBookmark
    });
};

const updateBookmark = function (id, updateData) {
    const newData = JSON.stringify(updateData);
    return listApiFetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: newData
    });
};

const deleteBookmark = function (id) {
    return listApiFetch(BASE_URL + '/' + id, {
        method: 'DELETE'
    });
};

export default {
    getBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark
};