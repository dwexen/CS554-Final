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
                className: "col-sm-3"
            },
            React.createElement(SettingsContainer, {
                url: "/topics"
            })
        ),
        React.createElement(
            "div", {
                className: "col-sm-9"
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

    getInitialState: function getInitialState() {
        return {
            topics:[]
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function success(topicsList) {
                _this.setState({
                    topics: topicsList
                });
            },
            error: function error(xhr, status, err) {
                console.error(_this.props.url, status, err.toString());
            }
        });
    },

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                null,
                "Filter Results",
                React.createElement(
                    "form",
                    null,
                    React.createElement(
                        "label",
                        null,
                        React.createElement(
                            "input",
                            { type:"checkbox", defaultChecked:true },
                            null
                        ), "KMS"
                    )
                )
            )
        );
    }
});

"use strict";

var PagesContainer = React.createClass({
    displayName: "PagesContainer",

    getInitialState: function getInitialState() {
        return {
            pages: [],
            field: "relevancy",
            direction: 1
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
                const field = _this.state.field;
                var direction = _this.state.direction;
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
                "div", {
                    className: "col-sm-12 page"
                },
                React.createElement(PagesList, {
                    pages: this.state.pages
                })
            )
        )
    },

    sortPages: function sortPages(field, direction) {
        var sortedPagesList = this.state.pages.sort(function(a,b){ 
            if (direction == 1)
                return b[field] - a[field];
            else
                return a[field] - b[field];
        });

        this.setState({
            field: field,
            direction: direction,
            pages: sortedPagesList
        });
    },

    componentWillReceiveProps: function (nextProps) {
        this.sortPages(nextProps.field, nextProps.direction);
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
                    "p",
                    { className: "title" },
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