Puls3.Views.App = Backbone.View.extend({
	events : {
		"click .publicar" : "showForm",
		"submit form" : "createArticle",
		"click .logo" : "navigateHome"
	},
	initialize : function ($el) {
		this.$el = $el;
	},
	navigateHome : function () {
		Backbone.history.navigate('', {trigger:true});
	},
	showForm : function () {
		this.$el.find('form').show();
	},
	
	createArticle : function (e) {
		e.preventDefault();

		var titulo = $('input[name=titulo]').val();
		var autor = $('input[name=autor]').val();
		var tag = $('input[name=tag]').val();
		var content = $('input[name=content]').val();




		var data = {
			"title" : titulo,
			"image" : "/imagenes/img4.jpg",
			"user"  : autor,
			"tag"   : tag,
			"votes" : 0,
			"content" : content
		};

		var model = new Puls3.Models.Article(data);
		model.save();
	}
});