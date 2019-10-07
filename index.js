import $ from 'jquery';
import './node_modules/normalize.css/normalize.css';
import './index.css';
import bookmarkList from './src/bookmark-list';
 import bookmark from './src/bookmark';
import api from './src/api';

const main = function () {
     api.getBookmarks()
         .then((items) => {
             items.forEach((item) => bookmark.addItem(item));
             bookmarkList.render();
         });
    bookmarkList.bindEventListeners();
    bookmarkList.render();
};

$(main);