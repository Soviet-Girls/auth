from flask import Flask, request, make_response, jsonify
from thirdweb.types import LoginPayload
from thirdweb import ThirdwebSDK
from datetime import datetime, timedelta
import os
import vk_api

from check import check_owner

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
    payload = LoginPayload.from_json(request.json["payload"])

    # Generate an access token with the SDK using the signed payload
    domain = "auth.sovietgirls.su"
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
    
    domain = "auth.sovietgirls.su"

    try:
        address = sdk.auth.authenticate(domain, token)
        owner = check_owner(address)
        if owner is False:
            return "Unauthorized", 401
    except Exception as ex:
        print(ex)
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