import os
import json
import datetime
import base64
from functools import wraps
from flask import jsonify, request
from flask_mail import Mail, Message
from flask import current_app
import jwt

JWT_SECRET = 'giraffegiraffebeetroot'
DATABASE_FILE = '/app/backend/database.json'
CATEGORIES_FILE = "/app/backend/categories_new.json"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

mail = None  # Placeholder for the Mail instance
_blacklist = None  # This will be initialized from app.py

def allowed_file(filename):
    """
    Check if the file extension is allowed
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def initialize_blacklist(blacklist):
    """
    Initialize the blacklist to be used for token validation.
    """
    global _blacklist
    _blacklist = blacklist

# Helper functions
def load_data(users, brands, products):
    """
    Load data from the database file into the provided dictionaries.
    """
    if os.path.exists(DATABASE_FILE):
        with open(DATABASE_FILE, "r") as file:
            data = json.load(file)
            users.update(data.get("users", {}))
            brands.update(data.get("brands", {}))
            products.update(data.get("products", {}))
    else:
        save_data(users, brands, products)  # Initialize and save empty data if file doesn't exist


def save_data(users, brands, products):
    with open(DATABASE_FILE, "w") as file:
        json.dump(
            {"users": users, "brands": brands, "products": products}, file, indent=2
        )


def load_categories():
    if os.path.exists(CATEGORIES_FILE):
        with open(CATEGORIES_FILE, "r") as file:
            return json.load(file)
    else:
        raise FileNotFoundError(f"{CATEGORIES_FILE} not found")


def generate_token(email, is_admin):
    return jwt.encode(
        {
            "email": email,
            "role": "admin" if is_admin else "user",
        },
        JWT_SECRET,
        algorithm="HS256",
    )


def token_required(users):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get("Authorization")
            if not token:
                return jsonify({"message": "Token is missing!"}), 403
            try:
                token = token.replace("Bearer ", "")
                if token in _blacklist:
                    return jsonify({"message": "Token has been invalidated!"}), 403
                data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                current_user = users.get(data["email"], None)
                if not current_user:
                    raise ValueError("User not found")
            except Exception as e:
                return jsonify({"message": "Invalid token!"}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


def generateId(currentList, max=999999999):
    def rand_num(max):
        return round((max - (max // 10)) * (os.urandom(1)[0] / 255) + (max // 10))
    
    rand = rand_num(max)
    while str(rand) in currentList:
        rand = rand_num(max)
    return str(rand)


def get_query_list(param_name):
    """
    Extracts a query parameter from the request and splits it into a list.
    """
    param_value = request.args.get(param_name)
    if param_value:
        # Split by comma if commas are present; otherwise, return a list with a single item
        return param_value.split(",")
    return []


def initialize_mail(app_mail):
    """
    Initializes the Mail instance to be used for sending emails.
    """
    global mail
    mail = app_mail


def send_email_notification(to_email, message_body):
    """
    Sends an email notification to the user's email address.
    """
    msg = Message(
        subject="Product Update Notification",
        sender=current_app.config.get("MAIL_USERNAME"),  # Replace with your email
        recipients=[to_email]
    )
    msg.body = message_body
    mail.send(msg)


def send_periodic_notifications(users, brands, products):
    """
    Sends notifications to users based on followed brands, subcategories, and wishlist items.
    """
    with current_app.app_context():  # Push the application context
        for email, user in users.items():
            if user.get("is_admin"):
                continue

            matched_products = {
                "new": [],
                "on_sale": [],
                "re_stock": []
            }

            # Check for products in wishlist or followed categories/brands
            for product in products.values():
                if (
                    product["brand_id"] in user.get("followed_brand", []) or
                    product["sub_category"] in user.get("followed_subcategories", []) or
                    str(product["product_id"]) in user.get("wish_list", [])
                ):
                    # Sort into categories
                    if product["status"] == "New":
                        matched_products["new"].append(product["name"])
                    elif product["status"] == "On Sale":
                        matched_products["on_sale"].append(product["name"])
                    elif product["stock"] == "Re-Stock":
                        matched_products["re_stock"].append(product["name"])

            # Construct the notification message
            message = ""
            if matched_products["new"]:
                message += "New products available: " + ", ".join(matched_products["new"][:3]) + "\n"
            if matched_products["on_sale"]:
                message += "Products on sale: " + ", ".join(matched_products["on_sale"][:3]) + "\n"
            if matched_products["re_stock"]:
                message += "Products restocked: " + ", ".join(matched_products["re_stock"][:3]) + "\n"

            # Send email and add to notifications only if there's content in the message
            if message.strip():
                send_email_notification(email, message)  # Send email notification

                # Append notification to user's notifications list
                notification = {
                    "id": generateId([n["id"] for n in user.get("notifications", [])]),
                    "message": message,
                    "status": "unread",  # Mark notifications as unread by default
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
                user["notifications"].append(notification)

        # Save data after processing notifications
        save_data(users, brands, products)
