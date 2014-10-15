Puls3.Routers.Base = Backbone.Router.extend({
	routes : {
		"" : "root",
		"article/:id" : "articleSingle"
	},
	root : function () {
		console.log('Estoy en root');

		window.app.state = "root";
		window.app.article = null;
	},
	articleSingle : function (id) {
		console.log('Estoy en article single');

		window.app.state = "articleSingle";
		window.app.article = id;
	}
});