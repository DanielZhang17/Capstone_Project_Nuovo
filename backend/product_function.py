import os
import datetime
from flask import request, jsonify, send_from_directory
from helper import save_data, generateId, token_required, allowed_file

def get_products(products):
    def get_products_route():
        """
        Get products with optional filters and sorting (Admin and User)
        ---
        tags:
          - Products
        parameters:
          - name: main_category
            in: query
            type: array
            items:
              type: string
            required: false
            description: "Main categories (e.g., mens-shoes, mens-clothing)"
          - name: sub_category
            in: query
            type: array
            items:
              type: string
            required: false
            description: "Sub-categories (e.g., sneakers, t-shirts)"
          - name: color
            in: query
            type: array
            items:
              type: string
            required: false
            description: "Product colors (e.g., Khaki, Blue)"
          - name: brand_name
            in: query
            type: array
            items:
              type: string
            required: false
            description: "Brand names of the products"
          - name: size
            in: query
            type: array
            items:
              type: string
            required: false
            description: "Product sizes (e.g., S, M, L)"
          - name: min_price
            in: query
            type: number
            required: false
            description: "Minimum price of the product"
          - name: max_price
            in: query
            type: number
            required: false
            description: "Maximum price of the product"
          - name: keyword
            in: query
            type: string
            required: false
            description: "Keyword to search in product name"
          - name: status
            in: query
            type: array
            items:
              type: string
            required: false
            description: "Product statuses (e.g., new, on sale, re-stock)"
          - name: stock
            in: query
            type: string
            required: false
            description: "Availability of stock ('In stock', 'Re-stock', or 'Out of Stock')"
          - name: sort_by_popularity
            in: query
            type: boolean
            required: false
            description: "Sort products by popularity based on wishlisted count"
          - name: sort_by_price
            in: query
            type: string
            enum: ["asc", "desc"]
            required: false
            description: "Sort by price, ascending or descending"
          - name: sort_by_new
            in: query
            type: string
            enum: ["asc", "desc"]
            required: false
            description: "Sort by creation date, ascending or descending"
        responses:
          200:
            description: List of products matching the filters
          404:
            description: No products found for the given filters
        """
        from helper import get_query_list

        main_categories = get_query_list("main_category")
        sub_categories = get_query_list("sub_category")
        colors = get_query_list("color")
        brand_names = get_query_list("brand_name")
        sizes = get_query_list("size")
        statuses = get_query_list("status")
        stock = request.args.get("stock")
        min_price = request.args.get("min_price", type=float)
        max_price = request.args.get("max_price", type=float)
        keyword = request.args.get("keyword")
        sort_by_popularity = request.args.get("sort_by_popularity", "false").lower() == "true"
        sort_by_price = request.args.get("sort_by_price")
        sort_by_new = request.args.get("sort_by_new")

        filtered_products_set = {
            product["product_id"]: {
                "product_id": product["product_id"],
                "name": product["name"],
                "price": float(product["price"]),
                "previous_price": float(product["previous_price"]),
                "main_category": product["main_category"],
                "sub_category": product["sub_category"],
                "brand": product["brand"],
                "color": product["colour"],
                "size": product["size"],
                "first_image": (
                    product["picture_urls"][0] if product["picture_urls"] else None
                ),
                "time_created": product["time_created"],
                "wishlister_count": len(set(product.get("wishlister_users", []))),
                "product_url": product["product_url"],
                "stock": product["stock"],
                "status": product["status"],
                "click_count": product["click_count"],
                "click_through_count": product["click_through_count"]
            }
            for product in products.values()
            if (
                (not main_categories or any(cat.lower() in product["main_category"].lower() for cat in main_categories))
                and (not sub_categories or any(sub.lower() in product["sub_category"].lower() for sub in sub_categories))
                and (not colors or any(c.lower() in product["colour"].lower() for c in colors))
                and (not brand_names or any(b.lower() in product["brand"].lower() for b in brand_names))
                and (not sizes or any(
                    size.split(":")[0] in sizes and size.split(":")[1] == "1"
                    for size in product["size"]
                ))
                and (not statuses or any(status.lower() == product["status"].lower() for status in statuses))
                and (not stock or product["stock"].lower() == stock.lower())
                and (not min_price or float(product["price"]) >= min_price)
                and (not max_price or float(product["price"]) <= max_price)
                and (not keyword or keyword.lower() in product["name"].lower())
            )
        }

        filtered_products = list(filtered_products_set.values())

        if sort_by_popularity:
            filtered_products.sort(key=lambda p: p["wishlister_count"], reverse=True)
        elif sort_by_price:
            filtered_products.sort(key=lambda p: p["price"], reverse=(sort_by_price == "desc"))
        elif sort_by_new:
            filtered_products.sort(key=lambda p: p["time_created"], reverse=(sort_by_new == "desc"))

        if not filtered_products:
            return jsonify({"message": "No products found"}), 404

        return jsonify(filtered_products), 200

    return get_products_route


