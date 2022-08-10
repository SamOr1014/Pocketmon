
async function load_panel() {
    document.querySelector('#receipt-btn').addEventListener("click", () => {
        const id = 14
        addPanels()
        loadReceiptRecord(id)
        loadSubmit()
        submitReceiptToAI()
        
    })

}


async function addPanels() {

    const panelHtmlSTR = `
    <div id="submit-panel"></div>

    <div id="receipt-panel"></div>
    `
    document.querySelector("#dashboard-panel").innerHTML = panelHtmlSTR

}

async function loadReceiptRecord(id) {
    const res = await fetch(`/receipt/${id}`)
    let receiptHTML = ``
    const receipts = await res.json()

    for (const result in receipts) {
        const realBDay = new Date(result.date)
        let year = realBDay.getFullYear().toString()
        let month = "0" + (realBDay.getMonth() + 1).toString()
        let date = "0" + realBDay.getDate().toString()
        let hour = "0" + realBDay.getHours().toString()
        let mins = "0" + realBDay.getMinutes().toString()
        const finalDate =
            year +
            "-" +
            month.substring(month.length - 2) +
            "-" +
            date.substring(date.length - 2) +
            " (" +
            hour.substring(hour.length - 2) +
            ":" +
            mins.substring(mins.length - 2) +
            ")"


        receiptHTML +=
            `<div class="receipt">
        <div class="receiptBody">
            <img src=${result.image} class="card-img">

            <div id="content">
                <p class="receipt-text">
                    Venue: ${result.venue}
                    Date: ${finalDate}
                    Amount: ${result.price}
                    type: ${result.type} 
                </p>
            </div>
        </div>
    </div>
        `
    }

    document.querySelector("#receipt-panel").innerHTML = receiptHTML

}

async function loadSubmit() {

    htmlSTR =
        `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Submit your receipt here!!!
</button>

<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Upload your receipt below to our AI</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"
                    aria-label="Close"></button>
            </div>

            <!-- Submit image to AI -->
            <div class="modal-body">
                <form id="receiptAI" enctype=multipart/form-data> 
                    <input type="file" name=file required>
                    <select id="selection" name = type>
                    <option value="0">Chinese receipt</option>
                    <option value="1">english receipt</option>
                    <option value="2">Chinese & english receipt</option>
                    </select>
                    <div class="Submit-bar">
                    <button type="submit" class="btn btn-primary">Submit</button>
                    <button type="reset" class="btn btn-primary">Clear</button>
                    
                </div>
                   </form>
            </div>
            <div class="modal-body" id ="receiptTime">
            </div>

        </div>
    </div>
</div>
`

    document.querySelector('#submit-panel').innerHTML = htmlSTR

}

async function submitReceiptToAI() {

    document.querySelector('#receiptAI').addEventListener("submit", async function (event) {

        event.preventDefault()
        const submitForm = event.target
        const formData = new FormData()
        receipt = submitForm.file.files[0]
        receiptName = submitForm.file.files[0].name
        lanType = submitForm.type.value
        if (lanType === "0") {
            lanType = "chi_tra"
        } else if (lanType === "1") {
            lanType = "eng"
        } else {
            lanType = "chi_tra+eng"
        }
        formData.append(`${receiptName}`, receipt)
        formData.append(`${receiptName}`, receiptName)

        const response = await fetch("/receiptSubmit", {
            method: "Post",
            body: formData
        })

        const receiptToAI = await response.json()

        if (!receiptToAI.success) {
            console.log(receiptToAI.message)
            return
        } else {

            console.log("fetched, now go to python")

            const resp = await fetch
                (`http://localhost:8000/upload/${receiptName}`, {
                    method: "POST",
                    body: JSON.stringify({
                        lanType
                    })
                })

            const AIResult = await resp.json()
            const AIdate = AIResult.date
            const AIname = AIResult.name
            const AIamount = AIResult.amount

            console.log(AIdate)
            console.log(AIname)
            console.log(AIamount)

    
    
    AIresultHtml = `<div class="modal-body" id ="receiptTime">
    <p>Here are the result from our AI</p>
    <form id = "saveReceipt">
    <input type="text" class="form-control" id="shopName" name="shopName" placeholder = "ShopName" required value = ${AIname}>
    <input type="text" class="form-control" id="date"  name="date" placeholder = "Date" required value = ${AIdate}>
    <input type="text" class="form-control" id="amount"  name="amount" placeholder = "Amount" required value = HKD${AIamount}>
        <div class="Submit-bar">
            <button type="submit" class="btn btn-primary">Submit</button>
            <button type="reset" class="btn btn-primary">Clear</button>
</div>
</form>
</div>`

    document.querySelector("#receiptTime").innerHTML = AIresultHtml

}})

// Add function to form
submitReceipt

}


async function submitReceipt() {
    document.querySelector("#saveReceipt").addEventListener("submit", async function (event) {

        event.preventDefault()
        const form = event.target
        const formData = new FormData()
        formData.append("shopName", form.shopName.value)
        formData.append("date", form.date.value)
        formData.append("amount ", form.amount.value)
        formData.append("image", receiptImage)
        console.log(receiptImage)

        const res = await fetch("/receipt", {
            method: "Post",
            body: formData
        })

        console.log("testing")


    })
}

load_panel()