import $ from 'jquery';
import bookmark from './bookmark';
import api from './api';

const generateBookmarkElement = function (bookmark) {
    let bookmarkExpandedView = ``;
    let bookmarkTitleCompanion = `<span class="shopping-item">${bookmark.rating}</span>`;
    if (bookmark.expanded) {
        bookmarkTitleCompanion = `<button class="bookmark-item-delete">
          <span class="button-label">Delete</span>
        </button>`;
        bookmarkExpandedView = `
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
          <span class="button-label">Visit Site</span>
          
        </button>
        <span class="shopping-item">${bookmark.rating}</span>
        <div>${bookmark.desc}</div>
      </div>
    `;
    }

    return `
    <li class="bookmark-element" data-bookmark-id="${bookmark.id}">
      <span class="bookmark-item">${bookmark.title} ${bookmarkTitleCompanion}</span>
           ${bookmarkExpandedView}   
    </li>`;
};

const generateBookmarksString = function (shoppingList) {
    const items = shoppingList.map((item) => generateBookmarkElement(item))
    return items.join('');
};

// const generateError = function (message) {
//     return `
//       <section class="error-content">
//         <button id="cancel-error">X</button>
//         <p>${message}</p>
//       </section>
//     `;
// };

// const renderError = function () {
//     if (store.error) {
//         const el = generateError(store.error);
//         $('.error-container').html(el);
//     } else {
//         $('.error-container').empty();
//     }
// };

// const handleCloseError = function () {
//     $('.error-container').on('click', '#cancel-error', () => {
//         store.setError(null);
//         renderError();
//     });
// };

const render = function () {
    // renderError();
    let form = ``;
    // Filter item list if store prop is true by item.checked === false

    let items = [...bookmark.store.bookmarks];

    if (bookmark.store.adding) {
        form = `<label for="bookmark-entry-title">Title: </label>
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
        <button type="submit">Create</button>`

    }
    $('#bookmark-list-form').html(form);
    if (bookmark.store.adding) {
        handleBookmarkCanceled();
    }
    // render the shopping list in the DOM
    const bookmarkListItemsString = generateBookmarksString(items);

    // insert that HTML into the DOM
    $('#bookmark-list-results').html(bookmarkListItemsString);
};

const handleNewBookmarkSubmit = function () {
    $('#bookmark-list-form').submit(function (event) {
        event.preventDefault();
        const title = $('.bookmark-entry-title').val();
        const url = ($('.bookmark-entry-url').val().includes('https://')) ? $('.bookmark-entry-url').val() : `https://${$('.bookmark-entry-url').val()}`;
        const desc = $('.bookmark-entry-description').val();
        const rating = ($('.bookmark-entry-rating').children('input:checked')[0].value) ? $('.bookmark-entry-rating').children('input:checked')[0].value : 0;
        const newBookmark = {title, url, desc, rating};

        $('.bookmark-entry-title').val('');
        $('.bookmark-entry-url').val('');
        $('.bookmark-entry-description').val('');

        api.createBookmark(newBookmark)
            .then((newItem) => {
                bookmark.addItem(newItem);
                bookmark.toggleAdding();
                render();
            })
            .catch((err) => {
                bookmark.setError(err.message);
                // renderError();
            });
    });
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
                //renderError();
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
    // handleCloseError();
};

// This object contains the only exposed methods from this module:
export default {
    render,
    bindEventListeners
};