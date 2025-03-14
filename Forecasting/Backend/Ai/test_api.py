from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "message": "Hello, the API is working!",
        "status": "success"
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy"
    })

@app.route('/query_data_feeds')
def feeds():
    return jsonify({
        "available_feeds": {
            "BTC/USD": "Bitcoin",
            "ETH/USD": "Ethereum"
        },
        "status": "success"
    })

if __name__ == '__main__':
    print("Starting test API on port 8080")
    app.run(host='0.0.0.0', port=8080, debug=True)
