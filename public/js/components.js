"use strict";
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; };

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
    render: function render() {
        return React.createElement(
            "div",
            { className: "filter-section" },
            React.createElement(
                "h1",
                null,
                "filter",
                React.createElement("br", null),
                "by"
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
                //pre-sort results
                const field = "relevancy";
                var direction = 1;
                pagesList.sort(function(a, b){return b[field]-a[field]});
                console.log("sorted list", pagesList);
                _this.setState({
                    pages: pagesList
                });
            },
            error: function error(xhr, status, err) {
                console.error(_this.props.url, status, err.toString());
            }
        });
    },

    render: function render() {
        return React.createElement(
            "row",
            null,
            React.createElement(
                "div",
                { className: "col-sm-3" },
                React.createElement(SettingsContainer, {})
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