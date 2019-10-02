import $ from 'jquery';
import bookmark from './bookmark';
import api from './api';

const generateBookmarkElement = function (bookmark) {
    let bookmarkExpandedView = ``;
    let bookmarkTitleCompanion = `<div class="shopping-item">${bookmark.rating}</div>`;
    if (bookmark.expanded) {
        bookmarkTitleCompanion = ``;
        bookmarkExpandedView = `
      <button class="bookmark-item-delete">
          <span class="button-label">Delete</span>
        </button>
      <div class="shopping-item-controls">

        <button class="bookmark-button-url">
          <span class="button-label">Visit Site</span>
          
        </button>
        <div class="bookmark-rating">${bookmark.rating}</div>
        <div>${bookmark.desc}</div>
      </div>
    `;
    }

    return `
    <li class="bookmark-element" data-bookmark-id="${bookmark.id}">
      <div class="bookmark-item">${bookmark.title} ${bookmarkTitleCompanion}</div>
           ${bookmarkExpandedView}   
    </li>`;
};

const generateBookmarksString = function (shoppingList) {
    const items = shoppingList.map((item) => generateBookmarkElement(item))
    return items.join('');
};

const generateError = function (message) {
    return `
      <section class="error-content">
        <button id="cancel-error">X</button>
        <p>${message}</p>
      </section>
    `;
};

const renderError = function () {
    if (bookmark.store.error) {
        const el = generateError(bookmark.store.error);
        $('.error-container').append(el);
    } else {
        $('.error-container').empty();
    }
};

const handleCloseError = function () {
    $('.error-container').on('click', '#cancel-error', () => {
        bookmark.setError(null);
        renderError();
    });
};

const render = function () {
    renderError();
    let form = ``;
    // Filter item list if store prop is true by item.checked === false

    let items = [...bookmark.store.bookmarks];

    if (bookmark.store.adding) {
        form = `<div class="book-mark-entry"><label for="bookmark-entry-title">Title: </label>
        <input type="text" name="bookmark-entry-title" class="bookmark-entry-title" placeholder="Hitch Hikers Guide to the Galaxy"/>
        <label for="bookmark-entry-url">URL: </label>
        <input type="text" name="bookmark-entry-url" class="bookmark-entry-url" placeholder="www..."/>
        <div><label for="bookmark-entry-description">Description: </label>
            <textarea type="text" name="bookmark-entry-description" class="bookmark-entry-description"></textarea></div>
        <div class="bookmark-entry-rating">
            <input type="radio" name="rating" value="1"><i></i>
            <input type="radio" name="rating" value="2"><i></i>
            <input type="radio" name="rating" value="3"><i></i>
            <input type="radio" name="rating" value="4"><i></i>
            <input type="radio" name="rating" value="5"><i></i>
        </div>
        <button class="bookmark-entry-cancel" type="button">Cancel</button>
        <button type="submit">Create</button></div>`

    }
    $('#bookmark-list-form').html(form);
    if (bookmark.store.adding) {
        handleBookmarkCanceled();
    }
    // render the shopping list in the DOM
    const bookmarkListItemsString = generateBookmarksString(items);


    // insert that HTML into the DOM
    $('#bookmark-list-results').html(bookmarkListItemsString);
    if(bookmark.store.bookmarks.find((item) => item.expanded)) {
        handleBookmarkUrl();
    }
};

const handleNewBookmarkSubmit = function () {
    $('#bookmark-list-form').submit(function (event) {
        event.preventDefault();
        const title = $('.bookmark-entry-title').val();
        const url = ($('.bookmark-entry-url').val().includes('https://')) ? $('.bookmark-entry-url').val() : `https://${$('.bookmark-entry-url').val()}`;
        const desc = $('.bookmark-entry-description').val();
        let ratingNode = $('.bookmark-entry-rating').children('input:checked')[0];
        let rating = 0;
        if(ratingNode) {
            rating = (ratingNode.value) ? ratingNode.value : 0;
        }
        console.log(url,title,desc,rating)
        const newBookmark = {title, url, desc, rating};

        $('.bookmark-entry-title').val('');
        $('.bookmark-entry-url').val('');
        $('.bookmark-entry-description').val('');
        checkIfEmpty(title, 'Title');
        checkIfEmpty(url, 'Url');
        checkIfEmpty(desc, 'The Description');
        checkIfEmpty(rating, 'Rating');

        if (title && url && desc && rating !== 0) {
            api.createBookmark(newBookmark)
                .then((newItem) => {
                    bookmark.addItem(newItem);
                    bookmark.toggleAdding();
                    render();
                })
                .catch((err) => {
                    bookmark.setError(err.message);
                    renderError();
                });
        }
    });
};

const checkIfEmpty = (x, str) => {
    if(x === '') {
        bookmark.setError(`${str} is empty.`);
        renderError();
    } else if(x === 0) {
        bookmark.setError(`Select a ${str}`);
        renderError();
    } else if(x.includes('https://') && x.length <= 8) {
        bookmark.setError(`${str} is not formatted correctly`);
        renderError();
    }
};

const getItemIdFromElement = function (item) {
    return $(item)
        .closest('.bookmark-element')
        .data('bookmark-id');
};

const handleDeleteBookmarkClicked = function () {
    $('#bookmark-list-results').on('click', '.bookmark-item-delete', event => {
        const id = getItemIdFromElement(event.currentTarget);
        api.deleteBookmark(id)
            .then(() => {
                bookmark.findAndDelete(id);
                render();
            })
            .catch((err) => {
                console.log(err);
                bookmark.store.setError(err.message);
                renderError();
            });
    });
};

// const handleEditShoppingItemSubmit = function () {
//     $('.js-shopping-list').on('submit', '.js-edit-item', event => {
//         event.preventDefault();
//         const id = getItemIdFromElement(event.currentTarget);
//         const itemName = $(event.currentTarget).find('.shopping-item').val();
//         api.updateItem(id, { name: itemName })
//             .then(() => {
//                 store.findAndUpdate(id, { name: itemName });
//                 render();
//             })
//             .catch((err) => {
//                 console.log(err);
//                 store.setError(err.message);
//                 renderError();
//             });
//     });
// };
const handleBookmarkCanceled = function () {
    $('.bookmark-entry-cancel').on('click', () => {
        bookmark.toggleAdding();
        render();
    })
};
const handleBookmarkClicked = function () {
    $('#bookmark-list-results').on('click', '.bookmark-item', event => {
        const id = getItemIdFromElement(event.currentTarget);
        const item = bookmark.findById(id);
        bookmark.findAndUpdate(id, {expanded: !item.expanded});
        render();
    });
};
const handleBookmarkUrl = function () {
    $('.bookmark-button-url').on('click', event => {
        const id = getItemIdFromElement(event.currentTarget);
        const item = bookmark.findById(id);
        console.log(item)
        window.open(item.url);
    })
};
const handleToggleAddingClick = function () {
    $('.bookmark-add-entry').click(() => {
        bookmark.toggleAdding();
        render();
    });
};

const handleFilter = function () {
    $('.filter').on("change", event => {
        const sortingX = $(event.target).children(':selected').val();
        bookmark.sortData(sortingX);
        render();
    });
};
const bindEventListeners = function () {
    handleNewBookmarkSubmit();
    handleBookmarkClicked();
    handleDeleteBookmarkClicked();
    handleToggleAddingClick();
    handleFilter();
    // handleEditShoppingItemSubmit();
    handleCloseError();
};

// This object contains the only exposed methods from this module:
export default {
    render,
    bindEventListeners
};