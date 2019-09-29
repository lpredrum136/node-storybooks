const moment = require('moment');

// Helpers for handlebars to truncate too long stories on stories index page
// and deal with HTML tag in stories
module.exports = {
    truncate: function(str, len) {// Look at string len, if it's bigger than "len", cut off. At the end, add "..."
        if (str.length > len && str.length > 0) {
            var new_str = str + " ";
            new_str = str.substr(0, len);
            new_str = str.substr(0, new_str.lastIndexOf(" "));
            new_str = (new_str.length > 0) ? new_str : str.substr(0, len);
            return new_str + '...';
        }

        return str;
    },
    stripTags: function(str) {// Strip all HTML tags
        return str.replace(/<(?:.|\n)*?>/gm, '');
    },
    formatDate: function(date, format) {
        return moment(date).format(format);
    },
    /* Here Brad suggested this helper but I found an easier solution so I am using mine.*/
    /*select: function(selected, options) {// Re render the form to edit story, see routes/stories.js
        return options.fn(this).replace(new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"')
        .replace(new RegExp('>' + selected + '</option>'), 'selected="selected"$&');
    }*/

    // Check if the viewer is the owners of some stories, then allow edit button (the "chip" thing in index.hbs)
    // Otherwise disable that chip
    editIcon: function(storyUser, loggedUser, storyId, floating = true) {
        if (storyUser == loggedUser) {
            if (floating) {
                return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab red"><i class="fas fa-pen"></i></a>`;
            } else {
                return `<a href="/stories/edit/${storyId}"><i class="fas fa-pen fa-sm"></i></a>`;
            }
        } else {
            return '';
        }
    }
};