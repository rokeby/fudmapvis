$("#login").click( function() {
	$("#info").toggle()
	$("#chatContainer").toggle()
	$("#back").toggle()
	$("#console").toggle()
	$("#market").toggle()
	$("#mapvis").toggle()
})

$("#back").click( function() {
	$("#console").toggle()
	$("#chatContainer").toggle()
	$("#back").toggle()
	$("#info").toggle()
	$("#market").toggle()
	$("#mapvis").toggle()
})


$("#hide").click( function() {
	$("#interface").toggle()
	$("#hide").toggle()
	$("#show").toggle()
})

$("#show").click( function() {
	$("#interface").toggle()
	$("#hide").toggle()
	$("#show").toggle()
}) 

$("#showMarket").click( function() {
	$("#market").toggle()
	$("#chatContainer").toggle()
}) 