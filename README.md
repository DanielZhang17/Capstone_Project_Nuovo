# capstone-project-2024-t3-9900w19aavocadogiant
capstone-project-2024-t3-9900w19aavocadogiant created by GitHub Classroom
# Nuovo
Nuovo is a web application that is a marketplace which displays products from various brands and users can set their preferences for receiving product updates and purchase the product they like on retailer's website.  

Live Demo: [Here](https://nuovo.anranz.xyz)   

Test admin account `111@gmail.com `  

Test Password `111`  

You may create your own account to check out user account experience.
## Installation
Because this is a docker compose application, please make sure that you have Docker installed on your system.  

### Step 1: Clone the project
```
git clone https://github.com/unsw-cse-comp99-3900/capstone-project-2024-t3-9900w19aavocadogiant
cd capstone-project-2024-t3-9900w19aavocadogiant/
```
### Step 2: Download static assets (Optional)
For loading the images properly, please download the entire folder from Google Drive [here](https://drive.google.com/drive/folders/1SDrCXYRh-SDNg9yEwkC-0CHyYe6QoAo7) and put the unziped folder under `capstone-project-2024-t3-9900w19aavocadogiant/backend/static`.
### Step 3: Build the docker container
```
docker compose build
```
### Step 4: Start the docker compose applicaton
```
docker compose up
```
This will start the docker containers and show the logs in the terminal window, to have it running in the background, add `-d` option below to run the application as deamon.  
After that the website can be accessed at `http://localhost:3000`  
The API docs can be accessed at `http://localhost:9900`

## Backend testing
### Step 1: Build the docker container
```
docker compose build
```
### Step 2: Start the docker compose applicaton
```
docker compose up
```
### Step 3: Strat the python testing file in backend folder
```
python3 user_authenticator.py
python3 brand_function.py
python3 product_function.py
```