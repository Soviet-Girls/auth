from flask import Flask, request, make_response, jsonify
from thirdweb.types import LoginPayload
from thirdweb import ThirdwebSDK
from datetime import datetime, timedelta
import os
import vk_api

app = Flask(__name__)

vk_session = vk_api.VkApi(token=os.getenv("VK_TOKEN"))
vk = vk_session.get_api()

@app.route("/login", methods=["POST"])
def login():
    private_key = os.environ.get("ADMIN_PRIVATE_KEY")
    if not private_key:
        print("Missing ADMIN_PRIVATE_KEY environment variable")
        return "Admin private key not set", 400

    sdk = ThirdwebSDK.from_private_key(private_key, "polygon")
    contract_sdk = ThirdwebSDK("polygon")
    payload = LoginPayload.from_json(request.json["payload"])
    contract = contract_sdk.get_contract("0x15F4272460062b835Ba0abBf7A5E407F3EF425d3")
    balance = contract.erc721.balance_of(request.json["payload"]["payload"]["address"])
    print(balance)
    if balance == 0:
        return "Unauthorized", 401

    # Generate an access token with the SDK using the signed payload
    domain = "example.com"
    token = sdk.auth.generate_auth_token(domain, payload)

    res = make_response()
    res.set_cookie(
        "access_token", 
        token,
        path="/",
        httponly=True,
        secure=True,
        samesite="strict"
    )
    return res, 200

@app.route("/authenticate", methods=["POST"])
def authenticate():
    private_key = os.environ.get("ADMIN_PRIVATE_KEY")
    if not private_key:
        print("Missing ADMIN_PRIVATE_KEY environment variable")
        return "Admin private key not set", 400

    sdk = ThirdwebSDK.from_private_key(private_key, "polygon")

    # Get access token off cookies
    token = request.cookies.get("access_token")
    if not token:
        return "Unauthorized", 401
    
    domain = "example.com"

    try:
        address = sdk.auth.authenticate(domain, token)
    except Exception as e:
        print(e)
        return "Unauthorized", 401
    
    link = vk.messages.getInviteLink(peer_id=os.getenv("PEER_ID"), reset=1)
    short_link = vk.utils.getShortLink(url=link["link"])
    
    return jsonify(short_link["short_url"]), 200

@app.route("/logout", methods=["POST"])
def logout():
    res = make_response()
    res.set_cookie(
        "access_token", 
        "none",
        expires=datetime.utcnow() + timedelta(seconds=5)
    )
    return res, 200