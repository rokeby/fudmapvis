var datas = []

fetch('http://server.fud.global:8888/chat')
  .then(response => response.json())
  .then(data => datas = data)
  .then(() => console.log(datas)
)

$("#chat").css({'border' : 'white 1px solid'})

var i;

for (i = 0; i < datas.length; i ++ ) {
	console.log("hello!")
}