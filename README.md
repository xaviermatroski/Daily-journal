# Blogging Website with Node.js, MongoDB, and AWS Deployment
This project is a simple blogging website built using Node.js, MongoDB, and the Passport module for user authorization. The website allows users to create and read. It’s hosted on AWS and deployed using render.com.
> website link: https://daily-journal-p1xq.onrender.com/

## Features
1. Authentication: Users can sign up, log in, and to create blogs.
2. Blog Entries: Create and read.
3. Deployment: The website is hosted on AWS and deployed via render.com.

## Compose Section
To access the compose section of the website, follow these steps:

1. If you are already logged in:
    - Visit home_address/compose.
    - You will be directed to the compose page.
2. If you are not logged in:
    - You will be taken to the register page.
    - After registering and logging in, visit home_address/compose.

## Getting Started
1. Clone this repository.

2. Install dependencies.
    ```
      npm install
    ```
4. Set up your MongoDB connection string.
    - Create a .env file in the root directory.
    - Add your MongoDB connection string:
    - Add these lines in .env
    ```
      URL=YOUR_MONGODB_CONNECTION_STRING
    ```
5. Run the application.
    ```
      nodemon app.js
    ```
