var x;
			x=$(document);
			x.ready(inicializar);

			function inicializar(){
				var x=$("#mostrar");
				x.click(muestrame);
				var y=$("#verconectado");
				y.click(muestra);
				
			}
			function muestra(){
				var x=$("#users");
				x.slideToggle("slow");
			}
			function muestrame(){
				var x=$("#contentWrap");
				x.slideToggle("slow");
			}

		jQuery(function($){
			var socket = io.connect();
			var $enviar = $('#enviar');
			var $nickError = $('#nickError');
			var $nickBox = $('#nickname');
			var $users = $('#users');
			var $messageForm = $('#send-message');
			var $messageBox = $('#message');
			var $chat = $('#chat');
			
			$enviar.click(function(e){
				e.preventDefault();
				alert();
				socket.emit('new user', $nickBox.val(), function(data){
					if(data){
						$('#slide-box').hide();
						
						$("#slide-box2").show();
					} else{
						$nickError.html('That username is already taken!  Try again.');
					}
				});
				$nickBox.val('');
			});
			
			socket.on('usernames', function(data){
				var html = '';
				for(var i=0; i < data.length; i++){
					html +='<a id="conectado" href="#"></a>'+data[i] + '<br/>'
				}
				$users.html(html);
			});
			
			$messageForm.submit(function(e){
				e.preventDefault();
				socket.emit('send message', $messageBox.val(), function(data){
					$chat.append('<span class="error">' + data + "</span><br/>");
				});
				$messageBox.val('');
			});
			
			socket.on('load old msgs', function(docs){
				for(var i=docs.length-1; i >= 0; i--){
					displayMsg(docs[i]);
				}
			});
			
			socket.on('new message', function(data){
				displayMsg(data);
			});
			
			function displayMsg(data){
				$chat.append('<p class="msg"><b>' + data.nick + ': </b>' + data.msg + "</p>");
				$chat.animate({scrollTop:$chat.height()}, 300);
				
			}
			
			socket.on('whisper', function(data){
				$chat.append('<p class="whisper"><b>' + data.nick + ':  </b>' + data.msg + "</p>");
			});
		});