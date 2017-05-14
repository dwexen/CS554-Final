"use strict";

var AppComponent = function AppComponent() {
    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "div",
            { className: "col-sm-8" },
            React.createElement(PagesContainer, { url: "/pages" })
        )
    );
};

"use strict";

var PagesContainer = React.createClass({
    displayName: "PagesContainer",

    getInitialState: function getInitialState() {
        return { pages: [] };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function success(pagesList) {
                _this.setState({ pages: pagesList });
            },
            error: function error(xhr, status, err) {
                console.error(_this.props.url, status, err.toString());
            }
        });
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: "page" },
            React.createElement(PagesList, { pages: this.state.pages })
        );
    }
});
"use strict";

var Page = function Page(_ref) {
  var title = _ref.title,
      url = _ref.url,
      relevancy = _ref.relevancy,
      description = _ref.description;
    //   topics = _ref.topics

//   var viewTopics = topics.map(function (topic) {
//     return React.createElement(
//       "li",
//       null,
//       topic
//     );
//   });

  return React.createElement(
    "div",
    { className: "panel panel-default" },
    React.createElement(
      "div",
      { className: "panel-heading" },
      url
    ),
    React.createElement(
      "div",
      { className: "panel-body" },
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
        )
        // React.createElement(
        //   "div",
        //   { className: "row" },
        //   React.createElement(
        //     "div",
        //     { className: "col-md-8" },
        //     React.createElement(
        //       "ol",
        //       null,
        //       viewTopics
        //     )
        //   )
        // )
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
        pages.map(function (page) {
            return React.createElement(Page, {
                key: page.id,
                id: page.id,
                title: page.title,
                url: page.url,
                description: page.description,
                relevancy: page.relevancy
             });
                // topics: page.topics
        })
    );
};
'use strict';

ReactDOM.render(React.createElement(AppComponent, null), document.getElementById('content'));