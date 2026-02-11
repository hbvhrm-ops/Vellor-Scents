
from fastapi import FastAPI, HTTPException, Body
from models import Perfume, Order
from data import PERFUMES
from typing import List
import requests

app = FastAPI(title="Vellor Scents API")

# Mock database
ORDERS_DB = []

def notify_n8n_webhook(order: Order):
    """
    Sends order details to the n8n webhook for downstream processing.
    Uses host.docker.internal to bridge between container and host on Windows/Mac.
    """
    webhook_url = "http://host.docker.internal:5678/webhook-test/vellor-checkout"
    
    # Enforce product name lookup to provide human-readable data to n8n
    items_summary = []
    for item in order.items:
        # Find the product name from our curated dataset
        product = next((p for p in PERFUMES if p["id"] == item.product_id), None)
        product_name = product["name"] if product else f"Unknown Product ({item.product_id})"
        items_summary.append({
            "name": product_name,
            "quantity": item.quantity
        })

    # Construct the JSON payload as requested
    payload = {
        "customer_name": order.customer_name,
        "address": order.address,
        "whatsapp_number": order.whatsapp_number,
        "order_items": items_summary,
        "total_price": order.total_amount
    }

    try:
        # Attempt to trigger the webhook with a sensible timeout
        response = requests.post(webhook_url, json=payload, timeout=5)
        response.raise_for_status()
        print(f"Webhook Notification Success: Order {order.id}")
    except requests.exceptions.RequestException as e:
        # Log failure but do not crash the order flow
        print(f"Webhook Notification Failure: {e}")

@app.get("/api/products", response_model=List[Perfume])
async def get_products():
    return PERFUMES

@app.get("/api/orders", response_model=List[Order])
async def get_orders():
    # Only accessible by admin in a real scenario
    return ORDERS_DB

@app.post("/api/orders")
async def place_order(order: Order):
    if not order.transaction_screenshot or len(order.transaction_screenshot) < 100:
        raise HTTPException(status_code=400, detail="A valid transaction screenshot is required.")
    
    if not order.customer_name or len(order.customer_name) < 2:
        raise HTTPException(status_code=400, detail="A valid customer name is required.")

    if not order.whatsapp_number or len(order.whatsapp_number) < 5:
        raise HTTPException(status_code=400, detail="A valid WhatsApp number is required.")

    if not order.address or len(order.address) < 10:
        raise HTTPException(status_code=400, detail="A complete delivery address is required.")

    if not order.postal_code:
        raise HTTPException(status_code=400, detail="Postal code is required.")
    
    # Save to local mock state
    ORDERS_DB.append(order)
    
    # Trigger the external n8n workflow
    notify_n8n_webhook(order)
    
    print(f"Order {order.id} received for {order.customer_name} ({order.customer_email}). Amount: ${order.total_amount}.")
    
    return {
        "message": "Order placed successfully. Our artisans are verifying your payment.",
        "order_id": order.id,
        "status": "Verification Pending",
        "customer_name": order.customer_name
    }

@app.patch("/api/orders/{order_id}")
async def update_order_status(order_id: str, status: str = Body(..., embed=True)):
    for order in ORDERS_DB:
        if order.id == order_id:
            order.status = status
            return {"message": f"Order {order_id} updated to {status}"}
    raise HTTPException(status_code=404, detail="Order not found")

@app.post("/api/auth/admin")
async def admin_auth(credentials: dict):
    if credentials.get("username") == "admin@vellorscents.com" and credentials.get("password") == "VellorAdmin2025":
        return {"status": "success", "token": "admin_master_token_2025"}
    raise HTTPException(status_code=401, detail="Access Denied: Invalid Maison Credentials")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
