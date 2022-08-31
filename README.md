# Pocketmon

This is a web application that is aimmed to allow users to record their spending by uploading their receipt. An OCR AI will read the price, venue and the date of the receipt and record it in the database as the user's expenses.

## Functions

 1. Overview board
  - Allow users to have a overview on the daily spending, monthly spending and stock income
  - There are two charts that allows users to view the portion of type of spending in the current month and the trend of spending for the last 7 days
  
 2. Receipt Page
  - This page allows the users to upload their receipt
  - Tesseract Open Source OCR Engine was used to recognised all upload receipts
  - All receipts are compressed and pre-processed with filter (including sharpening and greyscale) before being analysed by the AI
  - The page will show all the receipt of the user and allow them to modify the detail of that spending in case of any error during the recognition by the AI

 3. Stock Page
  - This page allows users to create any stock record (buy/sell) to manage their equity assets.
  - The stock price is fetch from a API using a Python library "yahoo_fin"
  - Top five loser, gainer and active stock will be shown on the side of the user stock panel
  - The main panel is the record of what stocks the user is currently holding the cost of those equity and the P/L (profit and Lost)

