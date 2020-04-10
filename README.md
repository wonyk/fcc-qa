## Anonymous Message Board (AMB)

This project is an anonymous messaging board for anyone to be able to contribute to new threads to any board and to post any reply to all threads.

It has fulfilled all the requirements of the [Free Code Camp Information Security and Quality Assurance Project #5](https://www.freecodecamp.org/learn/information-security-and-quality-assurance/information-security-and-quality-assurance-projects/anonymous-message-board)

### Getting Started

To begin, you will need the following prerequesites:
1. NodeJS 10.15.x and above
2. A MongoDB installation (you may just select installing the tools for Mongorestore and Mongodump)
3. MongoDB Atlas (recommended) DBaaS set up
4. Prepare a random string for the DB name of the TEST DB.

You may follow the instructions to set up the project:
```
1. git clone or download this project
2. set up .env file: NODE_ENV, MONGO_URL, MONGO_URL_TEST, PORT
3. npm install
4. npm start
5. The project will be ready at localhost:PORT
```

### Testing

For testing, you will need to set NODE_ENV to 'test'. For it to work, you will need to set up the database using the following commands:
```
mongorestore --host <hostname1><:port>,<hostname2><:port>,<...> --ssl --username <username> --password <password> --authenticationDatabase admin --drop --nsTo <random DB string from step 4>.* --nsFrom 'anon-board.*'
```
You may get most of these details from the "Command Line Tools" tab while using MongoDB Atlas DBaaS.

### Acknowledgments

I would like to thank MDN and W3Schools for their long-time trusted resources for all the front-end web development tools.

Also, I am grateful that [Spectre CSS](https://picturepan2.github.io/spectre/) is able to provide me with such an incredible css framework to make this project faster and refined. Moreover, the icons included are simple yet beautifully designed.

Lastly, I am thankful for [Autoprefixer](https://autoprefixer.github.io/) for some level of CSS support.

### Browser Support

The project has been tested to work on Firefox 76.0+ (beta), Chrome 80+, Edge 80+.

However, IE is not supported since ES6+ syntax is used and I did not incorporate any polyfill or Babel to allow it to work in IE.



