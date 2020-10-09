async function getChat () {

	const response = await fetch('http://server.fud.global:8888/chat')
	const chat = await response.json();
	console.log('chat is', chat)

	chat.forEach(msg => $("#chat").append(msg.agent + ': ' + msg.chat + '<br>')
		.css({'font-color': msg.agent }))
}

$("#chat").css({'border' : 'white 1px solid'})
getChat();