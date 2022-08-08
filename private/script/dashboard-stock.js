//load the mobile nav and the web nav when loaded
function eventListenerOfStockButton() {
	document.querySelector('#stock-btn').addEventListener('click', async () => {
		loadStockPage()
		await loadUserStocks()
	})
	document
		.querySelector('#m-stock-btn')
		.addEventListener('click', async () => {
			loadStockPage()
			await loadUserStocks()
		})
}

function loadStockPage() {
	//Loading the stock page into the panel
	const panel = document.querySelector('#dashboard-panel')
	//loading the table title plus buttons
	panel.innerHTML = `
	<div class="col-md-12 d-flex flex-row-reverse">
	<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal1">
<i class="bi bi-plus-square"></i>
</button>

<!-- Modal -->
<div class="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-body">
<!-- FORM -->
<form id="stock-form">
  <div class="mb-3">
    <label for="" class="form-label">Ticker</label>
    <input name="ticker" class="form-control" id="ticker" aria-describedby="emailHelp" required>
    <div id="Ticker-Warn" class="form-text">Make Sure Your Ticker is Correct</div>
  </div>
  <div class="mb-3">
	<label for="buy-sell" class="form-label">Buy or Sell?</label>
	<select class="form-select" name="buy-sell" aria-label="Default select example" required>
  <option value="buy">Buy</option>
  <option value="sell">Sell</option>
</select>
  </div>
  <div class="mb-3">
    <label for="Price" class="form-label">Price</label>
    <input name="price" class="form-control" id="price" required>
  </div>
  <div class="mb-3">
    <label for="Amount" class="form-label">Amount</label>
    <input name="amount" class="form-control" id="amount" required>
  </div>
  <button type="class" class="btn btn-primary">Submit</button>
  <button id="close-modal" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
</form>
      </div>
    </div>
  </div>
</div>

	<button id="stock-reload" class="btn btn-dark text-center">
	<i class="bi bi-arrow-clockwise"></i>
	</button>
	</div>
	<div id="stock-table-title" class="row mt-3">
	<div class="col-2 d-flex justify-content-center"><span>Ticker</span></div>
	<div class="col-2 d-flex justify-content-center"><span>Qty</span></div>
	<div class="col-4 d-flex justify-content-center"><span>Cost</span></div>
	<div class="col-4 d-flex justify-content-center"><span>Current</span></div>
	</div>
	<div id="stocks-detail"></div>
	`
	document
		.querySelector('#stock-reload')
		.addEventListener('click', async () => {
			const curBtn = document.querySelector('#stock-reload')
			curBtn.disabled = true
			document.querySelector('#stocks-detail').innerHTML = ``
			console.log('reload')
			await loadUserStocks()
		})
	formSubmitForNewStock()
}

//load all stock and calculates
async function loadUserStocks() {
	// console.log('loading')
	const panel = document.querySelector('#stocks-detail')
	const loader = `<div class="d-flex justify-content-center mt-5">
	<div class="spinner-border" role="status">
	  <span class="visually-hidden">Loading...</span>
	</div>
  </div>`
	panel.innerHTML = loader
	//*********
	//change
	//*********
	id = 1
	//*********
	//change
	//*********

	const stockDetailsFromDB = await fetch(`/stock/${id}`)
	const result = await stockDetailsFromDB.json()
	let stockSet = new Set()
	//Get all stock name as a set
	for (let i of result) {
		stockSet.add(i['ticker'])
	}
	//turn set to array
	let stockArr = Array.from(stockSet)
	//prepare to format the data to table on the page
	let query = stockArr.join('&')
	//get stock current price data from python yFinance API
	let yahooStockPrice = await fetch(`http://localhost:8000/stock/${query}`, {
		method: 'GET'
	})
	let parseYF = await yahooStockPrice.json()
	// console.log('stocks are', parseYF)
	//Array for data to be printed on the stock page
	let presentData = []
	for (let stock of stockArr) {
		//filter the particular stock for calculation
		let filtered = result.filter((item) => item.ticker === stock)
		let current = 0,
			totalAmount = 0,
			buy = 0,
			sell = 0

		//add up all buy and sell of current stock
		for (let item of filtered) {
			if (!item.is_buy) {
				sell -= parseInt(item.price) * item.amount
				totalAmount += item.amount
			} else {
				buy += parseInt(item.price) * item.amount
				totalAmount += item.amount
			}
		}
		current = parseYF[stock]
		current = Math.round((current + Number.EPSILON) * 100) / 100
		presentData.push({
			ticker: stock,
			amount: totalAmount,
			cost: Math.round(
				(((buy + sell) / totalAmount + Number.EPSILON) * 100) / 100
			),
			current: current
		})
	}
	allStock = presentData
	panel.innerHTML = ``
	for (let data of presentData) {
		addStockRow(data.ticker, data.amount, data.cost, data.current, panel)
	}
	//Add eventlistener after the reload button is loaded
	document.querySelector('#stock-reload').disabled = false
}

//add row for users' stocks
function addStockRow(ticker, amount, cost, current, panel) {
	let stockDetailRow = `	<div class="row mt-1 stock-detail">
	<div class="col-2 d-flex justify-content-center"><span>${ticker}</span></div>
	<div class="col-2 d-flex justify-content-center"><span>${amount}</span></div>
	<div class="col-4 d-flex justify-content-center"><span>USD$ ${cost}</span></div>
	<div class="col-4 d-flex justify-content-center"><span>USD$ ${current}</span></div>
	</div>`
	panel.innerHTML += stockDetailRow
}

function formSubmitForNewStock() {
	document
		.querySelector('#stock-form')
		.addEventListener('submit', async (e) => {
			e.preventDefault()
			//make the form
			const form = e.target
			const obj = {}
			obj['ticker'] = form.ticker.value
			if (form['buy-sell'].value === 'buy') {
				obj['is_buy'] = true
			}
			if (form['buy-sell'].value === 'sell') {
				obj['is_buy'] = false
			}
			if (form['buy-sell'].value === '') {
				alert('missing buy/sell')
			}
			obj['price'] = form.price.value
			obj['amount'] = form.amount.value
			console.log(obj)
			//checking
			if (!obj.ticker || !obj['is_buy'] || !obj.price || !obj.amount) {
				alert("You Haven't Enter All Detail")
			} else {
				alert('success')
			}
			const result = await fetch('/stock', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(obj)
			})
			let DBResult = await result.json()
			console.log('updated', DBResult)
			//Clear the form just to be sure
			document.getElementById('stock-form').reset()
			await loadUserStocks()
		})
	document.querySelector('#close-modal').addEventListener('click', () => {
		document.getElementById('stock-form').reset()
	})
}
//###################################################################################
//MAIN
//###################################################################################
eventListenerOfStockButton()