def get_single_product(products):
    def get_single_product_route(product_id):
        """
        Get a single product by ID (Admin and User)
        ---
        tags:
          - Products
        parameters:
          - name: product_id
            in: path
            type: string
            required: true
            description: "The ID of the product to retrieve"
        responses:
          200:
            description: Returns a single product
          404:
            description: Product not found
        """
        product = products.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product), 200

    return get_single_product_route


def add_product(users, products, brands):
    @token_required(users)
    def add_product_route(current_user):
        """
        Add a new product (Admin only)
        ---
        tags:
          - Products
        parameters:
          - name: body
            in: body
            schema:
              type: object
              required:
                - name
                - price
                - previous_price
                - main_category
                - sub_category
                - colour
                - brand_id
                - product_url
                - status
                - stock
                - size
              properties:
                name:
                  type: string
                  description: "The name of the product"
                  example: "Nike Air Max 97"
                price:
                  type: number
                  description: "The current price of the product"
                  example: 99999.0
                previous_price:
                  type: number
                  description: "The original price before any discount or sale"
                  example: 99999.0
                main_category:
                  type: string
                  description: "The main category of the product"
                  example: "mens-shoes"
                sub_category:
                  type: string
                  description: "The sub-category of the product"
                  example: "sneakers"
                colour:
                  type: string
                  description: "The colour of the product"
                  example: "White"
                brand_id:
                  type: string
                  description: "The unique ID of the associated brand"
                  example: "354117646"
                product_url:
                  type: string
                  description: "The URL to the product page"
                  example: "https://example.com/nike-air-max-97"
                status:
                  type: string
                  enum: ["New", "Old", "On Sale", "Not Sale"]
                  description: "The current status of the product"
                  example: "On Sale"
                stock:
                  type: string
                  enum: ["In Stock", "Out of Stock", "Re-Stock"]
                  description: "The stock status of the product"
                  example: "In Stock"
                size:
                  type: array
                  description: "List of sizes with availability"
                  items:
                    type: string
                  example: ["41:1", "42:1", "43:0", "44:1", "45:1", "46:0"]
        responses:
          200:
            description: Product added successfully
          400:
            description: Invalid data
          403:
            description: Unauthorized (only admins can add products)
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can add products"}), 403

        data = request.get_json()
        product_id = generateId([str(product["product_id"]) for product in products.values()])
        current_time = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10))).strftime('%Y-%m-%dT%H:%M:%S%z')[:-2] + ':' + datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10))).strftime('%z')[-2:]

        new_product = {
            "product_id": product_id,
            "name": data["name"],
            "product_url": data["product_url"],
            "brand_id": data["brand_id"],
            "brand": brands[data["brand_id"]]["name"] if data["brand_id"] in brands else "Unknown",
            "main_category": data["main_category"],
            "sub_category": data["sub_category"],
            "size": data["size"],
            "colour": data["colour"],
            "price": str(data["price"]),
            "previous_price": str(data["previous_price"]),
            "time_created": current_time,
            "time_modified": current_time,
            "stock": data["stock"],
            "status": data["status"],
            "wishlister_users": [],
            "picture_urls": [],
            "click_count": 0,
            "click_through_count": 0
        }

        products[product_id] = new_product

        brand = brands.get(data["brand_id"])
        if brand:
            brand["product_list"].append(product_id)
        else:
            return jsonify({"error": "Brand not found"}), 404

        save_data(users, brands, products)

        return jsonify({"message": "Product added successfully", "product_id": product_id}), 200

    return add_product_route


def upload_product_image(users, products, brands):
    @token_required(users)
    def upload_product_image_route(current_user, product_id):
        """
        Upload an image for a specific product (Admin only)
        ---
        tags:
          - Products
        parameters:
          - name: product_id
            in: path
            type: string
            required: true
            description: "The ID of the product to upload images for"
          - name: file
            in: formData
            type: file
            required: true
            description: "The image file to upload"
        responses:
          200:
            description: Image uploaded successfully
          400:
            description: Invalid file type, more than 4 images, or no file selected
          403:
            description: Unauthorized (only admins can upload images)
          404:
            description: Product not found
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can upload images"}), 403

        product = products.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        picture_folder = f"/app/backend/static/product_images/{product_id}"
        os.makedirs(picture_folder, exist_ok=True)

        for i in range(1, 5):
            filename = f"image_{i}.jpg"
            filepath = os.path.join(picture_folder, filename)
            if not os.path.exists(filepath):
                break
        else:
            return jsonify({"error": "Cannot upload more than 4 images"}), 400

        file = request.files.get("file")
        if not file or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type or no file selected"}), 400

        file.save(filepath)

        product_url = f"/api/static/product_images/{product_id}/{filename}"
        if product_url not in product["picture_urls"]:
            product["picture_urls"].append(product_url)
        save_data(users, brands, products)

        return jsonify({"message": "Image uploaded successfully", "filename": filename}), 200

    return upload_product_image_route


