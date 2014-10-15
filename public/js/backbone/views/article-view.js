Puls3.Views.Article = Backbone.View.extend({
	events:{
		"click .votos .up" : "upvote",
		"click .votos .down" : "downvote",
		"click .estrellita" : "navigate",
		"click .tag" : "navigate",
		"click .back" : "regresar",
		"click .btn1" : "cerrar",
		"click .comentarios" : "upcomentario"


	},
	tagName : "article",
	className : "post",
	initialize : function () {
		var self = this;

		this.model.on('change', function () {
			if(window.app.state === "articleSingle"){
				self.renderExtend();
			}else{
				self.render();
			}
		});

		window.routers.base.on('route:root', function () {
			self.$el.css('display', '');
			self.render();
		});

		window.routers.base.on('route:articleSingle', function () {
			if(window.app.article === self.model.get('id') ){
				self.renderExtend();
			}else{
				self.$el.hide();
			}
		});

		this.template = _.template( $('#article-template').html() );
		this.templateExtend = _.template( $('#article-extended-template').html() );
		// this.template = swig.compile( $('#article-template').html() );
	},
	navigate : function () {

		Backbone.history.navigate('article/'+this.model.get('id'), {trigger: true});
	},

	regresar : function () {
			Backbone.history.navigate('/', {trigger: true});
	},

	cerrar : function () {
			Backbone.history.navigate('/principal', {trigger: true});
	},

	upcomentario : function (e) {
		e.stopPropagation();

		var com = "<p>"+$('textarea[name=com]').val()+"</p>";
		var votes = this.model.get('content')+com;

		this.model.set('content', votes);
		this.model.save();
	},
	
	upvote : function (e) {
		e.stopPropagation();
		var votes = parseInt( this.model.get('votes'), 10 );

		this.model.set('votes', ++votes);
		this.model.save();
	},
	downvote : function (e) {
		e.stopPropagation();
		var votes = parseInt( this.model.get('votes'), 10 );

		this.model.set('votes', --votes);
		this.model.save();
	},


	renderExtend : function () {
		
		
		
		var data = this.model.toJSON();
		var html = this.templateExtend(data);

		this.$el.html( html );

		
	},
	render : function () {
		var data = this.model.toJSON();
		// junto data con el template;
		var html = this.template(data);

		this.$el.html( html );
	}
});