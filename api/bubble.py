from flask import Flask, request, jsonify
from flask_cors import CORS  
from algosdk.v2client.indexer import IndexerClient
from algosdk.v2client.algod import AlgodClient
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  
load_dotenv()

# Setup Algorand clients
indexer_token = ''
indexer_address = 'https://mainnet-idx.algonode.cloud'
indexer_client = IndexerClient(indexer_token, indexer_address)

algod_token = os.getenv('MAINNET_NODE_TOKEN')
algod_net = os.getenv('MAINNET_NODE_PORT')
algod_client = AlgodClient(algod_token, algod_net)

def fetch_all_balances(asset_id, decimals):
    limit = 9000
    next_page = None
    holdings = []
    while True:
        response = indexer_client.asset_balances(asset_id=asset_id, limit=limit, next_page=next_page)
        holdings += [(r['address'], r['amount'] // decimals) for r in response['balances']]
        next_page = response.get('next-token')
        if next_page is None:
            break
    return holdings

@app.route('/api/holdings')
def get_holdings():

    token_id = request.args.get('token_id')
    asset_info = algod_client.asset_info(int(token_id))
    decimals = 10 ** asset_info['params']['decimals']
    holdings = fetch_all_balances(int(token_id), decimals)
    sorted_holdings = sorted(holdings, key=lambda x: x[1], reverse=True)
    data = {
        "name": "root",
        "children": [{"name": addr, "value": amt} for addr, amt in sorted_holdings[1:1000]],
        "totalHolders": len(holdings),
        "tokenName": asset_info['params']['name']
    }
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
