async function getChat () {

	const response = await fetch('https://server.fud.global/chat')
	const chat = await response.json();
	$("#chat").html('')
	chat.forEach(msg => $("#chat").append(msg.agent + ': ' + msg.chat + '<br>')
		.css({'font-color': msg.agent })
			

//handle post requests
$('#userChat').submit(function(event) {
	event.preventDefault();
	$.ajax({
		url: 'http://server.fud.global/userchat',
		type: 'POST',
		data: $(this).serialize(),
		success: function(data) {
			console.log(data)
			$('#userChat')[0].reset();
		}
	});
});

//handle post requests
$('#emailForm').submit(function(event) {
	event.preventDefault();
	$.ajax({
		url: 'http://server.fud.global/email',
		type: 'POST',
		data: $(this).serialize(),
		success: function(data) {
			console.log(data)
			$('#emailForm')[0].reset();
		}
	});
});


//set chat to run every 10s
window.setInterval(function(){
	getChat();
}, 1000)


