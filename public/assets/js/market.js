let bidList = []
let askList = []

async function getMarket () {

	const response = await fetch('https://server.fud.global/market')
	const market = await response.json();
	// console.log(market)

	// $("#sell-list")
	// $("#market").append(market.bid_list[0].bidder + ' placed a bid for $' + market.price + '!<br>'
	// 	+ market.bid_list[0].bidder + " has $" + market.current_funds + " at the moment.")
	// 	.css({'font-color': 'white' })

	for (var i = 0; i < market.bid_list.length; i++) {
		bidList.push(market.bid_list[i].price)
		if (bidList.length >= 15) {
			bidList.shift()
		}
	}

	// askList.push(market.price)




	console.log(bidList)
	// console.log(market)

	$("#buy-list").html('')
	bidList.forEach(bid => $("#buy-list").append(bid + '<br>'))
}



//set chat to run every 10s
window.setInterval(function(){
	getMarket();
}, 1000)


// body has already been consumed