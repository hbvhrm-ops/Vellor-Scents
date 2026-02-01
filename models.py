
from pydantic import BaseModel
from typing import List

class Perfume(BaseModel):
    id: str
    name: str
    brand: str
    price: float
    category: str
    description: str
    top_notes: List[str]
    middle_notes: List[str]
    base_notes: List[str]
    image_url: str
    stock: int

class OrderItem(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    id: str
    customer_name: str
    customer_email: str
    whatsapp_number: str
    address: str
    postal_code: str
    items: List[OrderItem]
    total_amount: float
    status: str = "pending"
    payment_method: str = "Easypaisa"
    transaction_screenshot: str  # Base64 encoded image string
    date: str