def delete_product_image(users, products, brands):
    @token_required(users)
    def delete_product_image_route(current_user, product_id):
        """
        Delete an image for a specific product (Admin only)
        ---
        tags:
          - Products
        parameters:
          - name: product_id
            in: path
            type: string
            required: true
            description: "The ID of the product to delete an image for"
          - name: imageUrl
            in: body
            type: string
            required: true
            description: "The URL of the image to delete"
        responses:
          200:
            description: Image deleted successfully
          400:
            description: Invalid or missing image URL
          403:
            description: Unauthorized (only admins can delete images)
          404:
            description: Product or image not found
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can delete images"}), 403

        product = products.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        data = request.get_json()
        image_url = data.get("imageUrl")
        if not image_url:
            return jsonify({"error": "Image URL is required"}), 400

        filename = os.path.basename(image_url)
        picture_folder = f"/app/backend/static/product_images/{product_id}"
        filepath = os.path.join(picture_folder, filename)

        if os.path.exists(filepath):
            os.remove(filepath)
        else:
            return jsonify({"error": "Image file not found"}), 404

        if image_url in product["picture_urls"]:
            product["picture_urls"].remove(image_url)
            save_data(users, brands, products)

        return jsonify({"message": "Image deleted successfully"}), 200

    return delete_product_image_route


def delete_product(users, products, brands):
    @token_required(users)
    def delete_product_route(current_user, product_id):
        """
        Delete a product (Admin only)
        ---
        tags:
          - Products
        parameters:
          - name: product_id
            in: path
            type: string
            required: true
            description: "The ID of the product to delete"
        responses:
          200:
            description: Product deleted successfully
          403:
            description: Unauthorized
          404:
            description: Product not found
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can delete products"}), 403

        product = products.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        brand = brands.get(product["brand_id"])
        if brand and product_id in brand["product_list"]:
            brand["product_list"].remove(product_id)

        del products[product_id]

        picture_folder = f"/app/backend/static/product_images/{product_id}"
        if os.path.exists(picture_folder):
            import shutil
            shutil.rmtree(picture_folder)

        save_data(users, brands, products)

        return jsonify({"message": "Product deleted successfully"}), 200

    return delete_product_route


def edit_product(users, products, brands):
    @token_required(users)
    def edit_product_route(current_user, product_id):
        """
        Edit a product (Admin only)
        ---
        tags:
          - Products
        parameters:
          - name: product_id
            in: path
            required: true
            type: string
            description: "The ID of the product to be edited"
          - name: body
            in: body
            schema:
              type: object
              required:
                - name
                - price
                - previous_price
                - main_category
                - sub_category
                - colour
                - brand_id
                - product_url
                - status
                - stock
                - size
              properties:
                name:
                  type: string
                  description: "The name of the product"
                  example: "Nike Air Max 97"
                price:
                  type: number
                  description: "The current price of the product"
                  example: 66666.0
                previous_price:
                  type: number
                  description: "The original price before any discount or sale"
                  example: 66666.0
                main_category:
                  type: string
                  description: "The main category of the product"
                  example: "womens-shoes"
                sub_category:
                  type: string
                  description: "The sub-category of the product"
                  example: "casual-shoes"
                colour:
                  type: string
                  description: "The colour of the product"
                  example: "White"
                brand_id:
                  type: string
                  description: "The unique ID of the associated brand"
                  example: "354117646"
                product_url:
                  type: string
                  description: "The URL to the product page"
                  example: "https://example.com/nike-air-max-97"
                status:
                  type: string
                  enum: ["New", "Old", "On Sale", "Not Sale"]
                  description: "The current status of the product"
                  example: "On Sale"
                stock:
                  type: string
                  enum: ["In Stock", "Out of Stock", "Re-Stock"]
                  description: "The stock status of the product"
                  example: "In Stock"
                size:
                  type: array
                  description: "List of sizes with availability"
                  items:
                    type: string
                  example: ["35:1", "36:1", "37:0", "38:1", "39:1", "40:0"]
        responses:
          200:
            description: Product updated successfully
          404:
            description: Product not found
        security:
          - Bearer: []
        """
        if not current_user["is_admin"]:
            return jsonify({"error": "Only admins can edit products"}), 403

        product = products.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        data = request.get_json()
        wishlister_users = product.get("wishlister_users", [])

        product.update({
            "name": data["name"],
            "price": data["price"],
            "previous_price": data["previous_price"],
            "main_category": data["main_category"],
            "sub_category": data["sub_category"],
            "colour": data["colour"],
            "brand_id": data["brand_id"],
            "product_url": data["product_url"],
            "status": data["status"],
            "stock": data["stock"],
            "size": data["size"],
            "wishlister_users": wishlister_users,
            "time_modified": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10))).strftime('%Y-%m-%dT%H:%M:%S%z')[:-2] + ':' + datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10))).strftime('%z')[-2:]
        })

        save_data(users, brands, products)

        return jsonify({"message": "Product updated successfully"}), 200

    return edit_product_route
