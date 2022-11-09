# NC Games API

## Welcome to my game API

### Description

The aim of this project was to build an api with accessible data stored within a postgreSQL database. 

The server can be used to access/ read <mark>reviews</mark>, <mark>categories</mark>, <mark>users</mark> and <mark>comments</mark>. It also has functionality to <mark>post</mark> new comments, <mark>update</mark> votes on reviews and <mark>delete</mark> comments.

This api has been built using Test Driven Development using the Jest testing framework. Other practices that have been used include pull requests and implementing new features on new branches.

### Hosting

The hosted version of this repo can be found here:

(https://dh-nc-games.herokuapp.com/api/)

### How to use this repo

#### Cloning the repo

In order to clone the repo you will need to fork it to youyr github. You can then clone the forked repo using the following command:

    git clone <forked repo url link>

#### Installing dependencies

The following dependencies have been used to build this project:
- cors
- dotenv
- express
- pg
- pg-format
- jest
- jest-extended
- jest-sorted
- supertest

Use the following command to install the dependencies:

    npm i

#### Environment variables

In order to run the files you will need to create two .env files. These files will allow the creation of the test and development data.

1. Create a .env.test file.

Inside this add PGDATABASE=nc_games_test

This will create the test database.

2. Create a .env.development file.

Inside, add PGDATABASE=nc_games

This will create the main development database.

These files will both need to be added to a .gitignore file in order to prevent them being committed to github.
To ignore both you can add .env.* in the .gitignore file. This will ignore all .env files.
