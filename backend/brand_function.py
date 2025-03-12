from flask import request, jsonify
from helper import save_data, generateId, token_required
import base64


def add_brand(users, products, brands):
    @token_required(users)
    def add_brand_route(current_user):
        """
        Add a new brand (Admin only)
        ---
        tags:
          - Brands
        parameters:
          - name: body
            in: body
            schema:
              type: object
              required:
                - name
                - description
                - logo
              properties:
                name:
                  type: string
                  example: "Nike"
                description:
                  type: string
                  example: "This brand is fire"
                logo:
                  type: string
                  description: "Base64 encoded image data of the logo"
                  example: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST..."
        responses:
          200:
            description: Brand added successfully
          400:
            description: Missing required fields or invalid logo format
          403:
            description: Unauthorized
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can add brands"}), 403

        data = request.get_json()

        if not all(key in data for key in ["name", "description", "logo"]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            base64.b64decode(data["logo"], validate=True)
        except base64.binascii.Error:
            return jsonify({"error": "Invalid logo format. Expected base64 encoded image data."}), 400

        current_ids = [str(brand["brand_id"]) for brand in brands.values()]
        brand_id = generateId(current_ids)

        brands[brand_id] = {
            "brand_id": brand_id,
            "name": data["name"],
            "description": data["description"],
            "logo": data["logo"],
            "product_list": [],
            "followers_list": [],
        }

        save_data(users, brands, products)
        return jsonify({"message": "Brand added successfully", "brand_id": brand_id}), 200

    return add_brand_route


def delete_brand(users, products, brands):
    @token_required(users)
    def delete_brand_route(current_user, brand_id):
        """
        Delete a brand (Admin only)
        ---
        tags:
          - Brands
        parameters:
          - name: brand_id
            in: path
            type: string
            required: true
            description: "The ID of the brand to delete"
        responses:
          200:
            description: Brand deleted successfully
          403:
            description: Unauthorized
          404:
            description: Brand not found
          400:
            description: Cannot delete brand; it is associated with existing products
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can delete brands"}), 403

        if brand_id not in brands:
            return jsonify({"error": "Brand not found"}), 404

        for product in products.values():
            if product["brand_id"] == brand_id:
                return jsonify({"error": "Cannot delete brand; it is associated with existing products"}), 400

        del brands[brand_id]
        save_data(users, brands, products)
        return jsonify({"message": "Brand deleted successfully"}), 200

    return delete_brand_route


def edit_brand(users, products, brands):
    @token_required(users)
    def edit_brand_route(current_user, brand_id):
        """
        Edit a brand (Admin only)
        ---
        tags:
          - Brands
        parameters:
          - name: brand_id
            in: path
            type: string
            required: true
            description: "The ID of the brand to edit"
          - name: body
            in: body
            schema:
              type: object
              required:
                - name
                - description
              properties:
                name:
                  type: string
                  example: "Adidas"
                description:
                  type: string
                  example: "This is a good brand"
                logo:
                  type: string
                  description: "Base64 encoded image data of the logo (optional)"
                  example: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST..."
        responses:
          200:
            description: Brand edited successfully
          403:
            description: Unauthorized
          404:
            description: Brand not found
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can edit brands"}), 403

        if brand_id not in brands:
            return jsonify({"error": "Brand not found"}), 404

        data = request.get_json()

        if "name" not in data or "description" not in data:
            return jsonify({"error": "Name and description are required fields."}), 400

        brands[brand_id]["name"] = data["name"]
        brands[brand_id]["description"] = data["description"]

        if "logo" in data:
            try:
                base64.b64decode(data["logo"], validate=True)
                brands[brand_id]["logo"] = data["logo"]
            except base64.binascii.Error:
                return jsonify({"error": "Invalid logo format. Expected base64 encoded image data."}), 400

        save_data(users, brands, products)
        return jsonify({"message": "Brand updated successfully"}), 200

    return edit_brand_route


def get_all_brands(brands):
    def get_all_brands_route():
        """
        Get all brands (Admin and User)
        ---
        tags:
          - Brands
        responses:
          200:
            description: Returns a list of all brands
        """
        return jsonify({"brands": list(brands.values())}), 200

    return get_all_brands_route


def get_single_brand(brands):
    def get_single_brand_route(brand_id):
        """
        Get a single brand by ID (Admin and User)
        ---
        tags:
          - Brands
        parameters:
          - name: brand_id
            in: path
            type: string
            required: true
            description: "The ID of the brand to retrieve"
        responses:
          200:
            description: Returns a single brand
          404:
            description: Brand not found
        """
        if brand_id not in brands:
            return jsonify({"error": "Brand not found"}), 404
        brand_data = brands[brand_id]
        brand_data["followers_count"] = len(brand_data.get("followers_list", []))
        return jsonify(brand_data), 200

    return get_single_brand_route


def follow_brand(users, products, brands):
    @token_required(users)
    def follow_brand_route(current_user, brand_id):
        """
        Follow a new brand by brand ID
        ---
        tags:
          - User Dashboard
        parameters:
          - name: brand_id
            in: path
            type: string
            required: true
            description: "The ID of the brand to follow"
        responses:
          200:
            description: Brand followed successfully
          403:
            description: Admins cannot follow brands
          404:
            description: Brand not found
          409:
            description: Brand already followed
        security:
          - Bearer: []
        """
        if current_user["is_admin"]:
            return jsonify({"error": "Admins cannot follow brands"}), 403

        brand = brands.get(brand_id)
        if not brand:
            return jsonify({"error": "Brand not found"}), 404

        if brand_id in current_user["followed_brand"]:
            return jsonify({"error": "Brand is already followed"}), 409

        current_user["followed_brand"].append(brand_id)
        if current_user["user_id"] not in brand.get("followers_list", []):
            brand.setdefault("followers_list", []).append(current_user["user_id"])

        save_data(users, brands, products)
        return jsonify({"message": f'You are now following {brand["name"]}'}), 200

    return follow_brand_route


def unfollow_brand(users, products, brands):
    @token_required(users)
    def unfollow_brand_route(current_user, brand_id):
        """
        Unfollow a brand by brand ID
        ---
        tags:
          - User Dashboard
        parameters:
          - name: brand_id
            in: path
            type: string
            required: true
            description: "The ID of the brand to unfollow"
        responses:
          200:
            description: Brand unfollowed successfully
          403:
            description: Admins cannot unfollow brands
          404:
            description: Brand not found
          400:
            description: Brand not followed
        security:
          - Bearer: []
        """
        if current_user["is_admin"]:
            return jsonify({"error": "Admins cannot unfollow brands"}), 403

        brand = brands.get(brand_id)
        if not brand:
            return jsonify({"error": "Brand not found"}), 404

        if brand_id not in current_user["followed_brand"]:
            return jsonify({"error": f'You are not following {brand["name"]}'}), 400

        current_user["followed_brand"].remove(brand_id)
        if current_user["user_id"] in brand.get("followers_list", []):
            brand["followers_list"].remove(current_user["user_id"])

        save_data(users, brands, products)
        return jsonify({"message": f'You have unfollowed {brand["name"]}'}), 200

    return unfollow_brand_route
