import os
import json
import datetime
import shutil
from functools import wraps
import jwt
from flask import (
    Flask,
    request,
    jsonify,
    redirect,
    send_from_directory,
    current_app
)
from flasgger import Swagger
from flask_mail import Mail, Message
from flask_cors import CORS
from helper import (
    load_data,
    save_data,
    load_categories,
    generate_token,
    token_required,
    generateId,
    get_query_list,
    initialize_mail,
    send_periodic_notifications,
    send_email_notification,
    JWT_SECRET,
    DATABASE_FILE,
    CATEGORIES_FILE,
    initialize_blacklist
)
from user_authenticator import register, delete_user, login, logout, get_profile, edit_profile, change_password
from brand_function import (
    add_brand,
    delete_brand,
    edit_brand,
    get_all_brands,
    get_single_brand,
    follow_brand,
    unfollow_brand,
)
from product_function import (
    get_products,
    get_single_product,
    add_product,
    upload_product_image,
    delete_product_image,
    delete_product,
    edit_product
)
import threading
import time
import base64

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://api:9900","https://nuovo.anranz.xyz"])

app.config['SECRET_KEY'] = JWT_SECRET

# Configuration for sending emails
app.config['MAIL_SERVER'] = ''
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = ''  # Your email address
app.config['MAIL_PASSWORD'] = ''   # Your email password
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Nuovo Management API",
        "description": "API for Nuovo Website",
        "version": "1.1.0",
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": 'JWT Authorization header. Example: "Bearer {token}"',
        }
    },
}

swagger = Swagger(app, template=swagger_template)
mail = Mail(app)

initialize_mail(mail)


# State Management
users = {}
brands = {}
products = {}

blacklist = set()

initialize_blacklist(blacklist)

