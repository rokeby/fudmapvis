$("#consoleData").click( function() {
	$("#email").toggle()
	$("#chatContainer").toggle()
	$("#back").toggle()
	$("#consoleData").toggle()
})

$("#back").click( function() {
	$("#consoleData").toggle()
	$("#chatContainer").toggle()
	$("#back").toggle()
	$("#email").toggle()	
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