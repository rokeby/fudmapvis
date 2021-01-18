$("#login").click( function() {
	$("#info").toggle()
	$("#chatContainer").toggle()
	$("#back").toggle()
	$("#console").toggle()
})

$("#back").click( function() {
	$("#console").toggle()
	$("#chatContainer").toggle()
	$("#back").toggle()
	$("#info").toggle()	
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