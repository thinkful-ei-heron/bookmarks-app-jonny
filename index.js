import $ from 'jquery';
import './node_modules/normalize.css/normalize.css';
import './index.css';
import bookmarkList from './bookmark-list';
 import bookmark from './bookmark';
import api from './api';

const main = function () {
     api.getBookmarks()
         .then((items) => {
             items.forEach((item) => bookmark.addItem(item));
             console.log(items, 'YEET');
             bookmarkList.render();
         });
    bookmarkList.bindEventListeners();
    bookmarkList.render();
};

$(main);