let bidList = []
let askList = []

async function getMarket () {

	const response = await fetch('https://server.fud.global/market')
	const market = await response.json();

	// $("#sell-list")
	// $("#market").append(market.bid_list[0].bidder + ' placed a bid for $' + market.price + '!<br>'
	// 	+ market.bid_list[0].bidder + " has $" + market.current_funds + " at the moment.")
	// 	.css({'font-color': 'white' })

	for (var i = 0; i < market.bid_list.length; i++) {
		if (!bidList.includes(market.bid_list[i].price)) {
			bidList.push(market.bid_list[i].price)
			if (bidList.length >= 15) {
				bidList.shift()
			}
		}
	}

	// askList.push(market.price)

	// console.log('bid list is', bidList)
	// console.log(market)

	$("#buy-list").html('')

	$("#price-value").html(market.price.toFixed(2))

	bidList.forEach(bid => $("#buy-list").append('$' + bid.toFixed(2) + '<br>'))
}

//set market to run every 1s
window.setInterval(function(){
	getMarket();
}, 2000)

// body has already been consumed