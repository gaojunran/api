import os

import requests
from dotenv import load_dotenv
from robyn import ALLOW_CORS, Robyn

load_dotenv()
app = Robyn(__file__)
ALLOW_CORS(app, "*")


@app.get("/api/test")
def test():
    return "Hello World!"


@app.get("/api/blog/test-mihome")
def test_mihome():
    url = "http://localhost:8081/api/services/light/toggle"
    token = os.getenv("MIHOME_TOKEN")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    data = {"entity_id": "light.philips_cn_274401208_sread2_s_2_light"}
    response = requests.post(url, headers=headers, json=data)
    return {"code": response.status_code, "data": response.text}


if __name__ == "__main__":
    app.start(host="0.0.0.0", port=8080)
