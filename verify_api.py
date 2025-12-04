import requests
import json

BASE_URL = "http://localhost/E-commerce Fashion Store Mockup 2/api"

def test_products_api():
    print("Testing Products API...")
    
    # 1. Get all products
    response = requests.get(f"{BASE_URL}/products.php")
    if response.status_code == 200:
        print("GET /products.php: Success")
        products = response.json()
        print(f"Found {len(products)} products")
    else:
        print(f"GET /products.php: Failed ({response.status_code})")
        return

    # 2. Create a product
    new_product = {
        "name": "Test Product",
        "price": 99.99,
        "category": "Test",
        "stock": 10,
        "image": "https://via.placeholder.com/150"
    }
    response = requests.post(f"{BASE_URL}/products.php", json=new_product)
    if response.status_code == 200:
        print("POST /products.php: Success")
        created_product = response.json()
        product_id = created_product.get("id")
        print(f"Created product ID: {product_id}")
    else:
        print(f"POST /products.php: Failed ({response.status_code})")
        print(response.text)
        return

    # 3. Update the product
    update_data = {"id": product_id, "price": 199.99}
    response = requests.put(f"{BASE_URL}/products.php", json=update_data)
    if response.status_code == 200:
        print("PUT /products.php: Success")
    else:
        print(f"PUT /products.php: Failed ({response.status_code})")
        print(response.text)

    # 4. Delete the product
    delete_data = {"id": product_id}
    response = requests.delete(f"{BASE_URL}/products.php", json=delete_data)
    if response.status_code == 200:
        print("DELETE /products.php: Success")
    else:
        print(f"DELETE /products.php: Failed ({response.status_code})")
        print(response.text)

def test_orders_api():
    print("\nTesting Orders API...")
    
    # 1. Get all orders
    response = requests.get(f"{BASE_URL}/orders.php")
    if response.status_code == 200:
        print("GET /orders.php: Success")
        orders = response.json()
        print(f"Found {len(orders)} orders")
        if len(orders) > 0:
            first_order_id = orders[0]['id']
            print(f"Testing update on order ID: {first_order_id}")
            
            # 2. Update order status
            update_data = {"id": first_order_id, "status": "entregado"}
            response = requests.put(f"{BASE_URL}/orders.php", json=update_data)
            if response.status_code == 200:
                print("PUT /orders.php: Success")
            else:
                print(f"PUT /orders.php: Failed ({response.status_code})")
                print(response.text)
    else:
        print(f"GET /orders.php: Failed ({response.status_code})")
        print(response.text)

if __name__ == "__main__":
    try:
        test_products_api()
        test_orders_api()
    except Exception as e:
        print(f"An error occurred: {e}")
