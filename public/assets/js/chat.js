var dict = {
	agent : "MistyRose",
	weather : "#b2ebff",
	market : "yellow",
	oracle: "gold",
	person: "PaleGreen",
}

async function getChat () {

	const response = await fetch('https://api.zhexi.info/fud/chat')
	const chat = await response.json();
	$("#chat").html('')
	chat.forEach(msg => $("#chat").append(
		'<div class="chatLine"><span class="chatEntity" style="color: ' + dict[msg.entityType]+ '">' + msg.agent + ': </span><span class="chatEntity" style="color: ' + dict[msg.entityType] + '">' + msg.chat + '</span></div>'))

	// console.log($("#chat").text().length)
}

//handle post requests
$('#userChat').submit(function(event) {
	event.preventDefault();
	$.ajax({
		url: 'https://api.zhexi.info/fud/userchat',
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
		url: 'https://api.zhexi.info/fud/email',
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


