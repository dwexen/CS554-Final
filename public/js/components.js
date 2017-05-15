"use strict";

var AppComponent = function AppComponent() {

    return React.createElement(
        "div", {
            className: "row"
        },
        React.createElement(
            "div", {
                className: "col-sm-12"
            },
            React.createElement(PagesContainer, {
                url: "/pages"
            })
        )
    );
};

"use strict";

var SettingsContainer = React.createClass({
    displayName: "SettingsContainer",
    sortPages: function sortPages(field) {
        this.props.sortPagesBy(this.props.pagesState, field, this.props.pages, this.props.direction);
    },
    render: function render() {
        return React.createElement(
            "div",
            { className: "sort-section" },
            React.createElement(
                "h1",
                null,
                "Sort",
                React.createElement("br", null),
                "by"
            ),
            React.createElement(
                "div",
                { className: "pill", onClick: this.sortPages.bind(this, 'relevance') },
                "Relevance"
            ),
            React.createElement(
                "div",
                { className: "pill", onClick: this.sortPages.bind(this, 'title') },
                "Title"
            )
        );
    }
});

"use strict";

var PagesContainer = React.createClass({
    displayName: "PagesContainer",

    getInitialState: function getInitialState() {
        return {
            pages: []
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function success(pagesList) {
                _this.setState({
                    pages: pagesList
                });
            },
            error: function error(xhr, status, err) {
                console.error(_this.props.url, status, err.toString());
            }
        });
    },

    sortPagesBy: function (listState, field, pages, direction) {
        // Sorting ...
        pages.sort(function (a, b) {
            if (a[field] > b[field])
                return -direction;
            if (a[field] < b[field])
                return direction;
            return 0;
        });
        // Change state
        listState.setState({ 'pages': pages, 'direction': -direction });
    },

    render: function render() {
        return React.createElement(
            "row",
            null,
            React.createElement(
                "div",
                { className: "col-sm-3" },
                React.createElement(SettingsContainer, {
                    pagesState: this, direction: this.state.direction, pages: this.state.pages, sortPagesBy: this.sortPagesBy
                })
            ),
            React.createElement(
                "div", {
                    className: "col-sm-9 page"
                },
                React.createElement(PagesList, {
                    pages: this.state.pages
                })
            )
        )
    }
});
"use strict";

var Page = function Page(_ref) {
    var title = _ref.title,
        url = _ref.url,
        relevancy = _ref.relevancy,
        description = _ref.description,
        topics = _ref.topics;

    var viewTopics = topics.map(function(topic) {
        return React.createElement(
            "li", {
                className: "tag text-muted"
            },
            topic
        );
    });

    return React.createElement(
        "div", {
            className: "panel panel-default"
        },
        React.createElement(
            "div", {
                className: "panel-heading"
            },
            url
        ),
        React.createElement(
            "div", {
                className: "panel-body"
            },
            React.createElement(
                "div",
                null,
                React.createElement(
                    "h1",
                    null,
                    title
                ),
                React.createElement(
                    "p",
                    null,
                    description
                ),
                React.createElement(
                    "div", {
                        className: "row"
                    },
                    React.createElement(
                        "div", {
                            className: "col-sm-12"
                        },
                        React.createElement(
                            "ul", {
                                className: "tags"
                            },
                            React.createElement(
                                "i", {
                                    className: "fa fa-tag"
                                },
                                null
                            ),
                            viewTopics
                        )
                    )
                )
            )
        )
    );
};
'use strict';

var PagesList = function PagesList(_ref) {
    var pages = _ref.pages;

    return React.createElement(
        "div",
        null,
        pages.map(function(page) {
            return React.createElement(Page, {
                key: page.id,
                id: page.id,
                title: page.title,
                url: page.url,
                description: page.description,
                relevancy: page.relevancy,
                topics: page.topics
            });
        })
    );
};
'use strict';

ReactDOM.render(React.createElement(AppComponent, null), document.getElementById('content'));