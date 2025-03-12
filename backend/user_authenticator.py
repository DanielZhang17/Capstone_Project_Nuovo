from flask import request, jsonify
from helper import save_data, generateId, generate_token, token_required


def register(users, products, brands):
    def register_user():
        """
        Register a new user (Admin or Normal User)
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
                - password
                - name
                - is_admin
              properties:
                email:
                  type: string
                  example: "123@gmail.com"
                password:
                  type: string
                  example: "123"
                name:
                  type: string
                  example: "push"
                is_admin:
                  type: boolean
                  description: "Set to True for Admin, False for normal user"
                  example: False
        responses:
          200:
            description: User registered successfully
          400:
            description: Missing fields or user already registered
        """
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        is_admin = data.get("is_admin")

        current_ids = [str(user["user_id"]) for user in users.values()]
        user_id = generateId(current_ids)

        if not email or not password or not name or is_admin is None:
            return jsonify({"error": "Missing fields"}), 400

        if email in users:
            return jsonify({"error": "Email already registered"}), 400

        users[email] = {
            "user_id": user_id,
            "name": name,
            "email": email,
            "password": password,
            "is_admin": is_admin,
            "status": "logout",
            "followed_brand": [] if not is_admin else None,
            "wish_list": [] if not is_admin else None,
            "notifications": [] if not is_admin else None,
        }

        save_data(users, brands, products)
        token = generate_token(email, is_admin)
        return jsonify({"token": token})

    return register_user


def delete_user(users, products, brands):
    @token_required(users)
    def delete_user_route(current_user):
        """
        Delete the current user's account (Admin and Normal User)
        ---
        tags:
          - User Management
        responses:
          200:
            description: User deleted successfully
          404:
            description: User not found
          403:
            description: Unauthorized (Token missing or invalid)
        security:
          - Bearer: []
        """
        email = current_user["email"]

        user = users.get(email)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id = user["user_id"]

        for product in products.values():
            if user_id in product.get("wishlister_users", []):
                product["wishlister_users"].remove(user_id)

        for brand in brands.values():
            if user_id in brand.get("followers_list", []):
                brand["followers_list"].remove(user_id)

        del users[email]
        save_data(users, brands, products)
        return jsonify({"message": "User account deleted successfully"}), 200

    return delete_user_route


def login(users, products, brands):
    def login_user():
        """
        Login a user
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
                - password
              properties:
                email:
                  type: string
                  example: "123@gmail.com"
                password:
                  type: string
                  example: "123"
        responses:
          200:
            description: Login successful
          400:
            description: Invalid email or password
        """
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

        user = users.get(email)
        if not user or user["password"] != password:
            return jsonify({"error": "Invalid email or password"}), 400

        user["status"] = "login"
        save_data(users, brands, products)
        token = generate_token(email, user["is_admin"])
        return jsonify({"token": token})

    return login_user


def logout(users, blacklist, products, brands):
    @token_required(users)
    def logout_user(current_user):
        """
        Logout the current user
        ---
        tags:
          - User Authentication
        responses:
          200:
            description: Logout successful
          403:
            description: Token is missing or invalid
        security:
          - Bearer: []
        """
        token = request.headers.get("Authorization").replace("Bearer ", "")
        blacklist.add(token)
        current_user["status"] = "logout"
        save_data(users, brands, products)
        return jsonify({"message": "Successfully logged out"})

    return logout_user


def get_profile(users):
    @token_required(users)
    def get_profile_route(current_user):
        """
        Get the current user's profile information
        ---
        tags:
          - User Profile
        responses:
          200:
            description: Returns the user's profile information
          403:
            description: Unauthorized (if token is missing or invalid)
        security:
          - Bearer: []
        """
        return jsonify({
            "user_id": current_user["user_id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "is_admin": current_user["is_admin"],
            "followed_brand": current_user.get("followed_brand"),
            "wish_list": current_user.get("wish_list"),
            "notifications": current_user.get("notifications"),
        }), 200

    return get_profile_route


def edit_profile(users, products, brands):
    @token_required(users)
    def edit_profile_route(current_user):
        """
        Edit the current user's profile information (name or email)
        ---
        tags:
          - User Profile
        parameters:
          - name: body
            in: body
            schema:
              type: object
              properties:
                name:
                  type: string
                  example: "New Name"
                email:
                  type: string
                  example: "newemail@gmail.com"
        responses:
          200:
            description: Profile updated successfully
          400:
            description: Invalid data or email already in use
          403:
            description: Unauthorized (if token is missing or invalid)
        security:
          - Bearer: []
        """
        data = request.get_json()
        new_name = data.get("name")
        new_email = data.get("email")

        if new_email and new_email != current_user["email"]:
            if new_email in users:
                return jsonify({"error": "Email is already in use"}), 400

        if new_name:
            current_user["name"] = new_name
        if new_email:
            users[new_email] = users.pop(current_user["email"])
            current_user["email"] = new_email

        save_data(users, brands, products)
        return jsonify({"message": "Profile updated successfully"}), 200

    return edit_profile_route


def change_password(users, products, brands):
    @token_required(users)
    def change_password_route(current_user):
        """
        Change the current user's password
        ---
        tags:
          - User Authentication
        parameters:
          - name: body
            in: body
            schema:
              type: object
              properties:
                oldPassword:
                  type: string
                  example: "oldpassword123"
                newPassword:
                  type: string
                  example: "newpassword456"
        responses:
          200:
            description: Password changed successfully
          400:
            description: Invalid data or incorrect old password
          403:
            description: Unauthorized (if token is missing or invalid)
        security:
          - Bearer: []
        """
        data = request.get_json()
        old_password = data.get("oldPassword")
        new_password = data.get("newPassword")

        if current_user["password"] != old_password:
            return jsonify({"error": "Incorrect old password"}), 400

        current_user["password"] = new_password
        save_data(users, brands, products)
        return jsonify({"message": "Password changed successfully"}), 200

    return change_password_route