# Generate JWT token for password reset
def generate_reset_token(email):
    return jwt.encode(
        {
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )


# Verify the token
def verify_reset_token(token):
    try:
        data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return data["email"]
    except:
        return None


# Initialize data
load_data(users, brands, products)
# Initialize categories
categories = load_categories()


def schedule_periodic_notifications(app):
    """
    Runs send_periodic_notifications every in a separate thread.
    """
    with app.app_context(): 
        while True:
            send_periodic_notifications(users, brands, products)  # Execute the function to send notifications
            time.sleep(86400)


###user authorticator###
app.add_url_rule("/user/auth/register", "register", register(users, products, brands), methods=["POST"])
app.add_url_rule("/user", "delete_user", delete_user(users, products, brands), methods=["DELETE"])
app.add_url_rule("/user/auth/login", "login", login(users, products, brands), methods=["POST"])
app.add_url_rule("/user/auth/logout", "logout", logout(users, blacklist, products, brands), methods=["POST"])
app.add_url_rule("/user/profile", "get_profile", get_profile(users), methods=["GET"])
app.add_url_rule(
    "/user/profile", "edit_profile", edit_profile(users, products, brands), methods=["PUT"]
)
app.add_url_rule(
    "/user/auth/change-password", "change_password", change_password(users, products, brands), methods=["PUT"]
)


###All brands functions###
app.add_url_rule("/admin/brands", "add_brand", add_brand(users, products, brands), methods=["POST"])
app.add_url_rule("/admin/brands/<string:brand_id>", "delete_brand", delete_brand(users, products, brands), methods=["DELETE"])
app.add_url_rule("/admin/brands/<string:brand_id>", "edit_brand", edit_brand(users, products, brands), methods=["PUT"])
app.add_url_rule("/brands", "get_all_brands", get_all_brands(brands), methods=["GET"])
app.add_url_rule("/brands/<string:brand_id>", "get_single_brand", get_single_brand(brands), methods=["GET"])
app.add_url_rule("/user/follow_brand/<string:brand_id>", "follow_brand", follow_brand(users, products, brands), methods=["POST"])
app.add_url_rule("/user/unfollow_brand/<string:brand_id>", "unfollow_brand", unfollow_brand(users, products, brands), methods=["POST"])


@app.route("/user/auth/forgot_password", methods=["POST"])
def forgot_password():
    """
    Forgot password - Send password to user's email
    ---
    tags:
      - User Authentication
    parameters:
      - name: body
        in: body
        schema:
          type: object
          required:
            - email
          properties:
            email:
              type: string
              example: "123@gmail.com"
    responses:
      200:
        description: Password sent successfully
      400:
        description: Invalid email
    """
    data = request.get_json()
    email = data.get("email")

    # Check if the email is valid
    user = users.get(email)
    if not user:
        return jsonify({"error": "Invalid email"}), 400

    # Send the password to the email
    password = user["password"]
    message_body = f"Your password is: {password}"

    send_email_notification(email, message_body)

    return jsonify({"message": "Password sent to your email"}), 200


app.add_url_rule("/products", "get_products", get_products(products), methods=["GET"])
app.add_url_rule("/products/<string:product_id>", "get_single_product", get_single_product(products), methods=["GET"])
app.add_url_rule("/admin/products", "add_product", add_product(users, products, brands), methods=["POST"])
app.add_url_rule("/admin/products/<string:product_id>/upload_image", "upload_product_image", upload_product_image(users, products, brands), methods=["POST"])
app.add_url_rule("/admin/products/<string:product_id>/delete_image", "delete_product_image", delete_product_image(users, products, brands), methods=["DELETE"])
app.add_url_rule("/admin/products/<string:product_id>", "delete_product", delete_product(users, products, brands), methods=["DELETE"])
app.add_url_rule("/admin/products/<string:product_id>", "edit_product", edit_product(users, products, brands), methods=["PUT"])


# Endpoint for click count
@app.route("/products/<string:product_id>/click", methods=["POST"])
def increment_click_count(product_id):
    product = products.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    product["click_count"] = product.get("click_count", 0) + 1
    save_data(users, brands, products)

    return jsonify({"message": "Click count updated"}), 200

@app.route("/products/<string:product_id>/clickthrough", methods=["POST"])
def increment_click_through_count(product_id):
    product = products.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    product["click_through_count"] = product.get("click_through_count", 0) + 1
    save_data(users, brands, products)

    return jsonify({"message": "Click-through count updated"}), 200

# get a list of users with general data to display (no passwords)
@app.route("/admin/users", methods=["GET"])
@token_required(users)
def get_all_users(current_user):
    """
    Get a list of all users (Admin only)
    ---
    tags:
      - User Management
    responses:
      200:
        description: List of users with details
      403:
        description: Unauthorized
    security:
      - Bearer: []
    """
    if not current_user["is_admin"]:
        return jsonify({"error": "Only admins can access user details"}), 403
    with open(DATABASE_FILE, "r") as file:
        data = json.load(file)
    users = data.get("users", {})
    user_list = [
        {
            "name": user_data["name"],
            "email": user_data["email"],
            "followed_brand_count": (
                len(user_data.get("followed_brand", []))
                if user_data.get("followed_brand")
                else 0
            ),
            "wish_list_count": (
                len(user_data.get("wish_list", [])) if user_data.get("wish_list") else 0
            ),
            "notifications_count": (
                len(user_data.get("notifications", []))
                if user_data.get("notifications")
                else 0
            ),
        }
        for user_data in users.values()
    ]
    return jsonify(user_list), 200


@app.route("/admin/user", methods=["DELETE"])
@token_required(users)
def admin_delete_user(current_user):
    """
    Delete a user account by email (Admin only)
    ---
    tags:
      - User Management
    parameters:
      - name: email
        in: query
        type: string
        required: true
        description: "Email of the user to delete"
    responses:
      200:
        description: User deleted successfully
      403:
        description: Unauthorized (User is not an admin)
      404:
        description: User not found
    security:
      - Bearer: []
    """
    # Check if the current user is an admin
    if not current_user["is_admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    email_to_delete = request.args.get("email")  # Get the email from query parameters

    # Check if the user exists
    user = users.get(email_to_delete)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id = user["user_id"]

    # Remove the user ID from brand followers_list
    for brand in brands.values():
        if user_id in brand["followers_list"]:
            brand["followers_list"].remove(user_id)

    # Remove the user ID from product wishlister_users
    for product in products.values():
        if user_id in product["wishlister_users"]:
            product["wishlister_users"].remove(user_id)

    # Delete the user account
    del users[email_to_delete]

    # Save changes to the database
    save_data(users, brands, products)

    return jsonify({"message": "User account deleted successfully"}), 200


@app.route("/user/wishlist/<string:product_id>", methods=["POST"])
@token_required(users)
def add_to_wishlist(current_user, product_id):
    """
    Add a product to the user's wish list by product ID
    ---
    tags:
      - User Dashboard
    parameters:
      - name: product_id
        in: path
        type: string
        required: true
        description: "The ID of the product to add to the wish list"
    responses:
      200:
        description: Product added to wish list successfully
      400:
        description: Product ID not specified or already in the wish list
      403:
        description: Admins cannot add products to wish lists
      404:
        description: Product not found
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins cannot add products to wish lists"}), 403

    # Check if the product_id is valid
    product = products.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Add the product_id to the user's wish_list if not already present
    if product_id in current_user["wish_list"]:
        return jsonify({"error": "Product is already in your wish list"}), 400

    current_user["wish_list"].append(product_id)

    if current_user["user_id"] not in product["wishlister_users"]:
        product["wishlister_users"].append(current_user["user_id"])

    # Save the updated data
    save_data(users, brands, products)

    return (
        jsonify(
            {"message": f'Product {product["name"]} has been added to your wish list'}
        ),
        200,
    )

@app.route("/user/profile/following", methods=["GET"])
@token_required(users)
def get_user_following(current_user):
    """
    Get the user's wishlist and followed brands
    ---
    tags:
      - User Dashboard
    responses:
      200:
        description: Returns wishlist and followed brands
      403:
        description: Unauthorized
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return (
            jsonify({"error": "Admins do not have wishlists or followed brands"}),
            403,
        )

    wishlist_items = [
        products[pid] for pid in current_user.get("wish_list", []) if pid in products
    ]
    followed_brands = [
        brands[bid] for bid in current_user.get("followed_brand", []) if bid in brands
    ]

    return (
        jsonify({"wishlist": wishlist_items, "followingBrands": followed_brands}),
        200,
    )

@app.route("/user/wishlist/<string:product_id>", methods=["DELETE"])
@token_required(users)
def remove_from_wishlist(current_user, product_id):
    """
    Remove a product from the user's wish list by product ID
    ---
    tags:
      - User Dashboard
    parameters:
      - name: product_id
        in: path
        type: string
        required: true
        description: "The ID of the product to remove from the wish list"
    responses:
      200:
        description: Product removed from wish list successfully
      400:
        description: Product ID not in the wish list
      403:
        description: Admins cannot remove products from wish lists
      404:
        description: Product not found
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins cannot remove products from wish lists"}), 403

    # Check if the product_id is valid
    product = products.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Check if the product is in the user's wish_list
    if product_id not in current_user["wish_list"]:
        return jsonify({"error": "Product is not in your wish list"}), 400

    # Remove the product_id from the wish_list
    current_user["wish_list"].remove(product_id)

    if current_user["user_id"] in product["wishlister_users"]:
        product["wishlister_users"].remove(current_user["user_id"])

    # Save the updated data
    save_data(users, brands, products)

    return (
        jsonify(
            {
                "message": f'Product {product["name"]} has been removed from your wish list'
            }
        ),
        200,
    )

@app.route('/user/notifications', methods=['GET'])
@token_required(users)
def get_notifications(current_user):
    """
    Get the user's notifications
    ---
    tags:
      - User Dashboard
    responses:
      200:
        description: Returns the list of notifications
      403:
        description: Unauthorized
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins do not have notifications"}), 403

    notifications = current_user.get("notifications", [])
    return jsonify({"notifications": notifications}), 200


@app.route('/user/notifications/<string:notification_id>', methods=['PUT'])
@token_required(users)
def mark_notification_as_read(current_user, notification_id):
    """
    Mark a notification as read
    ---
    tags:
      - User Dashboard
    parameters:
        - name: notification_id
          in: path
          type: string
          required: true
          description: "The ID of the notification to mark as read"
    responses:
      200:
        description: Notification marked as read
      404:
        description: Notification not found
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins do not have notifications"}), 403

    notifications = current_user.get("notifications", [])
    for notification in notifications:
        if notification["id"] == notification_id:
            notification["status"] = "read"
            save_data(users, brands, products)  # 保存更新后的数据
            return jsonify({"message": "Notification marked as read"}), 200

    return jsonify({"error": "Notification not found"}), 404

@app.route('/user/notifications/mark-all-read', methods=['PUT'])
@token_required(users)
def mark_all_notifications_as_read(current_user):
    """
    Mark all notifications as read
    ---
    tags:
      - User Dashboard
    responses:
      200:
        description: All notifications marked as read
      403:
        description: Unauthorized
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins do not have notifications"}), 403

    notifications = current_user.get("notifications", [])
    for notification in notifications:
        notification["status"] = "read"
    save_data(users, brands, products)  

    return jsonify({"message": "All notifications marked as read"}), 200

@app.route('/user/notifications/<string:notification_id>', methods=['DELETE'])
@token_required(users)
def delete_notification(current_user, notification_id):
    """
    Delete a notification
    ---
    tags:
      - User Dashboard
    parameters:
        - name: notification_id
          in: path
          type: string
          required: true
          description: "The ID of the notification to delete"
    responses:
      200:
        description: Notification deleted successfully
      404:
        description: Notification not found
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins do not have notifications"}), 403

    notifications = current_user.get("notifications", [])
    # 查找要删除的通知
    for notification in notifications:
        if notification["id"] == notification_id:
            notifications.remove(notification)
            save_data(users, brands, products)  # 保存更新后的数据
            return jsonify({"message": "Notification deleted successfully"}), 200

    return jsonify({"error": "Notification not found"}), 404

@app.route("/user/follow_subcategory/<string:subcategory>", methods=["POST"])
@token_required(users)
def follow_subcategory(current_user, subcategory):
    """
    Follow a new subcategory by name
    ---
    tags:
      - User Dashboard
    parameters:
      - name: subcategory
        in: path
        type: string
        required: true
        description: "The name of the subcategory to follow"
    responses:
      200:
        description: Subcategory followed successfully
      400:
        description: Subcategory not specified
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins cannot follow subcategories"}), 403

    if "followed_subcategories" not in current_user:
        current_user["followed_subcategories"] = []

    if subcategory not in current_user["followed_subcategories"]:
        current_user["followed_subcategories"].append(subcategory)
        save_data(users, brands, products)

    return jsonify({"message": f"Followed subcategory: {subcategory}"}), 200


@app.route("/user/unfollow_subcategory/<string:subcategory>", methods=["POST"])
@token_required(users)
def unfollow_subcategory(current_user, subcategory):
    """
    Unfollow a subcategory by name
    ---
    tags:
      - User Dashboard
    parameters:
      - name: subcategory
        in: path
        type: string
        required: true
        description: "The name of the subcategory to unfollow"
    responses:
      200:
        description: Subcategory unfollowed successfully
      400:
        description: Subcategory not followed
    security:
      - Bearer: []
    """
    if current_user["is_admin"]:
        return jsonify({"error": "Admins cannot unfollow subcategories"}), 403

    if "followed_subcategories" not in current_user or subcategory not in current_user["followed_subcategories"]:
        return jsonify({"error": "Subcategory not followed"}), 400

    current_user["followed_subcategories"].remove(subcategory)
    save_data(users, brands, products)

    return jsonify({"message": f"Unfollowed subcategory: {subcategory}"}), 200

@app.route('/static/product_images/<path:filename>')
def serve_product_image(filename):
    return send_from_directory('/app/backend/static/product_images', filename)


@app.route('/admin/metrics', methods=['GET'])
@token_required(users)
def get_metrics(current_user):
    """
    Get Top Metrics (Admin Only)
    ---
    tags:
      - Metrics
    security:
      - Bearer: []
    responses:
      200:
        description: Top metrics retrieved successfully
        content:
          application/json:
            example: {
              "top_brands_followed": [{"id": "354117646", "name": "Nike", "count": 50}],
              "top_items_wishlisted": [{"id": "12345", "name": "Product A", "count": 45}],
              "top_products_clicks": [{"id": "67890", "name": "Product B", "click_count": 120}],
              "top_products_clickthroughs": [{"id": "54321", "name": "Product C", "click_through_count": 100}]
            }
      403:
        description: Unauthorized access for non-admin users
        content:
          application/json:
            example: {
              "error": "Only admin users can access metrics."
            }
    """
    if not current_user["is_admin"]:
        return jsonify({"error": "Only admin users can access metrics."}), 403

    # Top brands followed by users
    brand_follow_counts = {}
    for user_data in users.values():
        followed_brands = user_data.get('followed_brand', [])
        if followed_brands:
            for brand_id in followed_brands:
                brand = brands.get(brand_id, {})
                brand_name = brand.get("name", "Unknown Brand")
                brand_follow_counts[brand_id] = {
                    "id": brand_id,
                    "name": brand_name,
                    "count": brand_follow_counts.get(brand_id, {}).get("count", 0) + 1
                }
    top_brands_followed = sorted(
        brand_follow_counts.values(),
        key=lambda x: x["count"], reverse=True
    )[:20]

    # Top items wishlisted by users
    wish_count = {}
    for user_data in users.values():
        wish_list = user_data.get('wish_list', [])
        if wish_list:
            for product_id in wish_list:
                product = products.get(product_id, {})
                product_name = product.get("name", "Unknown Product")
                wish_count[product_id] = {
                    "id": product_id,
                    "name": product_name,
                    "count": wish_count.get(product_id, {}).get("count", 0) + 1
                }
    top_items_wishlisted = sorted(
        wish_count.values(),
        key=lambda x: x["count"], reverse=True
    )[:20]

    # Top products by clicks
    top_products_clicks = sorted(
        [{"id": pid, "name": pdata.get("name", "Unknown Product"), "click_count": pdata.get("click_count", 0)}
         for pid, pdata in products.items() if pdata and pdata.get("click_count", 0) > 0],
        key=lambda x: x["click_count"], reverse=True
    )[:20]

    # Top products by clickthroughs
    top_products_clickthroughs = sorted(
        [{"id": pid, "name": pdata.get("name", "Unknown Product"), "click_through_count": pdata.get("click_through_count", 0)}
         for pid, pdata in products.items() if pdata and pdata.get("click_through_count", 0) > 0],
        key=lambda x: x["click_through_count"], reverse=True
    )[:20]

    # Construct the response
    response = {
        "top_brands_followed": top_brands_followed,
        "top_items_wishlisted": top_items_wishlisted,
        "top_products_clicks": top_products_clicks,
        "top_products_clickthroughs": top_products_clickthroughs
    }

    return jsonify(response), 200


@app.route("/")
def index():
    return redirect("/apidocs")


# Save and load the database on server startup
if __name__ == "__main__":
    load_data(users, brands, products)
    notification_thread = threading.Thread(target=schedule_periodic_notifications, args=(app,))
    notification_thread.daemon = True
    notification_thread.start()
    app.run(debug=True, host="0.0.0.0", port=9900)
